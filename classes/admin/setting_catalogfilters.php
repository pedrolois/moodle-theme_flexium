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

namespace theme_flexium\admin;

use core\output\html_writer;
use theme_flexium\local\catalog\filter_config;

/**
 * Admin setting holding the catalogue filter layout, edited with a drag and drop React component.
 *
 * The component keeps a hidden input up to date with the layout as JSON; the value is saved with
 * the rest of the settings page, through the standard admin settings form.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class setting_catalogfilters extends \admin_setting {
    /**
     * Constructor.
     *
     * @param string $name setting name
     * @param string $visiblename
     * @param string $description
     */
    public function __construct(string $name, string $visiblename, string $description) {
        parent::__construct($name, $visiblename, $description, '');
    }

    /**
     * Current value: the stored JSON, or '' while the default layout applies.
     *
     * @return string|null
     */
    public function get_setting() {
        return $this->config_read($this->name);
    }

    /**
     * Validate and store the layout.
     *
     * @param mixed $data JSON posted by the hidden input
     * @return string empty on success, error message otherwise
     */
    public function write_setting($data) {
        if ((string) $data === '') {
            // An empty value means the default layout is used, see filter_config::get_layout.
            return $this->config_write($this->name, '') ? '' : get_string('errorsetting', 'admin');
        }
        $layout = json_decode((string) $data, true);
        if (!is_array($layout)) {
            return get_string('catalogfilters_invalid', 'theme_flexium');
        }
        $json = json_encode(filter_config::clean_layout($layout));
        return $this->config_write($this->name, $json) ? '' : get_string('errorsetting', 'admin');
    }

    /**
     * Render the editor.
     *
     * @param mixed $data current value
     * @param string $query
     * @return string
     */
    public function output_html($data, $query = '') {
        $layout = filter_config::get_layout();
        $inputid = $this->get_id();

        $sources = [];
        foreach (filter_config::get_available_sources() as $source) {
            $sources[] = [
                'source' => $source['source'],
                'label' => $source['label'],
                'kind' => $source['fieldtype'] === null
                    ? get_string('source_' . $source['source'], 'theme_flexium')
                    : get_string('source_customfield', 'theme_flexium', $source['fieldtype']),
            ];
        }

        $strings = [];
        $keys = [
            'filtereditor_shown', 'filtereditor_available', 'filtereditor_add', 'filtereditor_remove',
            'filtereditor_moveup', 'filtereditor_movedown', 'filtereditor_expanded', 'filtereditor_drag',
            'filtereditor_empty', 'filtereditor_noavailable', 'filtereditor_moved',
        ];
        foreach ($keys as $key) {
            $strings[$key] = get_string($key, 'theme_flexium', '{$a}');
        }

        $element = html_writer::empty_tag('input', [
            'type' => 'hidden',
            'id' => $inputid,
            'name' => $this->get_full_name(),
            'value' => json_encode($layout),
        ]);
        $element .= html_writer::react_component('@moodle/lms/theme_flexium/admin/FilterEditor', [
            'inputid' => $inputid,
            'layout' => $layout,
            'sources' => $sources,
            'strings' => $strings,
        ]);

        return format_admin_setting($this, $this->visiblename, $element, $this->description, false, '', null, $query);
    }
}
