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

namespace theme_flexium\output;

use PHPUnit\Framework\Attributes\CoversClass;

/**
 * Tests for the core renderer of the theme.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(core_renderer::class)]
final class core_renderer_test extends \advanced_testcase {
    /**
     * Body classes of a page with "limitedwidth", as index.php and course/index.php set it.
     *
     * @param string $pagelayout
     * @return string[]
     */
    private function body_classes(string $pagelayout): array {
        $page = new \moodle_page();
        $page->set_url('/');
        $page->set_context(\core\context\system::instance());
        $page->set_pagelayout($pagelayout);
        $page->force_theme('flexium');
        $page->add_body_class('limitedwidth');
        $renderer = $page->get_renderer('core', null, RENDERER_TARGET_GENERAL);
        $this->assertInstanceOf(core_renderer::class, $renderer);
        return preg_split('/\s+/', trim($renderer->body_css_classes()));
    }

    /**
     * The site home built with the home page builder takes the full width.
     */
    public function test_frontpage_with_home_builder(): void {
        $this->resetAfterTest();

        // Enabled by default.
        $this->assertNotContains('limitedwidth', $this->body_classes('frontpage'));
        set_config('enablehome', 1, 'theme_flexium');
        $this->assertNotContains('limitedwidth', $this->body_classes('frontpage'));
    }

    /**
     * Moodle's site home (builder off) and other pages keep the reading width.
     */
    public function test_limited_width_kept(): void {
        $this->resetAfterTest();

        set_config('enablehome', 0, 'theme_flexium');
        $this->assertContains('limitedwidth', $this->body_classes('frontpage'));

        set_config('enablehome', 1, 'theme_flexium');
        $this->assertContains('limitedwidth', $this->body_classes('coursecategory'));
        $this->assertContains('limitedwidth', $this->body_classes('standard'));
    }
}
