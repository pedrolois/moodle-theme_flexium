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

namespace theme_flexium\local\catalog;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;

/**
 * Tests for the optional catalogue features.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(features::class)]
final class features_test extends \advanced_testcase {
    /**
     * Every definition is well formed: known type, choices for selects and lists, a valid default.
     */
    public function test_definitions_are_valid(): void {
        foreach (features::definitions() as $key => $definition) {
            $this->assertMatchesRegularExpression('/^[a-z]+$/', $key);
            $this->assertContains($definition['type'], ['bool', 'select', 'list', 'text'], $key);
            $this->assertIsString($definition['default'], $key);
            switch ($definition['type']) {
                case 'bool':
                    $this->assertContains($definition['default'], ['0', '1'], $key);
                    break;
                case 'select':
                    $this->assertContains($definition['default'], $definition['choices'], $key);
                    break;
                case 'list':
                    foreach (array_filter(explode(',', $definition['default'])) as $item) {
                        $this->assertContains($item, $definition['choices'], $key);
                    }
                    break;
            }
            // The default goes through clean() unchanged.
            $this->assertSame($definition['default'], features::clean($key, $definition['default']), $key);
        }
    }

    /**
     * Without stored values, every feature has its typed default.
     */
    public function test_get_all_defaults(): void {
        $this->resetAfterTest();
        $this->setAdminUser();

        $values = features::get_all();
        $this->assertSame(array_keys(features::definitions()), array_keys($values));
        $this->assertTrue($values['expandall']);
        $this->assertFalse($values['showemptyoptions']);
        $this->assertSame(['mycourses', 'new', 'startingsoon'], $values['quickfilters']);
        $this->assertSame('filter', $values['filtericon']);
        $this->assertSame('', $values['quicklabels']);
        $this->assertSame('default', $values['blockiconcolour']);
        $this->assertSame('sm', $values['blockiconsize']);
        $this->assertSame('top', $values['blockiconposition']);
        $this->assertTrue($values['quickview']);
        $this->assertTrue(features::get('navlink'));
    }

    /**
     * Stored values are decoded by type, and invalid stored values are cleaned.
     */
    public function test_get_all_decodes_stored_values(): void {
        $this->resetAfterTest();
        $this->setAdminUser();

        set_config('feature_expandall', '0', 'theme_flexium');
        set_config('feature_quickfilters', 'openenrol,bogus,favourites,openenrol', 'theme_flexium');
        set_config('feature_statusbadges', '', 'theme_flexium');
        set_config('feature_filtericon', 'nonexistent', 'theme_flexium');
        set_config('feature_blockiconcolour', 'danger', 'theme_flexium');
        set_config('feature_navlinktext', 'Our courses', 'theme_flexium');

        $this->assertFalse(features::get('expandall'));
        $this->assertSame(['openenrol', 'favourites'], features::get('quickfilters'));
        $this->assertSame([], features::get('statusbadges'));
        $this->assertSame('filter', features::get('filtericon'));
        $this->assertSame('danger', features::get('blockiconcolour'));
        $this->assertSame('Our courses', features::get('navlinktext'));
    }

    /**
     * Raw values and what clean() makes of them.
     *
     * @return array
     */
    public static function clean_provider(): array {
        return [
            'bool on' => ['progress', 'yes', '1'],
            'bool off' => ['progress', '0', '0'],
            'bool empty' => ['progress', '', '0'],
            'select valid' => ['blockiconsize', 'lg', 'lg'],
            'select invalid' => ['blockiconsize', 'xl', 'sm'],
            'select position' => ['blockiconposition', 'middle', 'middle'],
            'select colour invalid' => ['blockiconcolour', 'pink', 'default'],
            'list order kept, unknown and duplicates dropped' => ['listparts', 'footer, image,nope,image', 'footer,image'],
            'list empty' => ['listparts', '', ''],
            'text stripped' => ['bannertitle', '<b>Hello</b> world', 'Hello world'],
            'text shortened' => ['bannertext', str_repeat('a', 300), str_repeat('a', 255)],
        ];
    }

    /**
     * clean() returns a valid raw value for each type.
     *
     * @param string $key
     * @param string $value
     * @param string $expected
     */
    #[DataProvider('clean_provider')]
    public function test_clean(string $key, string $value, string $expected): void {
        $this->assertSame($expected, features::clean($key, $value));
    }

    /**
     * save() stores cleaned values, ignores unknown keys, logs changes and returns every raw value with breadcrumbs.
     */
    public function test_save(): void {
        global $DB;
        $this->resetAfterTest();
        $this->setAdminUser();

        $saved = features::save([
            'expandall' => '0',
            'defaultview' => 'list',
            'gridcolumns' => '7',
            'unknownfeature' => '1',
            'bc_style' => 'pills',
        ]);

        $this->assertSame('0', get_config('theme_flexium', 'feature_expandall'));
        $this->assertSame('list', get_config('theme_flexium', 'feature_defaultview'));
        $this->assertSame('auto', get_config('theme_flexium', 'feature_gridcolumns'));
        $this->assertFalse(get_config('theme_flexium', 'feature_unknownfeature'));
        $this->assertSame('pills', get_config('theme_flexium', 'bc_style'));

        $this->assertSame('0', $saved['expandall']);
        $this->assertSame('list', $saved['defaultview']);
        $this->assertSame('pills', $saved['bc_style']);
        $this->assertArrayNotHasKey('unknownfeature', $saved);
        $this->assertArrayHasKey('navlink', $saved);

        $logged = ['plugin' => 'theme_flexium', 'name' => 'feature_defaultview'];
        $this->assertContains('list', $DB->get_fieldset('config_log', 'value', $logged));
        // Saving the same value again does not log anything.
        $count = $DB->count_records('config_log', $logged);
        features::save(['defaultview' => 'list']);
        $this->assertSame($count, $DB->count_records('config_log', $logged));
    }

    /**
     * Every feature has its label and help strings, every group its heading, and every choice its label.
     */
    public function test_export_definitions_strings(): void {
        $strings = get_string_manager();
        foreach (array_keys(features::definitions()) as $key) {
            $this->assertTrue($strings->string_exists('feature_' . $key, 'theme_flexium'), "feature_{$key}");
            $this->assertTrue(
                $strings->string_exists('feature_' . $key . '_desc', 'theme_flexium'),
                "feature_{$key}_desc"
            );
        }
        foreach (array_unique(array_column(features::definitions(), 'group')) as $group) {
            $this->assertTrue(
                $strings->string_exists('featuregroup_' . $group, 'theme_flexium'),
                "featuregroup_{$group}"
            );
        }

        $export = features::export_definitions();
        $this->assertCount(count(features::definitions()), $export);
        foreach ($export as $item) {
            $this->assertStringNotContainsString('[[', $item['label'], $item['key']);
            $this->assertStringNotContainsString('[[', $item['help'], $item['key']);
            foreach ($item['choices'] as $choice) {
                $name = $item['key'] . ': ' . $choice['key'];
                $this->assertIsString($choice['key']);
                $this->assertNotSame('', $choice['label'], $name);
                $this->assertStringNotContainsString('[[', $choice['label'], $name);
            }
        }
    }

    /**
     * Choice labels of the blocks drawer button reuse the filter button strings.
     */
    public function test_choice_label_block_icon(): void {
        $this->assertSame(
            get_string('colour_danger', 'theme_flexium'),
            features::choice_label('blockiconcolour', 'danger')
        );
        $this->assertSame(
            get_string('colour_default', 'theme_flexium'),
            features::choice_label('blockiconcolour', 'default')
        );
        $this->assertSame(
            get_string('filtericonsize_lg', 'theme_flexium'),
            features::choice_label('blockiconsize', 'lg')
        );
        $this->assertSame(
            get_string('filtericonposition_bottom', 'theme_flexium'),
            features::choice_label('blockiconposition', 'bottom')
        );
        $this->assertSame(get_string('palette', 'theme_flexium', '3'), features::choice_label('defaultimage', '3'));
        $this->assertSame(
            get_string('defaultimage_core', 'theme_flexium'),
            features::choice_label('defaultimage', 'core')
        );
    }

    /**
     * Who can reach a course page: logged in users and guests, visitors only when guests can log in.
     *
     * @return array
     */
    public static function reachable_provider(): array {
        return [
            'visitor, no guest login' => ['visitor', 0, 0, false],
            'visitor, guest login button' => ['visitor', 0, 1, true],
            'visitor, automatic guest login' => ['visitor', 1, 0, true],
            'guest' => ['guest', 0, 0, true],
            'user' => ['user', 0, 0, true],
        ];
    }

    /**
     * course_page_reachable(), and the quick view forced off where course pages cannot be reached.
     *
     * @param string $who visitor, guest or user
     * @param int $autologinguests
     * @param int $guestloginbutton
     * @param bool $expected
     */
    #[DataProvider('reachable_provider')]
    public function test_course_page_reachable(
        string $who,
        int $autologinguests,
        int $guestloginbutton,
        bool $expected
    ): void {
        $this->resetAfterTest();

        set_config('autologinguests', $autologinguests);
        set_config('guestloginbutton', $guestloginbutton);
        if ($who === 'guest') {
            $this->setGuestUser();
        } else if ($who === 'user') {
            $this->setUser($this->getDataGenerator()->create_user());
        } else {
            $this->setUser(null);
        }

        $this->assertSame($expected, features::course_page_reachable());
        $this->assertSame($expected, features::get('quickview'));

        // Switched off by the admin: off for everyone.
        set_config('feature_quickview', '0', 'theme_flexium');
        $this->assertFalse(features::get('quickview'));
    }

    /**
     * Default course image: a theme header by course id, a fixed one, or the uploaded one when there is one.
     */
    public function test_default_course_image(): void {
        $this->resetAfterTest();

        $this->assertStringContainsString(
            'course/default' . (7 % catalog::DEFAULT_IMAGES + 1),
            features::default_course_image(7)
        );
        set_config('feature_defaultimage', '4', 'theme_flexium');
        $this->assertStringContainsString('course/default4', features::default_course_image(7));

        // Custom without an uploaded image falls back to automatic.
        set_config('feature_defaultimage', 'custom', 'theme_flexium');
        $this->assertNull(features::custom_image_url());
        $this->assertStringContainsString(
            'course/default' . (8 % catalog::DEFAULT_IMAGES + 1),
            features::default_course_image(8)
        );
        $this->assertArrayNotHasKey('custom', features::palette_images());
        $this->assertCount(catalog::DEFAULT_IMAGES, features::palette_images());

        $context = \core\context\system::instance();
        get_file_storage()->create_file_from_string(['contextid' => $context->id, 'component' => 'theme_flexium',
            'filearea' => 'defaultcourseimage', 'itemid' => 0, 'filepath' => '/', 'filename' => 'header.png'], 'png');
        set_config('defaultcourseimage', '/header.png', 'theme_flexium');
        $url = features::custom_image_url();
        $this->assertStringContainsString('/theme_flexium/defaultcourseimage/', $url);
        $this->assertStringEndsWith('/header.png', $url);
        $this->assertSame($url, features::default_course_image(8));
        $this->assertSame($url, features::palette_images()['custom']);
    }
}
