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
 * Tests for the runtime appearance settings.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
#[CoversClass(appearance::class)]
final class appearance_test extends \advanced_testcase {
    /**
     * Colour values and whether they are accepted.
     *
     * @return array
     */
    public static function colour_provider(): array {
        return [
            'short' => ['#abc', true, '170, 187, 204'],
            'long' => ['#0F6CBF', true, '15, 108, 191'],
            'with alpha' => ['#0f6cbf80', true, '15, 108, 191'],
            'no hash' => ['0f6cbf', false, null],
            'css injection' => ['#fff; } body { display: none', false, null],
            'named' => ['red', false, null],
            'empty' => ['', false, null],
        ];
    }

    /**
     * is_colour() accepts hex colours only, rgb() converts them.
     *
     * @param string $value
     * @param bool $valid
     * @param string|null $rgb
     */
    #[DataProvider('colour_provider')]
    public function test_colours(string $value, bool $valid, ?string $rgb): void {
        $this->assertSame($valid, appearance::is_colour($value));
        if ($valid) {
            $this->assertSame($rgb, appearance::rgb($value));
        }
    }

    /**
     * WCAG contrast ratios.
     */
    public function test_contrast_ratio(): void {
        $this->assertSame(21.0, appearance::contrast_ratio('#000000', '#ffffff'));
        $this->assertSame(1.0, appearance::contrast_ratio('#777', '#777777'));
        $this->assertSame(appearance::contrast_ratio('#0f6cbf', '#fff'), appearance::contrast_ratio('#fff', '#0f6cbf'));
        $this->assertNull(appearance::contrast_ratio('blue', '#fff'));
    }

    /**
     * Nothing customised: only the always present variables.
     */
    public function test_runtime_css_defaults(): void {
        $this->resetAfterTest();

        $css = appearance::get_runtime_css((object) []);
        $this->assertStringStartsWith('html:root {', $css);
        $this->assertStringContainsString('--flexium-headings-font: inherit;', $css);
        $this->assertStringNotContainsString('--bs-body-font-family', $css);
        $this->assertStringNotContainsString('data-bs-theme="dark"', $css);
        $this->assertStringNotContainsString('@media', $css);
    }

    /**
     * Customised settings become CSS; invalid values are ignored; margins are appended.
     */
    public function test_runtime_css_settings(): void {
        $this->resetAfterTest();

        set_config('pagemargins', json_encode(['site' => ['left' => 32]]), 'theme_flexium');
        $font = array_key_first(appearance::GOOGLE_FONTS);
        $css = appearance::get_runtime_css((object) [
            'fontbody' => $font,
            'fontsize' => 18,
            'linkcolor' => '#0f6cbf',
            'bodybg' => 'url(evil)',
            'navbarbg' => '#112233',
            'navbartext' => 'white',
            'footerbg' => '#000',
        ]);

        $this->assertStringContainsString("--bs-body-font-family: \"{$font}\"", $css);
        $this->assertStringContainsString('--bs-body-font-size: 1.125rem;', $css);
        $this->assertStringContainsString('--bs-link-color: #0f6cbf; --bs-link-color-rgb: 15, 108, 191;', $css);
        // Hover: 20% darker.
        $this->assertStringContainsString('--bs-link-hover-color-rgb: 12, 86, 153;', $css);
        $this->assertStringContainsString('--flexium-footer-bg: #000;', $css);
        $this->assertStringNotContainsString('evil', $css);
        $this->assertStringContainsString('.navbar.fixed-top { background-color: #112233 !important;', $css);
        $this->assertStringNotContainsString('white', $css);
        $this->assertStringContainsString('padding-left: min(32px, 12vw);', $css);
    }
}
