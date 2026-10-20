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
 * The home page builder: the page is a list of sections (widgets), stored as JSON in the plugin config "homepage".
 *
 * Sections are rendered by React (theme_flexium/home/HomePage); here they are validated before saving, and the
 * templates (ready made pages) are defined with translatable texts.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class home {
    /** @var string[] Section types. */
    public const TYPES = ['hero', 'courses', 'categories', 'stats', 'features', 'steps', 'cta', 'testimonials', 'faq',
        'logos', 'news', 'text', 'sitecontent', 'spacer'];

    /** @var int Most sections in a page. */
    public const MAX_SECTIONS = 40;

    /** @var int Largest stored page, in bytes. */
    public const MAX_SIZE = 200000;

    /** @var string[] Settings holding rich text (cleaned as HTML, not as plain text). */
    private const HTML_KEYS = ['html', 'answer'];

    /**
     * Whether the home page builder replaces Moodle's site home.
     *
     * @return bool
     */
    public static function enabled(): bool {
        $value = get_config('theme_flexium', 'enablehome');
        return $value === false || !empty($value);
    }

    /**
     * The saved page, or the first template when nothing was saved yet.
     *
     * @return array ['template' => key, 'sections' => list of ['id', 'type', 'settings']]
     */
    public static function get_page(): array {
        $raw = get_config('theme_flexium', 'homepage');
        $page = $raw ? json_decode($raw, true) : null;
        if (!is_array($page) || !isset($page['sections'])) {
            $templates = templates::get_all();
            $page = ['template' => $templates[0]['key'], 'sections' => $templates[0]['sections']];
        }
        return self::clean($page);
    }

    /**
     * Save the page.
     *
     * @param array $page see self::get_page()
     * @return array the saved page
     */
    public static function save(array $page): array {
        $page = self::clean($page);
        $json = json_encode($page);
        if (strlen($json) > self::MAX_SIZE) {
            throw new \moodle_exception('home_toolarge', 'theme_flexium');
        }
        $old = get_config('theme_flexium', 'homepage');
        if ($old !== $json) {
            set_config('homepage', $json, 'theme_flexium');
            add_to_config_log('homepage', $old === false ? null : $old, $json, 'theme_flexium');
        }
        return $page;
    }

    /**
     * Keep known section types and clean every text (plain text, rich text or URL).
     *
     * @param array $page
     * @return array
     */
    public static function clean(array $page): array {
        $sections = [];
        foreach (array_slice((array) ($page['sections'] ?? []), 0, self::MAX_SECTIONS) as $section) {
            if (!is_array($section) || !in_array($section['type'] ?? '', self::TYPES, true)) {
                continue;
            }
            $sections[] = [
                'id' => clean_param((string) ($section['id'] ?? ''), PARAM_ALPHANUMEXT) ?: random_string(8),
                'type' => $section['type'],
                'settings' => self::clean_value((array) ($section['settings'] ?? []), ''),
            ];
        }
        return [
            'template' => clean_param((string) ($page['template'] ?? ''), PARAM_ALPHANUMEXT),
            'sections' => $sections,
        ];
    }

    /**
     * Clean the settings of a section or block (also used by the footer builder).
     *
     * @param array $settings
     * @return array
     */
    public static function clean_settings(array $settings): array {
        return self::clean_value($settings, '');
    }

    /**
     * Clean a setting value, recursively (lists of items).
     *
     * @param mixed $value
     * @param string $key setting name, decides how text is cleaned
     * @return mixed
     */
    private static function clean_value($value, string $key) {
        if (is_array($value)) {
            $clean = [];
            foreach (array_slice($value, 0, 50, true) as $subkey => $item) {
                $clean[is_int($subkey) ? $subkey : clean_param($subkey, PARAM_ALPHANUMEXT)] =
                    self::clean_value($item, is_int($subkey) ? $key : (string) $subkey);
            }
            return array_is_list($value) ? array_values($clean) : $clean;
        }
        if (is_bool($value) || is_int($value) || is_float($value)) {
            return $value;
        }
        $value = \core_text::substr((string) $value, 0, 5000);
        if (in_array($key, self::HTML_KEYS, true)) {
            return clean_text($value, FORMAT_HTML);
        }
        if (str_ends_with($key, 'url')) {
            return clean_param($value, PARAM_URL);
        }
        return clean_param($value, PARAM_TEXT);
    }

    /**
     * Data of the dynamic sections: categories, site figures and news. Visible to visitors (what any visitor of the
     * site home may see).
     *
     * @return array see \theme_flexium\external\get_home_data::execute_returns()
     */
    public static function get_data(): array {
        global $DB, $SITE, $CFG;

        $categories = [];
        foreach (\core_course_category::top()->get_children() as $category) {
            $categories[] = [
                'id' => (int) $category->id,
                'name' => $category->get_formatted_name(),
                'coursecount' => (int) $category->get_courses_count(['recursive' => true]),
                'url' => (new \core\url('/course/index.php', ['categoryid' => $category->id]))->out(false),
            ];
        }

        $stats = [
            'courses' => $DB->count_records_select('course', 'id <> :site AND visible = 1', ['site' => SITEID]),
            'users' => $DB->count_records_select('user', 'deleted = 0 AND suspended = 0 AND confirmed = 1 AND id > 2'),
            'categories' => $DB->count_records('course_categories', ['visible' => 1]),
            'completions' => $DB->count_records_select('course_completions', 'timecompleted IS NOT NULL'),
        ];

        $news = [];
        require_once($CFG->dirroot . '/mod/forum/lib.php');
        if ($SITE->newsitems && ($forum = forum_get_course_forum($SITE->id, 'news'))) {
            $cm = get_coursemodule_from_instance('forum', $forum->id, $SITE->id);
            $context = \core\context\module::instance($cm->id);
            if (has_capability('mod/forum:viewdiscussion', $context)) {
                $discussions = $DB->get_records(
                    'forum_discussions',
                    ['forum' => $forum->id],
                    'timemodified DESC',
                    'id, name, timemodified',
                    0,
                    10
                );
                foreach ($discussions as $discussion) {
                    $news[] = [
                        'title' => format_string($discussion->name, true, ['context' => $context]),
                        'url' => (new \core\url('/mod/forum/discuss.php', ['d' => $discussion->id]))->out(false),
                        'date' => userdate($discussion->timemodified, get_string('strftimedate', 'langconfig')),
                    ];
                }
            }
        }

        return ['categories' => $categories, 'stats' => $stats, 'news' => $news];
    }
}
