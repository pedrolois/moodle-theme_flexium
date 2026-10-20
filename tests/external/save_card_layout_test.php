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
use theme_flexium\local\catalog\card_config;
use theme_flexium\local\catalog\filter_config;

/**
 * Tests for the web service saving the course card settings, and the card settings themselves.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(save_card_layout::class)]
#[CoversClass(card_config::class)]
final class save_card_layout_test extends \advanced_testcase {
    /**
     * Create the course custom fields used as badges and footer items: a select (level) and a text (venue).
     */
    private function create_fields(): void {
        $generator = $this->getDataGenerator()->get_plugin_generator('core_customfield');
        $categoryid = $generator->create_category()->get('id');
        $generator->create_field(['categoryid' => $categoryid, 'type' => 'select', 'shortname' => 'level',
            'name' => 'Level', 'configdata' => ['options' => "Beginner\nAdvanced"]]);
        $generator->create_field(['categoryid' => $categoryid, 'type' => 'text', 'shortname' => 'venue', 'name' => 'Venue']);
        $generator->create_field(['categoryid' => $categoryid, 'type' => 'text', 'shortname' => 'secret', 'name' => 'Secret',
            'configdata' => ['visibility' => 0]]);
        filter_config::reset_caches();
    }

    /**
     * Call the web service as a client would, with its return values cleaned.
     *
     * @param array $args named arguments of save_card_layout::execute()
     * @return array
     */
    private function save(array $args): array {
        $result = save_card_layout::execute(...$args);
        return external_api::clean_returnvalue(save_card_layout::execute_returns(), $result);
    }

    /**
     * Only site administrators can save the card settings.
     */
    public function test_requires_site_config(): void {
        $this->resetAfterTest();
        $this->setUser($this->getDataGenerator()->create_user());

        $this->expectException(\required_capability_exception::class);
        save_card_layout::execute(true, true, [], []);
    }

    /**
     * Until an administrator saves, cards show the category, summary, start date, participants and the custom
     * fields shown as filters as badges.
     */
    public function test_defaults(): void {
        $this->resetAfterTest();
        $this->create_fields();

        $layout = filter_config::get_layout();
        $this->assertSame([
            'showcategory' => true,
            'showsummary' => true,
            'badges' => ['customfield:level'],
            'footer' => ['startdate', 'participants'],
            'badgecolours' => [],
            'badgerows' => false,
        ], card_config::get_settings($layout));
        $this->assertTrue(card_config::show('category'));
        $this->assertSame([], card_config::get_badge_colours());
    }

    /**
     * Badge and footer choices: custom fields visible to everyone and tags, no categories.
     */
    public function test_choices(): void {
        $this->resetAfterTest();
        $this->create_fields();

        $badges = card_config::get_badge_choices();
        $this->assertSame(['tag', 'customfield:level', 'customfield:venue'], array_keys($badges));
        $this->assertSame('Level', $badges['customfield:level']);

        $footer = card_config::get_footer_choices();
        $this->assertSame(
            array_merge(array_keys(card_config::FOOTER_ITEMS), ['customfield:level', 'customfield:venue']),
            array_keys($footer)
        );
        $this->assertSame(get_string('cardfield', 'theme_flexium', 'Venue'), $footer['customfield:venue']);
    }

    /**
     * An administrator saves the settings: unknown, duplicate and wrong keys dropped, settings read back.
     */
    public function test_save(): void {
        global $DB;
        $this->resetAfterTest();
        $this->create_fields();
        $this->setAdminUser();
        $before = $DB->count_records('config_log', ['plugin' => 'theme_flexium']);

        $result = $this->save([
            'showcategory' => false,
            'showsummary' => true,
            'badges' => ['customfield:venue', 'category', 'customfield:secret', 'bogus', 'customfield:venue', 'tag'],
            'footer' => ['teachers', 'customfield:level', 'teachers', 'nothing', 'enddate'],
            'badgecolours' => [
                ['source' => 'customfield:venue', 'colour' => 'success'],
                ['source' => 'tag', 'colour' => 'rainbow'],
                ['source' => 'customfield:secret', 'colour' => 'danger'],
                ['source' => 'tag', 'colour' => 'dark'],
            ],
            'badgerows' => true,
        ]);
        $expected = [
            'showcategory' => false,
            'showsummary' => true,
            'badges' => ['customfield:venue', 'tag'],
            'footer' => ['teachers', 'customfield:level', 'enddate'],
            'badgecolours' => [['source' => 'customfield:venue', 'colour' => 'success'], ['source' => 'tag', 'colour' => 'dark']],
            'badgerows' => true,
        ];
        $this->assertSame($expected, $result);
        $this->assertSame($expected, card_config::get_settings(filter_config::get_layout()));
        $this->assertSame('customfield:venue,tag', get_config('theme_flexium', 'cardbadges'));
        $this->assertFalse(card_config::show('category'));
        $this->assertTrue(card_config::show('summary'));

        // Every change is logged once (showing the summary is the installed default, so not a change); saving the same
        // values again logs nothing.
        $logged = $DB->count_records('config_log', ['plugin' => 'theme_flexium']);
        $this->assertSame($before + 5, $logged);
        $this->save(['showcategory' => false, 'showsummary' => true, 'badges' => ['customfield:venue', 'tag'],
            'footer' => ['teachers', 'customfield:level', 'enddate'], 'badgecolours' => $expected['badgecolours'],
            'badgerows' => true]);
        $this->assertSame($logged, $DB->count_records('config_log', ['plugin' => 'theme_flexium']));
    }

    /**
     * Nothing chosen: no badges, no footer items, and no colours stored.
     */
    public function test_save_empty(): void {
        $this->resetAfterTest();
        $this->create_fields();
        $this->setAdminUser();

        $result = $this->save(['showcategory' => true, 'showsummary' => false, 'badges' => [], 'footer' => []]);
        $this->assertSame([], $result['badges']);
        $this->assertSame([], $result['footer']);
        $this->assertSame([], $result['badgecolours']);
        $this->assertFalse($result['badgerows']);
        $this->assertSame('', get_config('theme_flexium', 'cardbadgecolours'));
        // An empty saved list is kept empty, not replaced by the defaults.
        $this->assertSame([], card_config::get_badges(filter_config::get_layout()));
        $this->assertSame([], card_config::get_footer());
    }

    /**
     * Stored values that no longer exist (deleted fields, bad colours) are ignored when read.
     */
    public function test_stored_values_cleaned(): void {
        $this->resetAfterTest();
        $this->create_fields();

        set_config('cardfooter', 'startdate,customfield:gone,startdate', 'theme_flexium');
        set_config('cardbadges', 'customfield:gone,customfield:level', 'theme_flexium');
        set_config('cardbadgecolours', json_encode(['customfield:level' => 'info', 'tag' => 'pink']), 'theme_flexium');
        $this->assertSame(['startdate'], card_config::get_footer());
        $this->assertSame(['customfield:level'], card_config::get_badges([]));
        $this->assertSame(['customfield:level' => 'info'], card_config::get_badge_colours());

        set_config('cardbadgecolours', 'not json', 'theme_flexium');
        $this->assertSame([], card_config::get_badge_colours());
    }

    /**
     * Badges and footer lists keep known, distinct keys, trimmed, in their order.
     */
    public function test_clean_list(): void {
        $choices = ['a' => 'A', 'b' => 'B', 'c' => 'C'];
        $this->assertSame(['b', 'a'], card_config::clean_list(
            [' b ', 'x', 'a', 'b', ''],
            $choices
        ));
    }
}
