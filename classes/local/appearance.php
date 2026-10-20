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

/**
 * Appearance settings of the theme.
 *
 * Two kinds of settings:
 *  - Bootstrap theme colours (primary, secondary...) are SCSS variables: Bootstrap derives shades, hover
 *    states and components from them, so changing them recompiles the theme CSS (see get_pre_scss()).
 *  - Everything else (navbar, links, fonts, size, corners, shadows) is emitted at runtime as CSS custom
 *    properties and a few rules in the page head (see get_head_html()): changes apply on the next page
 *    load, without recompiling.
 *
 * Runtime colours apply to the light colour mode only; the dark mode (Boost colour modes) keeps its palette.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class appearance {
    /** @var array Setting name => Bootstrap SCSS variable, for the theme colours compiled into the CSS. */
    public const SCSS_COLOURS = [
        'brandcolor' => 'primary',
        'secondarycolor' => 'secondary',
        'successcolor' => 'success',
        'infocolor' => 'info',
        'warningcolor' => 'warning',
        'dangercolor' => 'danger',
    ];

    /** @var string[] Fonts offered from Google Fonts: name => CSS generic family fallback. */
    public const GOOGLE_FONTS = [
        'Inter' => 'sans-serif',
        'Roboto' => 'sans-serif',
        'Open Sans' => 'sans-serif',
        'Lato' => 'sans-serif',
        'Montserrat' => 'sans-serif',
        'Poppins' => 'sans-serif',
        'Nunito' => 'sans-serif',
        'Source Sans 3' => 'sans-serif',
        'Work Sans' => 'sans-serif',
        'IBM Plex Sans' => 'sans-serif',
        'Noto Sans' => 'sans-serif',
        'DM Sans' => 'sans-serif',
        'Manrope' => 'sans-serif',
        'Raleway' => 'sans-serif',
        'Merriweather' => 'serif',
        'Lora' => 'serif',
        'Playfair Display' => 'serif',
    ];

    /** @var string[] Corner radius presets: key => base radius. */
    public const RADII = [
        'square' => '0',
        'small' => '.25rem',
        'default' => '.5rem',
        'large' => '.75rem',
        'xlarge' => '1.25rem',
    ];

    /** @var string[] Card shadow presets: key => box-shadow. */
    public const SHADOWS = [
        'none' => 'none',
        'soft' => '0 1px 3px rgba(0, 0, 0, .08), 0 1px 2px rgba(0, 0, 0, .04)',
        'medium' => '0 .5rem 1rem rgba(0, 0, 0, .1)',
        'strong' => '0 1rem 2rem rgba(0, 0, 0, .16)',
    ];

    /** @var int[] Base font size choices, in pixels. */
    public const FONT_SIZES = [14, 15, 16, 17, 18];

    /**
     * SCSS variables prepended to the theme SCSS: Bootstrap theme colours, then Boost's own pre SCSS
     * (which also handles brandcolor and the raw "scsspre" setting).
     *
     * @param \theme_config $theme
     * @return string
     */
    public static function get_pre_scss(\theme_config $theme): string {
        global $CFG;
        require_once($CFG->dirroot . '/theme/boost/lib.php');

        $scss = '';
        foreach (self::SCSS_COLOURS as $setting => $variable) {
            $value = $theme->settings->{$setting} ?? '';
            if ($setting !== 'brandcolor' && self::is_colour($value)) {
                $scss .= '$' . $variable . ': ' . $value . ";\n";
            }
        }
        return $scss . theme_boost_get_pre_scss($theme);
    }

    /**
     * Font links and runtime CSS for the page head.
     *
     * @return string HTML
     */
    public static function get_head_html(): string {
        $config = get_config('theme_flexium');
        $html = self::get_font_links($config);
        $css = self::get_runtime_css($config);
        if ($css !== '') {
            $html .= "<style id=\"theme-flexium-appearance\">\n{$css}</style>\n";
        }
        return $html;
    }

    /**
     * Google Fonts stylesheet links for the chosen fonts (unless loading from Google is disabled).
     *
     * @param \stdClass $config theme_flexium config
     * @return string HTML
     */
    public static function get_font_links(\stdClass $config): string {
        if (empty($config->googlefonts)) {
            return '';
        }
        $families = [];
        foreach (['fontbody', 'fontheadings'] as $setting) {
            $font = $config->{$setting} ?? '';
            if (isset(self::GOOGLE_FONTS[$font])) {
                $families[$font] = 'family=' . str_replace(' ', '+', $font) . ':wght@400;500;600;700';
            }
        }
        if (!$families) {
            return '';
        }
        $href = 'https://fonts.googleapis.com/css2?' . implode('&', $families) . '&display=swap';
        return '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n"
            . '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n"
            . '<link rel="stylesheet" href="' . s($href) . '">' . "\n";
    }

    /**
     * CSS custom properties and rules for the runtime settings.
     *
     * @param \stdClass $config theme_flexium config
     * @return string CSS, empty when nothing is customised
     */
    public static function get_runtime_css(\stdClass $config): string {
        // Variables for every colour mode.
        $all = [];
        $body = self::font_stack($config->fontbody ?? '');
        if ($body) {
            $all['--bs-body-font-family'] = $body;
            $all['--bs-font-sans-serif'] = $body;
        }
        $headings = self::font_stack($config->fontheadings ?? '');
        $all['--flexium-headings-font'] = $headings ?: 'inherit';
        $size = (int) ($config->fontsize ?? 0);
        if (in_array($size, self::FONT_SIZES, true)) {
            $all['--bs-body-font-size'] = round($size / 16, 4) . 'rem';
        }
        $radius = self::RADII[$config->radius ?? ''] ?? null;
        if ($radius !== null) {
            $all['--bs-border-radius'] = $radius;
            $all['--bs-border-radius-sm'] = $radius === '0' ? '0' : "calc({$radius} * .5)";
            $all['--bs-border-radius-lg'] = $radius === '0' ? '0' : "calc({$radius} * 1.5)";
            $all['--bs-border-radius-xl'] = $radius === '0' ? '0' : "calc({$radius} * 2)";
            $all['--bs-border-radius-xxl'] = $radius === '0' ? '0' : "calc({$radius} * 4)";
        }
        $all['--flexium-card-shadow'] = self::SHADOWS[$config->cardshadow ?? ''] ?? self::SHADOWS['none'];
        // The site footer keeps its colours in both colour modes (it is usually a brand colour band).
        foreach (['footerbg' => '--flexium-footer-bg', 'footertext' => '--flexium-footer-color'] as $setting => $property) {
            if (self::is_colour($config->{$setting} ?? '')) {
                $all[$property] = $config->{$setting};
            }
        }

        // Colours for the light colour mode only.
        $light = [];
        foreach (['bodybg' => '--bs-body-bg', 'linkcolor' => '--bs-link-color'] as $setting => $property) {
            $value = $config->{$setting} ?? '';
            if (self::is_colour($value)) {
                $light[$property] = $value;
                if ($rgb = self::rgb($value)) {
                    $light[$property . '-rgb'] = $rgb;
                }
            }
        }
        if (isset($light['--bs-link-color-rgb'])) {
            // Bootstrap reads the hover colour from the -rgb variable: 20% darker, as its own default.
            $hover = implode(', ', array_map(
                fn($channel) => (int) round($channel * .8),
                explode(', ', $light['--bs-link-color-rgb'])
            ));
            $light['--bs-link-hover-color'] = "rgb({$hover})";
            $light['--bs-link-hover-color-rgb'] = $hover;
        }

        $css = 'html:root {' . self::declarations($all) . "}\n";
        if ($light) {
            $css .= 'html:root:not([data-bs-theme="dark"]) {' . self::declarations(array_filter($light)) . "}\n";
        }

        $navbarbg = $config->navbarbg ?? '';
        $navbartext = $config->navbartext ?? '';
        if (self::is_colour($navbarbg) || self::is_colour($navbartext)) {
            $scope = 'html:not([data-bs-theme="dark"]) .navbar.fixed-top';
            if (self::is_colour($navbarbg)) {
                $css .= "{$scope} { background-color: {$navbarbg} !important; border-bottom-color: transparent; }\n";
            }
            if (self::is_colour($navbartext)) {
                $css .= "{$scope}, {$scope} .nav-link, {$scope} .navbar-brand, {$scope} .btn, {$scope} .icon,"
                    . " {$scope} .usermenu .login a { color: {$navbartext} !important; }\n";
                $css .= "{$scope} .nav-link.active, {$scope} .nav-link:hover { border-bottom-color: {$navbartext}; }\n";
            }
        }

        // Page margins (margins wand): whole site, then home page and catalogue.
        $css .= margins::css(margins::get());
        return $css;
    }

    /**
     * Whether a value is a hex colour (#rgb, #rrggbb or #rrggbbaa).
     *
     * @param string $value
     * @return bool
     */
    public static function is_colour(string $value): bool {
        return (bool) preg_match('/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i', trim($value));
    }

    /**
     * "r, g, b" of a hex colour, for Bootstrap's *-rgb variables.
     *
     * @param string $hex
     * @return string|null
     */
    public static function rgb(string $hex): ?string {
        $hex = ltrim(trim($hex), '#');
        if (strlen($hex) === 3) {
            $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
        }
        if (strlen($hex) < 6) {
            return null;
        }
        return implode(', ', array_map('hexdec', str_split(substr($hex, 0, 6), 2)));
    }

    /**
     * WCAG contrast ratio between two hex colours (1 to 21).
     *
     * @param string $a
     * @param string $b
     * @return float|null null when a value is not a colour
     */
    public static function contrast_ratio(string $a, string $b): ?float {
        if (!self::is_colour($a) || !self::is_colour($b)) {
            return null;
        }
        $luminance = function (string $hex): float {
            $channels = array_map(function ($value) {
                $value /= 255;
                return $value <= 0.03928 ? $value / 12.92 : (($value + 0.055) / 1.055) ** 2.4;
            }, array_map('intval', explode(', ', self::rgb($hex))));
            return 0.2126 * $channels[0] + 0.7152 * $channels[1] + 0.0722 * $channels[2];
        };
        [$light, $dark] = [max($luminance($a), $luminance($b)), min($luminance($a), $luminance($b))];
        return round(($light + 0.05) / ($dark + 0.05), 2);
    }

    /**
     * CSS font stack for a font setting, '' for the Moodle default.
     *
     * @param string $font
     * @return string
     */
    private static function font_stack(string $font): string {
        if (isset(self::GOOGLE_FONTS[$font])) {
            return '"' . $font . '", ' . (self::GOOGLE_FONTS[$font] === 'serif'
                ? 'Georgia, "Times New Roman", serif'
                : 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif');
        }
        return '';
    }

    /**
     * Render CSS declarations.
     *
     * @param array $properties property => value
     * @return string
     */
    private static function declarations(array $properties): string {
        $css = '';
        foreach ($properties as $property => $value) {
            $css .= " {$property}: {$value};";
        }
        return $css . ' ';
    }
}
