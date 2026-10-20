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

namespace theme_flexium\local\footer;

/**
 * What can be set in the footer and in each of its blocks (the magic wand side panel is generated from these fields,
 * with the same field types as the home page builder).
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class fields {
    /**
     * Fields of the footer as a whole.
     *
     * @return array
     */
    public static function style(): array {
        return [
            ['key' => 'background', 'type' => 'select', 'choices' => ['dark', 'light', 'brand', 'palette']],
            ['key' => 'palette', 'type' => 'palette'],
            ['key' => 'align', 'type' => 'select', 'choices' => ['left', 'center']],
            ['key' => 'bottombar', 'type' => 'bool'],
            ['key' => 'moodlebutton', 'type' => 'bool'],
        ];
    }

    /**
     * Fields of every block type.
     *
     * @return array type => list of field definitions
     */
    public static function definitions(): array {
        $title = ['key' => 'title', 'type' => 'text'];
        return [
            'logo' => [
                ['key' => 'size', 'type' => 'select', 'choices' => ['sm', 'md', 'lg']],
                ['key' => 'showname', 'type' => 'bool'],
            ],
            'text' => [$title, ['key' => 'text', 'type' => 'textarea']],
            'links' => [$title, ['key' => 'items', 'type' => 'items', 'fields' => [
                ['key' => 'name', 'type' => 'text'], ['key' => 'url', 'type' => 'url'], ['key' => 'newtab', 'type' => 'bool'],
            ]]],
            'contact' => [$title, ['key' => 'email', 'type' => 'text'], ['key' => 'phone', 'type' => 'text'],
                ['key' => 'website', 'type' => 'url'], ['key' => 'address', 'type' => 'textarea']],
            'social' => [
                $title,
                ['key' => 'items', 'type' => 'items', 'fields' => [
                    ['key' => 'network', 'type' => 'select', 'choices' => array_keys(footer::NETWORKS)],
                    ['key' => 'url', 'type' => 'url'],
                ]],
                ['key' => 'shape', 'type' => 'select', 'choices' => ['round', 'rounded', 'square', 'plain']],
                ['key' => 'variant', 'type' => 'select', 'choices' => ['filled', 'outline', 'soft']],
                ['key' => 'size', 'type' => 'select', 'choices' => ['sm', 'md', 'lg']],
                ['key' => 'brandcolours', 'type' => 'bool'],
            ],
            'legal' => [$title, ['key' => 'items', 'type' => 'checklist', 'choices' => footer::LEGAL]],
            'support' => [['key' => 'style', 'type' => 'select', 'choices' => ['button', 'link']]],
            'usertour' => [],
            'copyright' => [['key' => 'text', 'type' => 'text']],
            'logininfo' => [],
        ];
    }

    /**
     * Fields for the editor.
     *
     * @return array ['style' => fields, 'blocks' => type => fields]
     */
    public static function export(): array {
        $blocks = [];
        foreach (self::definitions() as $type => $definitions) {
            $blocks[$type] = \theme_flexium\local\home\fields::export_fields($definitions);
        }
        return ['style' => \theme_flexium\local\home\fields::export_fields(self::style()), 'blocks' => $blocks];
    }
}
