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

use core\url;
use theme_flexium\local\home\home;

/**
 * The footer builder: columns of blocks (logo, text, links, contact, social networks, legal links, support, user
 * tour reset, copyright) and a bottom bar, stored as JSON in the plugin config "footerlayout".
 *
 * The footer is rendered by React (theme_flexium/footer/SiteFooter) on every page; site administrators edit it in
 * place with edit mode on (magic wands, drag and drop).
 *
 * @package   theme_flexium
 * @author    Pedro Luis Garcia Leiva
 * @copyright 2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class footer {
    /** @var string[] Block types. */
    public const TYPES = ['logo', 'text', 'links', 'contact', 'social', 'legal', 'support', 'usertour', 'copyright',
        'logininfo'];

    /** @var string[] Social networks: key => Font Awesome brand icon. */
    public const NETWORKS = [
        'linkedin' => 'fa-brands fa-linkedin-in', 'x' => 'fa-brands fa-x-twitter', 'facebook' => 'fa-brands fa-facebook-f',
        'instagram' => 'fa-brands fa-instagram', 'youtube' => 'fa-brands fa-youtube', 'github' => 'fa-brands fa-github',
        'tiktok' => 'fa-brands fa-tiktok', 'whatsapp' => 'fa-brands fa-whatsapp', 'telegram' => 'fa-brands fa-telegram',
        'mastodon' => 'fa-brands fa-mastodon', 'bluesky' => 'fa-brands fa-bluesky', 'email' => 'fa-regular fa-envelope',
        'website' => 'fa-solid fa-globe',
    ];

    /** @var string[] Legal links Moodle can provide. */
    public const LEGAL = ['policies', 'dataretention', 'privacyofficer'];

    /** @var int Largest stored footer, in bytes. */
    public const MAX_SIZE = 100000;

    /**
     * The saved footer, or one made from the older footer settings (content, contact, social links).
     *
     * @return array ['style' => settings, 'columns' => list of ['id', 'blocks'], 'bottom' => list of blocks]
     */
    public static function get_layout(): array {
        $raw = get_config('theme_flexium', 'footerlayout');
        $layout = $raw ? json_decode($raw, true) : null;
        return self::clean(is_array($layout) ? $layout : self::default_layout());
    }

    /**
     * Save the footer.
     *
     * @param array $layout
     * @return array the saved footer
     */
    public static function save(array $layout): array {
        $layout = self::clean($layout);
        $json = json_encode($layout);
        if (strlen($json) > self::MAX_SIZE) {
            throw new \moodle_exception('home_toolarge', 'theme_flexium');
        }
        $old = get_config('theme_flexium', 'footerlayout');
        if ($old !== $json) {
            set_config('footerlayout', $json, 'theme_flexium');
            add_to_config_log('footerlayout', $old === false ? null : $old, $json, 'theme_flexium');
        }
        return $layout;
    }

    /**
     * Keep known block types and clean every setting.
     *
     * @param array $layout
     * @return array
     */
    public static function clean(array $layout): array {
        $blocks = function ($list): array {
            $clean = [];
            foreach (array_slice(is_array($list) ? $list : [], 0, 30) as $block) {
                if (is_array($block) && in_array($block['type'] ?? '', self::TYPES, true)) {
                    $clean[] = [
                        'id' => clean_param((string) ($block['id'] ?? ''), PARAM_ALPHANUMEXT) ?: random_string(8),
                        'type' => $block['type'],
                        'settings' => home::clean_settings((array) ($block['settings'] ?? [])),
                    ];
                }
            }
            return $clean;
        };
        $columns = [];
        foreach (array_slice((array) ($layout['columns'] ?? []), 0, 6) as $column) {
            $columns[] = [
                'id' => clean_param((string) ($column['id'] ?? ''), PARAM_ALPHANUMEXT) ?: random_string(8),
                'blocks' => $blocks($column['blocks'] ?? []),
            ];
        }
        // Switches that are on unless switched off: explicit booleans, so the look panel shows them as they are.
        $style = home::clean_settings((array) ($layout['style'] ?? []));
        foreach (['bottombar', 'moodlebutton'] as $switch) {
            $style[$switch] = ($style[$switch] ?? true) !== false;
        }
        return [
            'style' => $style,
            'columns' => $columns,
            'bottom' => $blocks($layout['bottom'] ?? []),
        ];
    }

    /** @var string[] Social networks of the default footer when none is configured: network => its home page. */
    public const DEFAULT_SOCIAL = [
        'linkedin' => 'https://www.linkedin.com/',
        'x' => 'https://x.com/',
        'facebook' => 'https://www.facebook.com/',
        'youtube' => 'https://www.youtube.com/',
    ];

    /**
     * The footer of a new site: every block filled in, from the older settings (Footer tab) when they are set, else
     * from the site itself (summary, support email, address) or sample values to replace (social network home pages).
     *
     * @return array
     */
    public static function default_layout(): array {
        global $CFG;

        $config = get_config('theme_flexium');
        $social = [];
        foreach (array_keys(\theme_flexium\output\core_renderer::SOCIAL_NETWORKS) as $network) {
            $url = clean_param($config->{'social_' . $network} ?? '', PARAM_URL);
            if ($url !== '') {
                $social[] = ['network' => $network, 'url' => $url];
            }
        }
        if (!$social) {
            foreach (self::DEFAULT_SOCIAL as $network => $url) {
                $social[] = ['network' => $network, 'url' => $url];
            }
        }

        $text = trim(html_to_text($config->footercontent ?? '', 0, false));
        if ($text === '') {
            $summary = format_text(get_site()->summary, FORMAT_HTML, ['context' => \core\context\system::instance()]);
            $text = trim(html_to_text($summary, 0, false));
        }
        if ($text === '') {
            $text = get_string('footer_defaulttext', 'theme_flexium');
        }
        $email = clean_param($config->contactemail ?? '', PARAM_EMAIL) ?: clean_param($CFG->supportemail ?? '', PARAM_EMAIL);
        $website = clean_param($config->contactwebsite ?? '', PARAM_URL) ?: (new url('/'))->out(false);

        $block = fn(string $type, array $settings) => ['id' => $type . random_string(4), 'type' => $type,
            'settings' => $settings];
        return [
            'style' => ['background' => 'dark', 'align' => 'left', 'bottombar' => true, 'moodlebutton' => true],
            'columns' => [
                ['id' => 'c1', 'blocks' => [
                    $block('logo', ['size' => 'md', 'showname' => true]),
                    $block('text', ['title' => '', 'text' => shorten_text($text, 300)]),
                ]],
                ['id' => 'c2', 'blocks' => [
                    $block('links', ['title' => get_string('footer_explore', 'theme_flexium'), 'items' => [
                        ['name' => get_string('home'), 'url' => (new url('/'))->out(false)],
                        ['name' => get_string('footer_catalogue', 'theme_flexium'),
                            'url' => (new url('/course/index.php'))->out(false)],
                        ['name' => get_string('mycourses'), 'url' => (new url('/my/courses.php'))->out(false)],
                        ['name' => get_string('myhome'), 'url' => (new url('/my/'))->out(false)],
                    ]]),
                ]],
                ['id' => 'c3', 'blocks' => [
                    $block('contact', ['title' => get_string('footer_contact', 'theme_flexium'),
                        'email' => $email, 'phone' => (string) ($config->contactphone ?? ''),
                        'website' => $website, 'address' => '']),
                    $block('support', ['style' => 'button']),
                ]],
                ['id' => 'c4', 'blocks' => [
                    $block('social', ['title' => get_string('footer_follow', 'theme_flexium'), 'items' => $social,
                        'shape' => 'round', 'variant' => 'filled', 'size' => 'md', 'brandcolours' => false]),
                ]],
            ],
            'bottom' => [
                $block('copyright', ['text' => '© {year} {sitename}']),
                $block('legal', ['items' => self::LEGAL]),
                $block('usertour', []),
            ],
        ];
    }

    /**
     * What the blocks need from Moodle, for the current user: logo, site name, legal and support links.
     *
     * @return array
     */
    public static function get_data(): array {
        global $CFG, $OUTPUT, $PAGE, $USER, $SITE;

        $legal = [];
        if (($CFG->sitepolicyhandler ?? '') === 'tool_policy' && class_exists('\tool_policy\api')) {
            if (\tool_policy\api::list_current_versions(\tool_policy\policy_version::AUDIENCE_ALL)) {
                $legal['policies'] = ['label' => get_string('userpolicysettings', 'tool_policy'),
                    'url' => (new url('/admin/tool/policy/viewall.php', ['returnurl' => $PAGE->url]))->out(false)];
            }
        } else if (!empty($CFG->sitepolicy)) {
            $legal['policies'] = ['label' => get_string('sitepolicy', 'admin'), 'url' => $CFG->sitepolicy];
        }
        if (get_config('tool_dataprivacy', 'showdataretentionsummary') !== '0') {
            $legal['dataretention'] = ['label' => get_string('dataretentionsummary', 'tool_dataprivacy'),
                'url' => (new url('/admin/tool/dataprivacy/summary.php'))->out(false)];
        }
        if (get_config('tool_dataprivacy', 'contactdataprotectionofficer') && isloggedin() && !isguestuser()) {
            $legal['privacyofficer'] = ['label' => get_string('contactdataprotectionofficer', 'tool_dataprivacy'),
                'url' => (new url('/admin/tool/dataprivacy/mydatarequests.php'))->out(false)];
        }

        $support = null;
        $available = isset($CFG->supportavailability) && $CFG->supportavailability != CONTACT_SUPPORT_DISABLED
            && !($CFG->supportavailability == CONTACT_SUPPORT_AUTHENTICATED && (!isloggedin() || isguestuser()));
        if ($available) {
            $support = [
                'label' => get_string('contactsitesupport', 'admin'),
                'url' => !empty($CFG->supportpage) ? $CFG->supportpage : (new url('/user/contactsitesupport.php'))->out(false),
                'external' => !empty($CFG->supportpage),
            ];
        }

        $logo = $OUTPUT->get_logo_url(null, 120) ?: $OUTPUT->get_compact_logo_url(300, 120);
        return [
            'logo' => $logo ? $logo->out(false) : '',
            'sitename' => format_string($SITE->fullname, true, ['context' => \core\context\system::instance(), 'escape' => false]),
            'homeurl' => (new url('/'))->out(false),
            'year' => userdate(time(), '%Y'),
            'legal' => $legal,
            'support' => $support,
            'login' => isloggedin() && !isguestuser()
                ? get_string('loggedinas', 'moodle', fullname($USER)) : get_string('loggedinnot', 'moodle'),
            'tourreset' => get_string('resettouronpage', 'tool_usertours'),
        ];
    }
}
