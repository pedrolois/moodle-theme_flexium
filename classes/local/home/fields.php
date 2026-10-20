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

namespace theme_flexium\local\home;

/**
 * What can be set in each home page section: the side panel of the magic wand is generated from these fields.
 *
 * Field types: text, textarea, html, url, number, bool, select (choices), palette (the six default headers), icon,
 * items (a list of entries, each with its own fields) and checklist (several choices, in order).
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class fields {
    /** @var string[] Course sources of the courses section. */
    public const COURSE_SOURCES = ['latest', 'popular', 'startingsoon', 'inprogress', 'mycourses', 'favourites', 'category'];

    /** @var string[] Icons offered for the feature boxes: key => Font Awesome classes. */
    public const ICONS = [
        'laptop' => 'fa-solid fa-laptop', 'teacher' => 'fa-solid fa-chalkboard-user', 'award' => 'fa-solid fa-award',
        'people' => 'fa-solid fa-people-group', 'book' => 'fa-solid fa-book-open', 'clock' => 'fa-regular fa-clock',
        'globe' => 'fa-solid fa-globe', 'certificate' => 'fa-solid fa-certificate', 'chart' => 'fa-solid fa-chart-line',
        'bulb' => 'fa-regular fa-lightbulb', 'mobile' => 'fa-solid fa-mobile-screen', 'shield' => 'fa-solid fa-shield-halved',
        'rocket' => 'fa-solid fa-rocket', 'heart' => 'fa-regular fa-heart', 'star' => 'fa-regular fa-star',
        'comments' => 'fa-regular fa-comments',
    ];

    /**
     * Fields of every section type.
     *
     * @return array type => list of field definitions
     */
    public static function definitions(): array {
        $title = ['key' => 'title', 'type' => 'text'];
        $subtitle = ['key' => 'subtitle', 'type' => 'text'];
        return [
            'hero' => [
                $title, ['key' => 'text', 'type' => 'textarea'],
                ['key' => 'buttontext', 'type' => 'text'], ['key' => 'buttonurl', 'type' => 'url'],
                ['key' => 'button2text', 'type' => 'text'], ['key' => 'button2url', 'type' => 'url'],
                ['key' => 'search', 'type' => 'bool'],
                ['key' => 'style', 'type' => 'palette'],
                ['key' => 'align', 'type' => 'select', 'choices' => ['left', 'center']],
                ['key' => 'height', 'type' => 'select', 'choices' => ['md', 'lg', 'xl']],
            ],
            'courses' => [
                $title, $subtitle,
                ['key' => 'source', 'type' => 'select', 'choices' => self::COURSE_SOURCES],
                ['key' => 'categoryid', 'type' => 'category'],
                ['key' => 'count', 'type' => 'select', 'choices' => ['4', '6', '8', '12', '16']],
                ['key' => 'layout', 'type' => 'select', 'choices' => ['carousel', 'grid']],
                ['key' => 'columns', 'type' => 'select', 'choices' => ['2', '3', '4']],
                ['key' => 'autoplay', 'type' => 'bool'],
            ],
            'categories' => [
                $title, $subtitle,
                ['key' => 'style', 'type' => 'select', 'choices' => ['tiles', 'chips']],
                ['key' => 'count', 'type' => 'select', 'choices' => ['4', '6', '8', '12']],
            ],
            'stats' => [
                $title,
                ['key' => 'items', 'type' => 'checklist', 'choices' => ['courses', 'users', 'categories', 'completions']],
                ['key' => 'style', 'type' => 'select', 'choices' => ['cards', 'plain']],
            ],
            'features' => [
                $title, $subtitle,
                ['key' => 'columns', 'type' => 'select', 'choices' => ['2', '3', '4']],
                ['key' => 'items', 'type' => 'items', 'fields' => [
                    ['key' => 'icon', 'type' => 'icon'], ['key' => 'title', 'type' => 'text'],
                    ['key' => 'text', 'type' => 'textarea'],
                ]],
            ],
            'steps' => [
                $title,
                ['key' => 'items', 'type' => 'items', 'fields' => [
                    ['key' => 'title', 'type' => 'text'], ['key' => 'text', 'type' => 'textarea'],
                ]],
            ],
            'cta' => [
                $title, ['key' => 'text', 'type' => 'textarea'],
                ['key' => 'buttontext', 'type' => 'text'], ['key' => 'buttonurl', 'type' => 'url'],
                ['key' => 'style', 'type' => 'palette'],
            ],
            'testimonials' => [
                $title,
                ['key' => 'items', 'type' => 'items', 'fields' => [
                    ['key' => 'quote', 'type' => 'textarea'], ['key' => 'name', 'type' => 'text'],
                    ['key' => 'role', 'type' => 'text'],
                ]],
            ],
            'faq' => [
                $title,
                ['key' => 'items', 'type' => 'items', 'fields' => [
                    ['key' => 'question', 'type' => 'text'], ['key' => 'answer', 'type' => 'textarea'],
                ]],
            ],
            'logos' => [
                $title,
                ['key' => 'items', 'type' => 'items', 'fields' => [
                    ['key' => 'name', 'type' => 'text'], ['key' => 'url', 'type' => 'url'],
                ]],
            ],
            'news' => [$title, ['key' => 'count', 'type' => 'select', 'choices' => ['3', '5', '10']]],
            'text' => [$title, ['key' => 'html', 'type' => 'textarea']],
            'sitecontent' => [],
            'spacer' => [['key' => 'size', 'type' => 'select', 'choices' => ['sm', 'md', 'lg']]],
        ];
    }

    /**
     * Fields for the editor, with labels and choice labels.
     *
     * @return array type => list of ['key', 'type', 'label', 'choices' => [['key', 'label']], 'fields' => [...]]
     */
    public static function export(): array {
        $export = [];
        foreach (self::definitions() as $type => $fields) {
            $export[$type] = array_map([self::class, 'export_field'], $fields);
        }
        return $export;
    }

    /**
     * Fields for the editor, with labels (also used by the footer builder).
     *
     * @param array $fields
     * @return array
     */
    public static function export_fields(array $fields): array {
        return array_map([self::class, 'export_field'], $fields);
    }

    /**
     * One field for the editor.
     *
     * @param array $field
     * @return array
     */
    private static function export_field(array $field): array {
        return [
            'key' => $field['key'],
            'type' => $field['type'],
            'label' => get_string('home_field_' . $field['key'], 'theme_flexium'),
            'choices' => array_map(fn($choice) => ['key' => (string) $choice,
                'label' => get_string('home_choice_' . $choice, 'theme_flexium')], $field['choices'] ?? []),
            'fields' => array_map([self::class, 'export_field'], $field['fields'] ?? []),
        ];
    }
}
