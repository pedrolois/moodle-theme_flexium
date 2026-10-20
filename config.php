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
 * Flexium theme configuration.
 *
 * The page shell (header, navigation, drawers, footer) is inherited from Boost.
 * Flexium adds React components on top, starting with the course catalogue.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once(__DIR__ . '/lib.php');

$THEME->name = 'flexium';
$THEME->parents = ['boost'];
$THEME->sheets = [];
$THEME->editor_sheets = [];
$THEME->editor_scss = ['editor'];
$THEME->usefallback = true;
$THEME->scss = function ($theme) {
    return theme_flexium_get_main_scss_content($theme);
};
$THEME->prescsscallback = 'theme_flexium_get_pre_scss';
$THEME->extrascsscallback = 'theme_boost_get_extra_scss';
$THEME->precompiledcsscallback = 'theme_boost_get_precompiled_css';
// Every layout comes from Boost, except the course index: its left drawer holds the catalogue filters.
$THEME->layouts = [
    'coursecategory' => [
        'file' => 'catalog.php',
        'regions' => ['side-pre'],
        'defaultregion' => 'side-pre',
    ],
];
$THEME->enable_dock = false;
$THEME->yuicssmodules = [];
$THEME->rendererfactory = 'theme_overridden_renderer_factory';
$THEME->requiredblocks = '';
$THEME->addblockposition = BLOCK_ADDBLOCK_POSITION_FLATNAV;
$THEME->iconsystem = \core\output\icon_system::FONTAWESOME;
$THEME->haseditswitch = true;
$THEME->usescourseindex = true;
$THEME->activityheaderconfig = [
    'notitle' => true,
];
