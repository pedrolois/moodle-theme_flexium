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

namespace theme_flexium\local\catalog;

/**
 * Available catalogue filter sources and the admin-defined filter layout.
 *
 * A filter source is identified by a string key:
 *  - "category": the course category tree;
 *  - "tag": course tags;
 *  - "customfield:<shortname>": a course custom field of a filterable type.
 *
 * The admin layout (setting theme_flexium/catalogfilters) is a JSON list of
 * {"source": key, "expanded": bool}, in display order. Sources not in the list are not shown.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class filter_config {
    /** @var string Source key of the category tree filter. */
    public const SOURCE_CATEGORY = 'category';

    /** @var string Source key of the course tags filter. */
    public const SOURCE_TAG = 'tag';

    /** @var string Prefix of course custom field source keys. */
    public const CUSTOMFIELD_PREFIX = 'customfield:';

    /** @var string[] Custom field types whose values can be used as filter options. */
    public const FILTERABLE_FIELD_TYPES = ['select', 'checkbox', 'keywords', 'text', 'date'];

    /** @var array|null Per-request cache of the available sources. */
    private static ?array $sources = null;

    /**
     * Every filter source that can be added to the catalogue, keyed by source key.
     *
     * @return array source key => ['source' => key, 'type' => 'tree'|'list', 'label' => string,
     *         'fieldtype' => string|null, 'field' => \core_customfield\field_controller|null]
     */
    public static function get_available_sources(): array {
        if (self::$sources !== null) {
            return self::$sources;
        }

        $sources = [
            self::SOURCE_CATEGORY => [
                'source' => self::SOURCE_CATEGORY,
                'type' => 'tree',
                'label' => get_string('categories'),
                'fieldtype' => null,
                'field' => null,
            ],
        ];
        if (\core_tag_tag::is_enabled('core', 'course')) {
            $sources[self::SOURCE_TAG] = [
                'source' => self::SOURCE_TAG,
                'type' => 'list',
                'label' => get_string('tags'),
                'fieldtype' => null,
                'field' => null,
            ];
        }

        $handler = \core_course\customfield\course_handler::create();
        foreach ($handler->get_fields() as $field) {
            $type = $field->get('type');
            if (!in_array($type, self::FILTERABLE_FIELD_TYPES, true)) {
                continue;
            }
            // Only fields everybody can see may be offered in a public catalogue.
            $visibility = $field->get_configdata_property('visibility') ?? $handler::VISIBLETOALL;
            if ((int) $visibility !== $handler::VISIBLETOALL) {
                continue;
            }
            $key = self::CUSTOMFIELD_PREFIX . $field->get('shortname');
            $sources[$key] = [
                'source' => $key,
                'type' => 'list',
                'label' => $field->get_formatted_name(),
                'fieldtype' => $type,
                'field' => $field,
            ];
        }

        self::$sources = $sources;
        return $sources;
    }

    /**
     * The default layout used until the admin saves one: categories, then select/keywords fields, then tags.
     *
     * @return array list of ['source' => key, 'expanded' => bool]
     */
    public static function get_default_layout(): array {
        $layout = [];
        foreach (self::get_available_sources() as $key => $source) {
            if ($key === self::SOURCE_TAG) {
                continue;
            }
            if ($source['fieldtype'] !== null && !in_array($source['fieldtype'], ['select', 'keywords'], true)) {
                continue;
            }
            $layout[] = ['source' => $key, 'expanded' => $key === self::SOURCE_CATEGORY, 'label' => ''];
        }
        if (isset(self::get_available_sources()[self::SOURCE_TAG])) {
            $layout[] = ['source' => self::SOURCE_TAG, 'expanded' => false, 'label' => ''];
        }
        return $layout;
    }

    /**
     * The filter layout configured by the admin, restricted to sources that still exist.
     *
     * @return array list of ['source' => key, 'expanded' => bool]
     */
    public static function get_layout(): array {
        $raw = preview::get('catalogfilters');
        if ($raw === false || $raw === '') {
            return self::get_default_layout();
        }
        return self::clean_layout(json_decode($raw, true));
    }

    /**
     * Normalise a decoded layout: drop unknown or duplicate sources and invalid entries.
     *
     * @param mixed $layout decoded JSON
     * @return array list of ['source' => key, 'expanded' => bool]
     */
    public static function clean_layout($layout): array {
        if (!is_array($layout)) {
            return [];
        }
        $available = self::get_available_sources();
        $clean = [];
        $seen = [];
        foreach ($layout as $item) {
            $key = is_array($item) ? (string) ($item['source'] ?? '') : '';
            if (!isset($available[$key]) || isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;
            $label = \core_text::substr(trim(clean_param((string) ($item['label'] ?? ''), PARAM_TEXT)), 0, 100);
            $clean[] = ['source' => $key, 'expanded' => !empty($item['expanded']), 'label' => $label];
        }
        return $clean;
    }

    /**
     * Reset the per-request cache (used by tests after creating custom fields).
     */
    public static function reset_caches(): void {
        self::$sources = null;
    }
}
