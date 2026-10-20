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
 * Shared types of the Flexium home page builder.
 *
 * @module     theme_flexium/home/types
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/** Strings resolved on the server, keyed by identifier. Placeholders are a literal "{$a}". */
export type Strings = Record<string, string>;

/** Settings of a section: texts, numbers, switches and lists of entries. */
export type Settings = Record<string, unknown>;

export interface Section {
    id: string;
    type: string;
    settings: Settings;
}

export interface Page {
    template: string;
    sections: Section[];
}

export interface Choice {
    key: string;
    label: string;
}

/** A setting of a section type, as defined in \theme_flexium\local\home\fields. */
export interface Field {
    key: string;
    type: 'text' | 'textarea' | 'url' | 'bool' | 'select' | 'palette' | 'icon' | 'category' | 'checklist' | 'items';
    label: string;
    choices: Choice[];
    /** Fields of each entry, for 'items'. */
    fields: Field[];
}

export interface Template {
    key: string;
    name: string;
    description: string;
    palette: string;
    sections: Section[];
}

export interface HomeEditorProps {
    templates: Template[];
    schema: Record<string, Field[]>;
    icons: Record<string, string>;
    types: string[];
    strings: Strings;
}

/** Props passed by theme_flexium\output\core\course_renderer::frontpage(). */
export interface HomePageProps {
    page: Page;
    /** Moodle's own site home content (HTML). */
    sitecontent: string;
    sitename: string;
    /** Default header images, number => URL. */
    palette: Record<string, string>;
    catalogurl: string;
    loggedin: boolean;
    strings: Strings;
    /** Present for site administrators while edit mode is on. */
    editor: HomeEditorProps | null;
    /** Site administrator outside edit mode (shown how to build the page). */
    canedit: boolean;
}

/** Response of theme_flexium_get_home_data. */
export interface HomeData {
    categories: {id: number; name: string; coursecount: number; url: string}[];
    stats: Record<string, number>;
    news: {title: string; url: string; date: string}[];
}
