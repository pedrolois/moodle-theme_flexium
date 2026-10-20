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

namespace theme_flexium;

use core\navigation\views\primary;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;

/**
 * Tests for the hook callbacks of the theme (catalogue link in the top navigation bar).
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(hook_callbacks::class)]
final class hook_callbacks_test extends \advanced_testcase {
    /**
     * Build the primary navigation of a new page, as the theme renders it.
     *
     * @param string $url page URL
     * @param string $theme theme of the page
     * @param string|null $activetab primary tab the page asks for (course/index.php asks for "home")
     * @return primary
     */
    private function primary(string $url = '/my/', string $theme = 'flexium', ?string $activetab = null): primary {
        global $PAGE;

        $PAGE = new \moodle_page();
        $PAGE->set_url($url);
        $PAGE->set_context(\core\context\system::instance());
        $PAGE->force_theme($theme);
        if ($activetab !== null) {
            $PAGE->set_primary_active_tab($activetab);
        }
        $view = new primary($PAGE);
        $view->initialise();
        return $view;
    }

    /**
     * The catalogue link is added after Moodle's own links, right before Site administration.
     */
    public function test_catalogue_link_before_site_admin(): void {
        $this->resetAfterTest();
        $this->setAdminUser();

        $view = $this->primary();
        $keys = $view->get_children_key_list();
        $this->assertContains('flexiumcatalogue', $keys);
        $this->assertContains('siteadminnode', $keys);
        $this->assertSame(array_search('siteadminnode', $keys) - 1, array_search('flexiumcatalogue', $keys));

        $node = $view->get('flexiumcatalogue');
        $this->assertSame(get_string('navcatalogue', 'theme_flexium'), $node->text);
        $this->assertSame((new \moodle_url('/course/index.php'))->out(false), $node->action()->out(false));
        $this->assertFalse($node->isactive);
    }

    /**
     * Without Site administration (normal users) the link goes last.
     */
    public function test_catalogue_link_for_users(): void {
        $this->resetAfterTest();
        $this->setUser($this->getDataGenerator()->create_user());

        $keys = $this->primary()->get_children_key_list();
        $this->assertNotContains('siteadminnode', $keys);
        $this->assertSame('flexiumcatalogue', end($keys));
    }

    /**
     * The link uses its own text when one is set.
     */
    public function test_custom_text(): void {
        $this->resetAfterTest();
        $this->setAdminUser();
        set_config('feature_navlinktext', 'All our courses', 'theme_flexium');

        $this->assertSame('All our courses', $this->primary()->get('flexiumcatalogue')->text);
    }

    /**
     * No link when the feature is switched off, or on pages of other themes.
     */
    public function test_not_added(): void {
        $this->resetAfterTest();
        $this->setAdminUser();

        $this->assertNotContains('flexiumcatalogue', $this->primary('/my/', 'boost')->get_children_key_list());

        set_config('feature_navlink', '0', 'theme_flexium');
        $this->assertNotContains('flexiumcatalogue', $this->primary()->get_children_key_list());
    }

    /**
     * Custom menu items and whether they already link to the catalogue.
     *
     * @return array
     */
    public static function custom_menu_provider(): array {
        return [
            'relative index.php' => ["Courses|/course/index.php", false],
            'relative folder' => ["Courses|/course/", false],
            'with parameters' => ["Courses|/course/index.php?categoryid=3", false],
            'full URL' => ["Courses|{wwwroot}/course/index.php", false],
            'full URL folder, second line' => ["Help|https://docs.moodle.org\n-Courses|{wwwroot}/course/", false],
            'other course page' => ["My course|/course/view.php?id=2", true],
            'other site' => ["Courses|https://elsewhere.example.com/course/index.php", true],
            'no items' => ['', true],
        ];
    }

    /**
     * No link when a custom menu item already links to the catalogue.
     *
     * @param string $items custom menu items ({wwwroot} replaced by the site URL)
     * @param bool $added whether the link is added
     */
    #[DataProvider('custom_menu_provider')]
    public function test_custom_menu_items(string $items, bool $added): void {
        global $CFG;
        $this->resetAfterTest();
        $this->setAdminUser();

        set_config('custommenuitems', str_replace('{wwwroot}', $CFG->wwwroot, $items));
        $this->assertSame($added, in_array('flexiumcatalogue', $this->primary()->get_children_key_list(), true));
    }

    /**
     * On the catalogue (course/index.php asks for "Home") the catalogue tab is the active one.
     */
    public function test_active_on_catalogue(): void {
        global $PAGE;
        $this->resetAfterTest();
        $this->setAdminUser();

        $view = $this->primary('/course/index.php', 'flexium', 'home');
        $this->assertSame('flexiumcatalogue', $PAGE->get_primary_activate_tab());
        $this->assertTrue($view->get('flexiumcatalogue')->isactive);
        foreach ($view->children as $node) {
            if ($node->key !== 'flexiumcatalogue') {
                $this->assertFalse((bool) $node->isactive, $node->key);
            }
        }

        // Same with a category.
        $view = $this->primary('/course/index.php?categoryid=1', 'flexium', 'home');
        $this->assertTrue($view->get('flexiumcatalogue')->isactive);
    }
}
