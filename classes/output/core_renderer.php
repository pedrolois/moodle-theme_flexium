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

namespace theme_flexium\output;

/**
 * Core renderer: adds the Flexium site footer and the configurable breadcrumbs.
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class core_renderer extends \theme_boost\output\core_renderer {
    /** @var string[] Social networks offered in the footer: setting name => Font Awesome brand icon. */
    public const SOCIAL_NETWORKS = [
        'linkedin' => 'fa-brands fa-linkedin',
        'x' => 'fa-brands fa-x-twitter',
        'facebook' => 'fa-brands fa-facebook',
        'instagram' => 'fa-brands fa-instagram',
        'youtube' => 'fa-brands fa-youtube',
        'github' => 'fa-brands fa-github',
    ];

    /**
     * Body classes, without "limitedwidth" on the site home built with the home page builder.
     *
     * index.php adds it: Moodle's 830px reading width, with the side drawers anchored next to it. The home page
     * is wider, so anchored drawers would cover its sections; without it they open at the window edge.
     *
     * @param array $additionalclasses
     * @return string
     */
    public function body_css_classes(array $additionalclasses = []) {
        $classes = parent::body_css_classes($additionalclasses);
        if ($this->page->pagelayout === 'frontpage' && \theme_flexium\local\home\home::enabled()) {
            $classes = trim(preg_replace('/\s+/', ' ', preg_replace('/(^|\s)limitedwidth(?=\s|$)/', ' ', $classes)));
        }
        return $classes;
    }

    /**
     * Session notifications, without the "Edit this activity / This page should automatically redirect" ones.
     *
     * Moodle queues that message when someone who can edit opens a single activity URL course: the browser goes to
     * the external site at once, so the message only shows later, on an unrelated page.
     *
     * @param bool $onlyifnotcalledbefore
     * @return string
     */
    public function course_content_header($onlyifnotcalledbefore = false) {
        $redirect = get_string('pageshouldredirect');
        $notifications = \core\notification::fetch();
        foreach ($notifications as $notification) {
            if (!str_contains($notification->get_message(), $redirect)) {
                \core\notification::add($notification->get_message(), $notification->get_message_type());
            }
        }
        return parent::course_content_header($onlyifnotcalledbefore);
    }

    /**
     * Breadcrumbs as configured in the theme settings (Breadcrumbs tab), '' where they are switched off.
     *
     * @return string HTML
     */
    public function navbar(): string {
        $context = \theme_flexium\local\breadcrumbs::export($this->page);
        if ($context) {
            return $this->render_from_template('theme_flexium/breadcrumbs', $context);
        }
        if (
            \theme_flexium\local\breadcrumbs::page_kind($this->page) === 'catalogue' && $this->page->user_is_editing()
                && has_capability('moodle/site:config', \core\context\system::instance())
        ) {
            return \core\output\html_writer::tag(
                'nav',
                get_string('bcsettings', 'theme_flexium'),
                ['class' => 'flexium-breadcrumbs flexium-breadcrumbs--off']
            );
        }
        return '';
    }

    /**
     * The site footer, built with the footer builder (React). Site administrators with edit mode on edit it in place.
     *
     * Called from the theme_boost/footer template override.
     *
     * @return string HTML
     */
    public function flexium_footer(): string {
        $footer = \theme_flexium\local\footer\footer::class;
        $editing = $this->page->user_is_editing() && has_capability('moodle/site:config', \core\context\system::instance());
        $strings = [];
        $keys = [
            'footer_editor_title', 'footer_editor_help', 'footer_addblock', 'footer_column', 'footer_addcolumn',
            'footer_removecolumn', 'footer_bottom', 'footer_style', 'footer_drag', 'footer_moveleft', 'footer_moveright',
            'home_moveup', 'home_movedown', 'footer_deleteblock', 'footer_deleteblock_confirm', 'footer_removecolumn_confirm',
            'home_additem', 'home_removeitem',
            'editor_save', 'editor_saving', 'editor_saved', 'editor_error', 'editor_reset', 'editor_unsaved',
            'editor_closepanel', 'editor_wand', 'editor_leaveunsaved', 'footer_empty', 'footer_notavailable',
        ];
        foreach ($keys as $key) {
            $strings[$key] = get_string($key, 'theme_flexium', '{$a}');
        }
        foreach ($footer::TYPES as $type) {
            $strings['footer_type_' . $type] = get_string('footer_type_' . $type, 'theme_flexium');
            $strings['footer_type_' . $type . '_desc'] = get_string('footer_type_' . $type . '_desc', 'theme_flexium');
        }
        foreach (array_keys($footer::NETWORKS) as $network) {
            $strings['network_' . $network] = get_string('network_' . $network, 'theme_flexium');
        }
        $html = \core\output\html_writer::react_component('@moodle/lms/theme_flexium/footer/SiteFooter', [
            'layout' => $footer::get_layout(),
            'data' => $footer::get_data(),
            'networks' => $footer::NETWORKS,
            'palette' => \theme_flexium\local\catalog\features::palette_images(),
            'strings' => $strings,
            'editor' => $editing ? [
                'schema' => \theme_flexium\local\footer\fields::export(),
                'types' => $footer::TYPES,
            ] : null,
        ]);
        return $html . ($editing ? $this->margins_wand() : '');
    }

    /**
     * The page margins wand, on every page while a site administrator has edit mode on.
     *
     * @return string HTML
     */
    protected function margins_wand(): string {
        $strings = [];
        $keys = [
            'margins_title', 'margins_help', 'margins_scope', 'margins_scope_site', 'margins_scope_home',
            'margins_scope_catalog', 'margins_left', 'margins_right', 'margins_link', 'margins_default',
            'margins_override', 'margins_alsoapply', 'margins_footer', 'margins_navbar',
            'editor_save', 'editor_saving', 'editor_saved', 'editor_error', 'editor_reset',
            'editor_unsaved', 'editor_closepanel',
        ];
        foreach ($keys as $key) {
            $strings[$key] = get_string($key, 'theme_flexium', '{$a}');
        }
        return \core\output\html_writer::react_component('@moodle/lms/theme_flexium/margins/MarginsWand', [
            'margins' => \theme_flexium\local\margins::get(),
            'pagescope' => \theme_flexium\local\margins::page_scope($this->page),
            'max' => \theme_flexium\local\margins::MAX,
            'strings' => $strings,
        ]);
    }
}
