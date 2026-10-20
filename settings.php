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

/**
 * Flexium theme settings.
 *
 * Settings marked "compiled" change the SCSS and reset the theme caches; the others are applied at runtime
 * (see \theme_flexium\local\appearance) and take effect on the next page load.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

use theme_flexium\local\appearance;

defined('MOODLE_INTERNAL') || die();

if ($ADMIN->fulltree) {
    $component = 'theme_flexium';
    $str = fn(string $key, $a = null) => get_string($key, $component, $a);

    $settings = new theme_boost_admin_settingspage_tabs('themesettingflexium', $str('configtitle'));

    // Branding: colours.
    $page = new admin_settingpage('theme_flexium_branding', $str('brandingsettings'));

    $page->add(new admin_setting_heading('theme_flexium/themecolours', $str('themecolours'), $str('themecolours_desc')));
    $defaults = ['brandcolor' => '', 'secondarycolor' => '', 'successcolor' => '', 'infocolor' => '', 'warningcolor' => '',
        'dangercolor' => ''];
    foreach ($defaults as $name => $default) {
        $setting = new admin_setting_configcolourpicker(
            "theme_flexium/{$name}",
            $str($name),
            $str($name . '_desc'),
            $default
        );
        $setting->set_updatedcallback('theme_reset_all_caches');
        $page->add($setting);
    }

    $page->add(new admin_setting_heading(
        'theme_flexium/runtimecolours',
        $str('runtimecolours'),
        $str('runtimecolours_desc')
    ));
    foreach (['navbarbg', 'navbartext', 'bodybg', 'linkcolor', 'footerbg', 'footertext'] as $name) {
        $page->add(new admin_setting_configcolourpicker("theme_flexium/{$name}", $str($name), $str($name . '_desc'), ''));
    }

    // Contrast of the chosen colour pairs (WCAG 2.1: 4.5:1 for normal text).
    $config = get_config('theme_flexium');
    $pairs = [
        'contrast_brand' => [$config->brandcolor ?? '', '#ffffff'],
        'contrast_navbar' => [$config->navbartext ?? '', $config->navbarbg ?? ''],
        'contrast_link' => [$config->linkcolor ?? '', ($config->bodybg ?? '') ?: '#ffffff'],
        'contrast_footer' => [$config->footertext ?? '', $config->footerbg ?? ''],
    ];
    $rows = '';
    foreach ($pairs as $key => [$foreground, $background]) {
        $ratio = appearance::contrast_ratio((string) $foreground, (string) $background);
        if ($ratio === null) {
            continue;
        }
        $ok = $ratio >= 4.5;
        $rows .= html_writer::tag('li', $str($key) . ': ' . html_writer::tag('strong', $ratio . ':1') . ' '
            . html_writer::span(
                $str($ok ? 'contrast_ok' : 'contrast_low'),
                'badge ' . ($ok ? 'text-bg-success' : 'text-bg-warning')
            ));
    }
    $page->add(new admin_setting_heading(
        'theme_flexium/contrast',
        $str('contrast'),
        $rows ? $str('contrast_desc') . html_writer::tag('ul', $rows) : $str('contrast_none')
    ));

    $settings->add($page);

    // Typography.
    $page = new admin_settingpage('theme_flexium_typography', $str('typographysettings'));
    $fonts = ['' => $str('font_default')] + array_combine(
        array_keys(appearance::GOOGLE_FONTS),
        array_keys(appearance::GOOGLE_FONTS)
    );
    $page->add(new admin_setting_configselect(
        'theme_flexium/fontbody',
        $str('fontbody'),
        $str('fontbody_desc'),
        '',
        $fonts
    ));
    $page->add(new admin_setting_configselect(
        'theme_flexium/fontheadings',
        $str('fontheadings'),
        $str('fontheadings_desc'),
        '',
        ['' => $str('font_sameasbody')] + array_slice($fonts, 1, null, true)
    ));
    $sizes = ['' => $str('fontsize_default')];
    foreach (appearance::FONT_SIZES as $size) {
        $sizes[$size] = $size . ' px';
    }
    $page->add(new admin_setting_configselect(
        'theme_flexium/fontsize',
        $str('fontsize'),
        $str('fontsize_desc'),
        '',
        $sizes
    ));
    $page->add(new admin_setting_configcheckbox(
        'theme_flexium/googlefonts',
        $str('googlefonts'),
        $str('googlefonts_desc'),
        1
    ));
    $settings->add($page);

    // Layout and shape.
    $page = new admin_settingpage('theme_flexium_shape', $str('shapesettings'));
    $radii = ['' => $str('radius_default_theme')];
    foreach (array_keys(appearance::RADII) as $key) {
        $radii[$key] = $str('radius_' . $key);
    }
    $page->add(new admin_setting_configselect('theme_flexium/radius', $str('radius'), $str('radius_desc'), '', $radii));
    $shadows = [];
    foreach (array_keys(appearance::SHADOWS) as $key) {
        $shadows[$key] = $str('shadow_' . $key);
    }
    $page->add(new admin_setting_configselect(
        'theme_flexium/cardshadow',
        $str('cardshadow'),
        $str('cardshadow_desc'),
        'none',
        $shadows
    ));
    $setting = new admin_setting_configstoredfile(
        'theme_flexium/backgroundimage',
        $str('backgroundimage'),
        $str('backgroundimage_desc'),
        'backgroundimage',
        0,
        ['accepted_types' => ['web_image']]
    );
    $setting->set_updatedcallback('theme_reset_all_caches');
    $page->add($setting);
    $settings->add($page);

    // Login page.
    $page = new admin_settingpage('theme_flexium_login', $str('loginsettings'));
    $setting = new admin_setting_configstoredfile(
        'theme_flexium/loginbackgroundimage',
        $str('loginbackgroundimage'),
        $str('loginbackgroundimage_desc'),
        'loginbackgroundimage',
        0,
        ['accepted_types' => ['web_image']]
    );
    $setting->set_updatedcallback('theme_reset_all_caches');
    $page->add($setting);
    $settings->add($page);

    // Footer.
    $page = new admin_settingpage('theme_flexium_footer', $str('footersettings'));
    $page->add(new admin_setting_confightmleditor(
        'theme_flexium/footercontent',
        $str('footercontent'),
        $str('footercontent_desc'),
        ''
    ));
    $page->add(new admin_setting_configtext('theme_flexium/contactemail', $str('contactemail'), '', '', PARAM_EMAIL));
    $page->add(new admin_setting_configtext('theme_flexium/contactphone', $str('contactphone'), '', '', PARAM_TEXT));
    $page->add(new admin_setting_configtext('theme_flexium/contactwebsite', $str('contactwebsite'), '', '', PARAM_URL));
    $page->add(new admin_setting_heading('theme_flexium/socialheading', $str('socialheading'), $str('socialheading_desc')));
    foreach (array_keys(\theme_flexium\output\core_renderer::SOCIAL_NETWORKS) as $network) {
        $page->add(new admin_setting_configtext(
            "theme_flexium/social_{$network}",
            $str('social_' . $network),
            '',
            '',
            PARAM_URL
        ));
    }
    $settings->add($page);

    // Course catalogue.
    $page = new admin_settingpage('theme_flexium_catalog', $str('catalogsettings'));
    $page->add(new admin_setting_configcheckbox(
        'theme_flexium/enablecatalog',
        $str('enablecatalog'),
        $str('enablecatalog_desc'),
        1
    ));
    $perpageoptions = \theme_flexium\local\catalog\catalog::PERPAGE_OPTIONS;
    $page->add(new admin_setting_configselect(
        'theme_flexium/perpage',
        $str('perpage'),
        $str('perpage_desc'),
        $perpageoptions[0],
        array_combine($perpageoptions, $perpageoptions)
    ));
    $page->add(new admin_setting_configcheckbox(
        'theme_flexium/userperpage',
        $str('userperpage'),
        $str('userperpage_desc'),
        0
    ));
    $page->add(new admin_setting_configcheckbox(
        'theme_flexium/filtersdraweropen',
        $str('filtersdraweropen'),
        $str('filtersdraweropen_desc'),
        1
    ));
    $page->add(new \theme_flexium\admin\setting_catalogfilters(
        'theme_flexium/catalogfilters',
        $str('catalogfilters'),
        $str('catalogfilters_desc')
    ));
    $settings->add($page);

    // Course cards of the catalogue.
    $page = new admin_settingpage('theme_flexium_cards', $str('cardsettings'));
    $page->add(new admin_setting_configcheckbox(
        'theme_flexium/cardshowcategory',
        $str('cardshowcategory'),
        $str('cardshowcategory_desc'),
        1
    ));
    $page->add(new admin_setting_configcheckbox(
        'theme_flexium/cardshowsummary',
        $str('cardshowsummary'),
        $str('cardshowsummary_desc'),
        1
    ));
    $badgedefault = array_fill_keys(\theme_flexium\local\catalog\card_config::get_badges(
        \theme_flexium\local\catalog\filter_config::get_layout()
    ), 1);
    $page->add(new admin_setting_configmulticheckbox(
        'theme_flexium/cardbadges',
        $str('cardbadges'),
        $str('cardbadges_desc'),
        $badgedefault,
        \theme_flexium\local\catalog\card_config::get_badge_choices()
    ));
    $page->add(new admin_setting_configcheckbox(
        'theme_flexium/cardbadgerows',
        $str('cardbadgerows'),
        $str('cardbadgerows_desc'),
        0
    ));
    $page->add(new admin_setting_configtext(
        'theme_flexium/cardbadgecolours',
        $str('cardbadgecolours'),
        $str('cardbadgecolours_desc', implode(', ', \theme_flexium\local\catalog\card_config::BADGE_COLOURS)),
        '',
        PARAM_RAW_TRIMMED
    ));
    $footerdefault = array_fill_keys(explode(',', \theme_flexium\local\catalog\card_config::DEFAULT_FOOTER), 1);
    $page->add(new admin_setting_configmulticheckbox(
        'theme_flexium/cardfooter',
        $str('cardfooter'),
        $str('cardfooter_desc'),
        $footerdefault,
        \theme_flexium\local\catalog\card_config::get_footer_choices()
    ));
    $settings->add($page);

    // Home page builder.
    $page = new admin_settingpage('theme_flexium_home', $str('homesettings'));
    $page->add(new admin_setting_configcheckbox(
        'theme_flexium/enablehome',
        $str('enablehome'),
        $str('enablehome_desc'),
        1
    ));
    $settings->add($page);

    // Optional catalogue features, also switched on and off from the catalogue edit mode.
    $page = new admin_settingpage('theme_flexium_features', $str('featuresettings'));
    $page->add(new admin_setting_heading('theme_flexium/featuresintro', '', $str('featuresettings_desc')));
    \theme_flexium\local\catalog\features::add_settings($page);
    $settings->add($page);

    // Breadcrumbs: where, how deep, which items and how they look.
    $page = new admin_settingpage('theme_flexium_breadcrumbs', $str('bcsettings'));
    $page->add(new admin_setting_heading('theme_flexium/bcintro', '', $str('bcsettings_desc')));
    \theme_flexium\local\breadcrumbs::add_settings($page);
    $settings->add($page);

    // Advanced: raw SCSS, read by Boost's callbacks (compiled).
    $page = new admin_settingpage('theme_flexium_advanced', $str('advancedsettings'));
    $setting = new admin_setting_scsscode(
        'theme_flexium/scsspre',
        $str('rawscsspre'),
        $str('rawscsspre_desc'),
        '',
        PARAM_RAW
    );
    $setting->set_updatedcallback('theme_reset_all_caches');
    $page->add($setting);
    $setting = new admin_setting_scsscode('theme_flexium/scss', $str('rawscss'), $str('rawscss_desc'), '', PARAM_RAW);
    $setting->set_updatedcallback('theme_reset_all_caches');
    $page->add($setting);
    $settings->add($page);
}
