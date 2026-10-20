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

namespace theme_flexium\local;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;

/**
 * Tests for the page margins.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(margins::class)]
final class margins_test extends \advanced_testcase {
    /**
     * Values of one side and what clean() makes of them.
     *
     * @return array
     */
    public static function clean_value_provider(): array {
        return [
            'null is the default' => [null, null],
            'empty string is the default' => ['', null],
            'negative is the default' => [-1, null],
            'zero is kept' => [0, 0],
            'numeric string' => ['40', 40],
            'clamped to max' => [5000, margins::MAX],
            'max is kept' => [margins::MAX, margins::MAX],
        ];
    }

    /**
     * clean() turns every side value into an integer between 0 and MAX, or null.
     *
     * @param mixed $value
     * @param int|null $expected
     */
    #[DataProvider('clean_value_provider')]
    public function test_clean_values($value, ?int $expected): void {
        $clean = margins::clean(['home' => ['left' => $value, 'right' => $value]]);
        $this->assertSame($expected, $clean['home']['left']);
        $this->assertSame($expected, $clean['home']['right']);
    }

    /**
     * clean() keeps every known scope (filled with defaults) and drops unknown ones.
     */
    public function test_clean_scopes(): void {
        $clean = margins::clean([
            'catalog' => ['left' => 10, 'footer' => 1, 'navbar' => 0],
            'unknown' => ['left' => 50, 'right' => 50],
        ]);
        $this->assertSame(array_keys(margins::SCOPES), array_keys($clean));
        $this->assertSame(['left' => null, 'right' => null, 'footer' => false, 'navbar' => false], $clean['site']);
        $this->assertSame(['left' => 10, 'right' => null, 'footer' => true, 'navbar' => false], $clean['catalog']);
    }

    /**
     * No margins set: no CSS at all.
     */
    public function test_css_empty(): void {
        $this->assertSame('', margins::css(margins::clean([])));
    }

    /**
     * CSS of the site and a specific scope, capped at 12vw, inside the tablet media query, parts only when flagged.
     */
    public function test_css_rules(): void {
        $css = margins::css(margins::clean([
            'site' => ['left' => 20, 'right' => 30],
            'catalog' => ['left' => 100, 'footer' => true],
        ]));
        $this->assertStringStartsWith('@media (min-width: 768px) {', $css);
        $this->assertStringContainsString(
            'body #page-wrapper #page .main-inner { padding-left: min(20px, 12vw); padding-right: min(30px, 12vw); }',
            $css
        );
        $this->assertStringContainsString('body.flexium-catalogpage #page-wrapper #page .main-inner, '
            . 'body.flexium-catalogpage #page-wrapper .flexium-footer { padding-left: min(100px, 12vw); }', $css);
        // The navbar was not flagged anywhere, the site footer was not flagged for the whole site.
        $this->assertStringNotContainsString('.navbar.fixed-top', $css);
        $this->assertStringNotContainsString('body #page-wrapper .flexium-footer', $css);
        // Home has no margins: no rule.
        $this->assertStringNotContainsString('#page-site-index', $css);
        // Site rules come before the specific scopes, so these override them.
        $this->assertLessThan(strpos($css, 'flexium-catalogpage'), strpos($css, 'body #page-wrapper'));
    }

    /**
     * The navigation bar takes the margins when flagged.
     */
    public function test_css_navbar(): void {
        $css = margins::css(margins::clean(['home' => ['right' => 64, 'navbar' => true]]));
        $this->assertStringContainsString('body#page-site-index #page-wrapper .navbar.fixed-top', $css);
        $this->assertStringContainsString('padding-right: min(64px, 12vw);', $css);
    }

    /**
     * get() reads the stored JSON through clean(), and copes with nothing or rubbish stored.
     */
    public function test_get(): void {
        $this->resetAfterTest();

        $this->assertNull(margins::get()['site']['left']);
        set_config('pagemargins', 'not json', 'theme_flexium');
        $this->assertSame(margins::clean([]), margins::get());

        set_config(
            'pagemargins',
            json_encode(['home' => ['left' => 9999, 'right' => '12', 'navbar' => 1]]),
            'theme_flexium'
        );
        $margins = margins::get();
        $this->assertSame(margins::MAX, $margins['home']['left']);
        $this->assertSame(12, $margins['home']['right']);
        $this->assertTrue($margins['home']['navbar']);
    }

    /**
     * page_scope(): site home, catalogue (only with the catalogue enabled) or nothing.
     */
    public function test_page_scope(): void {
        $this->resetAfterTest();

        $page = new \moodle_page();
        $page->set_pagetype('site-index');
        $this->assertSame('home', margins::page_scope($page));

        $page = new \moodle_page();
        $page->set_pagetype('course-index-category');
        set_config('enablecatalog', 1, 'theme_flexium');
        $this->assertSame('catalog', margins::page_scope($page));
        set_config('enablecatalog', 0, 'theme_flexium');
        $this->assertSame('', margins::page_scope($page));

        $page = new \moodle_page();
        $page->set_pagetype('course-view-topics');
        $this->assertSame('', margins::page_scope($page));
    }
}
