<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

namespace theme_flexium\external;

use core_external\external_api;
use PHPUnit\Framework\Attributes\CoversClass;
use theme_flexium\local\catalog\filter_config;

/**
 * Tests for the web service saving the catalogue filter layout, and the filter sources and layout.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(save_filter_layout::class)]
#[CoversClass(filter_config::class)]
final class save_filter_layout_test extends \advanced_testcase {
    /**
     * Whether the optional "keywords" course custom field type is installed (it is not part of Moodle).
     *
     * @return bool
     */
    private static function has_keywords(): bool {
        return array_key_exists('keywords', \core_component::get_plugin_list('customfield'));
    }

    /**
     * Create course custom fields of several types and visibilities.
     *
     * @return \core_customfield\field_controller[] short name => field
     */
    private function create_fields(): array {
        $generator = $this->getDataGenerator()->get_plugin_generator('core_customfield');
        $categoryid = $generator->create_category()->get('id');
        $fields = [];
        foreach (
            [
            'level' => ['type' => 'select', 'configdata' => ['options' => "Beginner\nAdvanced"]],
            'venue' => ['type' => 'text'],
            'topics' => self::has_keywords() ? ['type' => 'keywords'] : null,
            'notes' => ['type' => 'textarea'],
            'hours' => ['type' => 'number'],
            'internal' => ['type' => 'select', 'configdata' => ['options' => "A\nB", 'visibility' => 1]],
            ] as $shortname => $record
        ) {
            if ($record === null) {
                continue;
            }
            $fields[$shortname] = $generator->create_field($record + ['categoryid' => $categoryid,
                'shortname' => $shortname, 'name' => ucfirst($shortname)]);
        }
        filter_config::reset_caches();
        return $fields;
    }

    /**
     * Only site administrators can save the layout.
     */
    public function test_requires_site_config(): void {
        $this->resetAfterTest();
        $this->setUser($this->getDataGenerator()->create_user());

        $this->expectException(\required_capability_exception::class);
        save_filter_layout::execute([['source' => 'category', 'expanded' => true]]);
    }

    /**
     * Sources: categories, tags and the filterable custom fields everybody can see.
     */
    public function test_available_sources(): void {
        $this->resetAfterTest();
        $this->create_fields();

        $sources = filter_config::get_available_sources();
        $expected = ['category', 'tag', 'customfield:level', 'customfield:venue'];
        if (self::has_keywords()) {
            $expected[] = 'customfield:topics';
        }
        $this->assertSame($expected, array_keys($sources));
        $this->assertSame('tree', $sources['category']['type']);
        $this->assertNull($sources['category']['field']);
        $this->assertSame('list', $sources['customfield:level']['type']);
        $this->assertSame('select', $sources['customfield:level']['fieldtype']);
        $this->assertSame('Level', $sources['customfield:level']['label']);

        // Without course tags, there is no tag source.
        set_config('usetags', 0);
        filter_config::reset_caches();
        $this->assertArrayNotHasKey('tag', filter_config::get_available_sources());
    }

    /**
     * Until an administrator saves, the layout has categories (expanded), select and keyword fields, then tags.
     */
    public function test_default_layout(): void {
        $this->resetAfterTest();
        $this->create_fields();

        $expected = array_values(array_filter([
            ['source' => 'category', 'expanded' => true, 'label' => ''],
            ['source' => 'customfield:level', 'expanded' => false, 'label' => ''],
            self::has_keywords() ? ['source' => 'customfield:topics', 'expanded' => false, 'label' => ''] : null,
            ['source' => 'tag', 'expanded' => false, 'label' => ''],
        ]));
        $this->assertSame($expected, filter_config::get_default_layout());
        $this->assertSame($expected, filter_config::get_layout());
        set_config('catalogfilters', '', 'theme_flexium');
        $this->assertSame($expected, filter_config::get_layout());
    }

    /**
     * An administrator saves a layout: unknown and duplicate sources dropped, labels cleaned, read back.
     */
    public function test_save(): void {
        $this->resetAfterTest();
        $this->create_fields();
        $this->setAdminUser();

        $result = save_filter_layout::execute([
            ['source' => 'customfield:venue', 'expanded' => true, 'label' => '  Where  '],
            ['source' => 'customfield:internal', 'expanded' => true],
            ['source' => 'customfield:notes', 'expanded' => false],
            ['source' => 'bogus', 'expanded' => false],
            ['source' => 'tag', 'expanded' => false, 'label' => str_repeat('x', 150)],
            ['source' => 'customfield:venue', 'expanded' => false, 'label' => 'Again'],
        ]);
        $result = external_api::clean_returnvalue(save_filter_layout::execute_returns(), $result);
        $expected = [
            ['source' => 'customfield:venue', 'expanded' => true, 'label' => 'Where'],
            ['source' => 'tag', 'expanded' => false, 'label' => str_repeat('x', 100)],
        ];
        $this->assertSame($expected, $result);
        $this->assertSame($expected, filter_config::get_layout());
        $this->assertSame($expected, json_decode(get_config('theme_flexium', 'catalogfilters'), true));

        // An empty layout is kept empty: no filters.
        $this->assertSame([], save_filter_layout::execute([]));
        $this->assertSame([], filter_config::get_layout());
    }

    /**
     * Stored layouts are cleaned when read: deleted fields and invalid entries dropped.
     */
    public function test_clean_layout(): void {
        $this->resetAfterTest();
        $fields = $this->create_fields();

        set_config('catalogfilters', json_encode([
            ['source' => 'customfield:level', 'expanded' => 1],
            ['source' => 'category'],
            'garbage',
            ['expanded' => true],
        ]), 'theme_flexium');
        $this->assertSame([
            ['source' => 'customfield:level', 'expanded' => true, 'label' => ''],
            ['source' => 'category', 'expanded' => false, 'label' => ''],
        ], filter_config::get_layout());

        \core_course\customfield\course_handler::create()->delete_field_configuration($fields['level']);
        filter_config::reset_caches();
        $this->assertSame(['category'], array_column(filter_config::get_layout(), 'source'));

        set_config('catalogfilters', 'not json', 'theme_flexium');
        $this->assertSame([], filter_config::get_layout());
        $this->assertSame([], filter_config::clean_layout(null));

        // Labels are plain text.
        $this->assertSame(
            [['source' => 'category', 'expanded' => false, 'label' => 'Where']],
            filter_config::clean_layout([['source' => 'category', 'label' => ' <b>Where</b> ']])
        );
    }
}
