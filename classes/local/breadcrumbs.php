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

use core\url;

/**
 * Configurable breadcrumbs (theme settings, Breadcrumbs tab): where they show, how deep, which items, how they look.
 *
 * Settings are stored as plugin config "bc_<key>"; unset means the default.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class breadcrumbs {
    /** @var string Config name prefix. */
    public const PREFIX = 'bc_';

    /** @var string[] Kinds of page the breadcrumbs can be shown on. */
    public const PAGES = ['frontpage', 'dashboard', 'catalogue', 'course', 'activity', 'admin', 'user', 'other'];

    /** @var string[] Separators: key => character. */
    public const SEPARATORS = ['chevron' => '›', 'slash' => '/', 'arrow' => '→', 'dot' => '·', 'pipe' => '|'];

    /**
     * Every setting: key => ['type' (bool, select, list), 'default', 'choices'].
     *
     * @return array
     */
    public static function definitions(): array {
        return [
            'enabled' => ['type' => 'bool', 'default' => '1'],
            'pages' => ['type' => 'list', 'default' => 'catalogue,course,activity,admin,user,other', 'choices' => self::PAGES],
            'source' => ['type' => 'select', 'default' => 'smart', 'choices' => ['smart', 'full']],
            'home' => ['type' => 'select', 'default' => 'icon', 'choices' => ['none', 'icon', 'text', 'icontext']],
            'maxitems' => ['type' => 'select', 'default' => '0', 'choices' => ['0', '2', '3', '4', '5', '6', '8']],
            'maxlength' => ['type' => 'select', 'default' => '40', 'choices' => ['0', '20', '30', '40', '60']],
            'hidelast' => ['type' => 'bool', 'default' => '0'],
            'hidecategories' => ['type' => 'bool', 'default' => '0'],
            'hidesections' => ['type' => 'bool', 'default' => '0'],
            'separator' => ['type' => 'select', 'default' => 'chevron', 'choices' => array_keys(self::SEPARATORS)],
            'style' => ['type' => 'select', 'default' => 'plain', 'choices' => ['plain', 'pills', 'boxed']],
            'mobile' => ['type' => 'select', 'default' => 'parent', 'choices' => ['full', 'parent', 'hidden']],
        ];
    }

    /**
     * Current value of every setting: bool for switches, string[] for lists, string otherwise.
     *
     * @return array
     */
    public static function get_config(): array {
        $config = (array) get_config('theme_flexium');
        $values = [];
        foreach (self::definitions() as $key => $definition) {
            $value = (string) ($config[self::PREFIX . $key] ?? $definition['default']);
            $values[$key] = match ($definition['type']) {
                'bool' => !empty($value),
                'list' => array_values(array_intersect(explode(',', $value), $definition['choices'])),
                default => in_array($value, $definition['choices'], true) ? $value : $definition['default'],
            };
        }
        return $values;
    }

    /**
     * Stored values as strings ('1'/'0', choice, comma separated list), keyed "bc_<setting>" like the config.
     *
     * @return string[]
     */
    public static function get_raw(): array {
        $raw = [];
        foreach (self::get_config() as $key => $value) {
            $raw[self::PREFIX . $key] = match (true) {
                is_bool($value) => $value ? '1' : '0',
                is_array($value) => implode(',', $value),
                default => (string) $value,
            };
        }
        return $raw;
    }

    /**
     * Save some settings, logging the changes like the admin settings do.
     *
     * @param array $values "bc_<setting>" => raw value (other keys are ignored)
     */
    public static function save(array $values): void {
        $definitions = self::definitions();
        foreach ($values as $name => $value) {
            $key = substr((string) $name, strlen(self::PREFIX));
            if (!str_starts_with((string) $name, self::PREFIX) || !isset($definitions[$key])) {
                continue;
            }
            $definition = $definitions[$key];
            $value = (string) $value;
            $value = match ($definition['type']) {
                'bool' => empty($value) ? '0' : '1',
                'list' => implode(',', array_values(array_intersect(explode(',', $value), $definition['choices']))),
                default => in_array($value, $definition['choices'], true) ? $value : $definition['default'],
            };
            $old = get_config('theme_flexium', $name);
            if ($old !== $value) {
                set_config($name, $value, 'theme_flexium');
                add_to_config_log($name, $old === false ? null : $old, $value, 'theme_flexium');
            }
        }
    }

    /**
     * Definitions for the catalogue editor, like \theme_flexium\local\catalog\features::export_definitions().
     *
     * @return array
     */
    public static function export_definitions(): array {
        $export = [];
        foreach (self::definitions() as $key => $definition) {
            $export[] = [
                'key' => self::PREFIX . $key,
                'group' => 'breadcrumbs',
                'type' => $definition['type'],
                'label' => get_string('bc_' . $key, 'theme_flexium'),
                'help' => get_string('bc_' . $key . '_desc', 'theme_flexium'),
                'choices' => array_map(fn($choice) => ['key' => (string) $choice,
                    'label' => self::choice_label($key, (string) $choice)], $definition['choices'] ?? []),
            ];
        }
        return $export;
    }

    /**
     * Add the settings to an admin page (Breadcrumbs tab).
     *
     * @param \admin_settingpage $page
     */
    public static function add_settings(\admin_settingpage $page): void {
        $component = 'theme_flexium';
        foreach (self::definitions() as $key => $definition) {
            $name = "$component/" . self::PREFIX . $key;
            $label = get_string('bc_' . $key, $component);
            $help = get_string('bc_' . $key . '_desc', $component);
            $choices = [];
            foreach ($definition['choices'] ?? [] as $choice) {
                $choices[$choice] = self::choice_label($key, (string) $choice);
            }
            $page->add(match ($definition['type']) {
                'bool' => new \admin_setting_configcheckbox($name, $label, $help, $definition['default']),
                'list' => new \admin_setting_configmulticheckbox($name, $label, $help,
                    array_fill_keys(explode(',', $definition['default']), 1), $choices),
                default => new \admin_setting_configselect($name, $label, $help, $definition['default'], $choices),
            });
        }
    }

    /**
     * Label of a choice.
     *
     * @param string $key setting
     * @param string $choice
     * @return string
     */
    private static function choice_label(string $key, string $choice): string {
        return match (true) {
            $key === 'separator' => get_string('bc_separator_' . $choice, 'theme_flexium', self::SEPARATORS[$choice]),
            $key === 'maxitems' && $choice === '0', $key === 'maxlength' && $choice === '0' =>
                get_string('bc_nolimit', 'theme_flexium'),
            $key === 'maxitems' => get_string('bc_maxitems_n', 'theme_flexium', $choice),
            $key === 'maxlength' => get_string('bc_maxlength_n', 'theme_flexium', $choice),
            default => get_string('bc_' . $key . '_' . $choice, 'theme_flexium'),
        };
    }

    /**
     * The kind of page (self::PAGES) of a page.
     *
     * @param \moodle_page $page
     * @return string
     */
    public static function page_kind(\moodle_page $page): string {
        return match (true) {
            $page->pagelayout === 'frontpage' => 'frontpage',
            in_array($page->pagelayout, ['mydashboard', 'mycourses'], true) => 'dashboard',
            str_starts_with($page->pagetype, 'course-index') => 'catalogue',
            $page->pagelayout === 'admin' => 'admin',
            str_starts_with($page->pagetype, 'user-') => 'user',
            $page->context->contextlevel === CONTEXT_MODULE => 'activity',
            in_array($page->pagelayout, ['course', 'incourse'], true) => 'course',
            default => 'other',
        };
    }

    /**
     * Template context of the breadcrumbs of a page, null when they are not shown there.
     *
     * @param \moodle_page $page
     * @return array|null see templates/breadcrumbs.mustache
     */
    public static function export(\moodle_page $page): ?array {
        $config = self::get_config();
        if (!$config['enabled'] || !in_array(self::page_kind($page), $config['pages'], true)) {
            return null;
        }

        $source = $config['source'] === 'full' ? $page->navbar->get_items()
            : (new \theme_boost\boostnavbar($page))->get_items();
        $homeurls = [(new url('/'))->out(false), (new url('/index.php'))->out(false), (new url('/my/'))->out(false),
            (new url('/my/index.php'))->out(false)];

        $items = [];
        foreach ($source as $node) {
            $action = $node->action instanceof url ? $node->action->out(false) : '';
            if ($node->key === 'home' || $node->key === 'myhome' || in_array($action, $homeurls, true)) {
                continue; // Home is added by the "Home" setting.
            }
            if (
                ($config['hidecategories'] && $node->type == \navigation_node::TYPE_CATEGORY)
                    || ($config['hidesections'] && $node->type == \navigation_node::TYPE_SECTION)
            ) {
                continue;
            }
            $text = trim(strip_tags((string) $node->get_content()));
            if ($text === '') {
                continue;
            }
            $short = $config['maxlength'] !== '0' ? shorten_text($text, (int) $config['maxlength']) : $text;
            $items[] = ['text' => $short, 'title' => $text, 'url' => $action, 'hidden' => (bool) $node->is_hidden()];
        }
        if ($config['hidelast'] && count($items) > 1) {
            array_pop($items);
        }
        if ($config['home'] !== 'none') {
            array_unshift($items, [
                'text' => get_string('home'),
                'title' => get_string('home'),
                'url' => (new url('/'))->out(false),
                'hidden' => false,
                'ishome' => true,
                'homeicon' => in_array($config['home'], ['icon', 'icontext'], true),
                'hometext' => in_array($config['home'], ['text', 'icontext'], true),
            ]);
        }
        if (!$items) {
            return null;
        }

        // Too many items: keep the first and the last ones, the middle ones go into an expandable "…".
        $collapsed = [];
        $max = (int) $config['maxitems'];
        if ($max > 1 && count($items) > $max) {
            $collapsed = array_splice($items, 1, count($items) - $max + 1);
            array_splice($items, 1, 0, [['ellipsis' => true, 'collapsed' => $collapsed]]);
        }

        $last = count($items) - 1;
        foreach ($items as $index => &$item) {
            $item['islast'] = $index === $last;
            // Small screens with "Parent only": the item before the current page.
            $item['isparent'] = $index === $last - 1;
        }
        unset($item);

        return [
            'items' => $items,
            'separator' => self::SEPARATORS[$config['separator']],
            'style' => $config['style'],
            'mobile' => $config['mobile'],
        ];
    }
}
