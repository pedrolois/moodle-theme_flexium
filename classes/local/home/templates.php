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

use core\url;

/**
 * Ready made home pages: each template is a list of sections with example texts, to start from and then edit.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class templates {
    /** @var string[] Template keys, in the order offered. */
    public const KEYS = ['academy', 'corporate', 'university', 'minimal', 'community', 'catalogue', 'events', 'skills',
        'publicsector', 'compact'];

    /**
     * Every template: key, name, description, accent palette and sections.
     *
     * @return array list of ['key', 'name', 'description', 'palette', 'sections']
     */
    public static function get_all(): array {
        $templates = [];
        foreach (self::KEYS as $key) {
            $templates[] = [
                'key' => $key,
                'name' => self::str("tpl_{$key}"),
                'description' => self::str("tpl_{$key}_desc"),
                'palette' => self::palette($key),
                'sections' => self::number(self::sections($key)),
            ];
        }
        return $templates;
    }

    /**
     * Header colours of a template (one of the six default headers).
     *
     * @param string $key
     * @return string
     */
    private static function palette(string $key): string {
        return [
            'academy' => '1', 'corporate' => '4', 'university' => '3', 'minimal' => '2', 'community' => '5',
            'catalogue' => '2', 'events' => '3', 'skills' => '6', 'publicsector' => '4', 'compact' => '1',
        ][$key];
    }

    /**
     * Sections of a template.
     *
     * @param string $key
     * @return array
     */
    private static function sections(string $key): array {
        $palette = self::palette($key);
        $hero = fn(array $extra = []) => self::section('hero', $extra + [
            'title' => self::str("tpl_{$key}_title"),
            'text' => self::str("tpl_{$key}_text"),
            'buttontext' => self::str('home_explore'),
            'buttonurl' => (new url('/course/index.php'))->out(false),
            'button2text' => '',
            'button2url' => '',
            'style' => $palette,
            'align' => 'left',
            'height' => 'lg',
            'search' => false,
        ]);
        $courses = fn(string $source, string $layout, int $count = 8) => self::section('courses', [
            'title' => self::str('home_courses_' . $source),
            'subtitle' => '',
            'source' => $source,
            'categoryid' => 0,
            'count' => $count,
            'layout' => $layout,
            'columns' => 4,
            'autoplay' => false,
        ]);
        $categories = fn(string $style = 'tiles') => self::section('categories', [
            'title' => self::str('home_categories'),
            'subtitle' => '',
            'style' => $style,
            'count' => 8,
        ]);
        $stats = fn() => self::section('stats', [
            'title' => self::str('home_stats'),
            'items' => ['courses', 'users', 'categories', 'completions'],
            'style' => 'cards',
        ]);
        $features = fn(int $count = 3) => self::section('features', [
            'title' => self::str('home_features'),
            'subtitle' => '',
            'columns' => $count,
            'items' => array_slice([
                ['icon' => 'fa-solid fa-laptop', 'title' => self::str('home_feature1'), 'text' => self::str('home_feature1_text')],
                ['icon' => 'fa-solid fa-chalkboard-user', 'title' => self::str('home_feature2'),
                    'text' => self::str('home_feature2_text')],
                ['icon' => 'fa-solid fa-award', 'title' => self::str('home_feature3'), 'text' => self::str('home_feature3_text')],
                ['icon' => 'fa-solid fa-people-group', 'title' => self::str('home_feature4'),
                    'text' => self::str('home_feature4_text')],
            ], 0, $count),
        ]);
        $steps = fn() => self::section('steps', [
            'title' => self::str('home_steps'),
            'items' => [
                ['title' => self::str('home_step1'), 'text' => self::str('home_step1_text')],
                ['title' => self::str('home_step2'), 'text' => self::str('home_step2_text')],
                ['title' => self::str('home_step3'), 'text' => self::str('home_step3_text')],
            ],
        ]);
        $cta = fn(string $style) => self::section('cta', [
            'title' => self::str('home_cta'),
            'text' => self::str('home_cta_text'),
            'buttontext' => self::str('home_explore'),
            'buttonurl' => (new url('/course/index.php'))->out(false),
            'style' => $style,
        ]);
        $testimonials = fn() => self::section('testimonials', [
            'title' => self::str('home_testimonials'),
            'items' => [
                [
                    'quote' => self::str('home_quote1'),
                    'name' => self::str('home_quote_name'),
                    'role' => self::str('home_quote_role'),
                ],
                [
                    'quote' => self::str('home_quote2'),
                    'name' => self::str('home_quote_name'),
                    'role' => self::str('home_quote_role'),
                ],
                [
                    'quote' => self::str('home_quote3'),
                    'name' => self::str('home_quote_name'),
                    'role' => self::str('home_quote_role'),
                ],
            ],
        ]);
        $faq = fn() => self::section('faq', [
            'title' => self::str('home_faq'),
            'items' => [
                ['question' => self::str('home_faq1'), 'answer' => self::str('home_faq1_answer')],
                ['question' => self::str('home_faq2'), 'answer' => self::str('home_faq2_answer')],
                ['question' => self::str('home_faq3'), 'answer' => self::str('home_faq3_answer')],
            ],
        ]);
        $news = fn() => self::section('news', ['title' => self::str('home_news'), 'count' => 3]);
        $logos = fn() => self::section('logos', [
            'title' => self::str('home_partners'),
            'items' => array_map(fn($n) => ['name' => self::str('home_partner', $n), 'url' => ''], [1, 2, 3, 4, 5]),
        ]);

        return match ($key) {
            'academy' => [$hero(['search' => true]), $courses('latest', 'carousel'), $categories(), $stats(), $cta($palette)],
            'corporate' => [$hero(['button2text' => self::str('home_signup'),
                'button2url' => (new url('/login/signup.php'))->out(false)]), $features(3), $courses('popular', 'grid'),
                $steps(), $testimonials(), $cta('4')],
            'university' => [$hero(['align' => 'center']), $categories(), $courses('startingsoon', 'carousel'), $news(), $faq()],
            'minimal' => [$hero(['align' => 'center', 'height' => 'md']), $courses('latest', 'grid'),
                self::section('sitecontent', [])],
            'community' => [$hero(), $stats(), $testimonials(), $courses('popular', 'carousel'), $cta('5')],
            'catalogue' => [$hero(['search' => true, 'height' => 'md']), $categories('chips'), $courses('latest', 'grid', 12),
                $courses('popular', 'carousel')],
            'events' => [$hero(), $courses('startingsoon', 'grid'), $steps(), $news(), $cta('3')],
            'skills' => [$hero(['align' => 'center']), $features(4), $courses('mycourses', 'carousel'), $categories(), $faq()],
            'publicsector' => [$hero(), $stats(), $features(3), $logos(), $courses('popular', 'grid'), $cta('4')],
            'compact' => [$courses('mycourses', 'carousel'), $courses('latest', 'carousel'), $news(), $categories('chips')],
        };
    }

    /**
     * One section.
     *
     * @param string $type
     * @param array $settings
     * @return array
     */
    private static function section(string $type, array $settings): array {
        return ['id' => '', 'type' => $type, 'settings' => $settings];
    }

    /**
     * Give the sections stable ids.
     *
     * @param array $sections
     * @return array
     */
    private static function number(array $sections): array {
        foreach ($sections as $index => &$section) {
            $section['id'] = 's' . ($index + 1);
        }
        return $sections;
    }

    /**
     * A theme string.
     *
     * @param string $key
     * @param mixed $a
     * @return string
     */
    private static function str(string $key, $a = null): string {
        return get_string($key, 'theme_flexium', $a);
    }
}
