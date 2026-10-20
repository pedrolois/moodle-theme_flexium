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
 * Shared types of the Flexium course catalogue.
 *
 * @module     theme_flexium/catalog/types
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/** Strings resolved on the server, keyed by identifier. Placeholders are a literal "{$a}". */
export type Strings = Record<string, string>;

/** Selected option values, keyed by filter source key. */
export type Selection = Record<string, string[]>;

export interface SortOption {
    value: string;
    label: string;
}

/** Props passed by theme_flexium\output\core\course_renderer::course_category(). */
export interface CatalogProps {
    /** Default courses per page. */
    perpage: number;
    /** Whether visitors can change the courses per page. */
    userperpage: boolean;
    perpageoptions: number[];
    initialcategory: string;
    sorts: SortOption[];
    strings: Strings;
    /** Present for site administrators while edit mode is on. */
    editor: EditorProps | null;
    /** Saved optional features (see \theme_flexium\local\catalog\features). */
    features: Features;
    /** Logged in, not guest: favourites and preferences are available. */
    loggedin: boolean;
    /** Remembered open filter groups (JSON source => open), '' for none. */
    savedgroups: string;
    /** Remembered view, '' for none. */
    savedview: string;
    /** Default header images, number => URL (banner backgrounds). */
    palette: Record<string, string>;
    /** Quick filter key => Font Awesome classes. */
    quickicons: Record<string, string>;
    /** Icons of the button opening the filters panel: key => Font Awesome classes. */
    toggleicons: Record<string, string>;
    /** Icons of the button opening the blocks drawer: key => Font Awesome classes (empty: Moodle's icon). */
    blockicons: Record<string, string>;
    /** Site administrator outside edit mode (shown how to customise the catalogue). */
    canedit: boolean;
    /** Saved badge colours and lines. */
    badgestyle: BadgeStyle;
}

/** How the card badges look: colour per source, and one line per source. */
export interface BadgeStyle {
    colours: Record<string, string>;
    rows: boolean;
}

/** Optional catalogue features, typed. */
export interface Features {
    expandall: boolean;
    optioncounts: boolean;
    showemptyoptions: boolean;
    groupsearch: boolean;
    groupclear: boolean;
    rememberopen: boolean;
    quickfilters: string[];
    /** Custom names of the quick filters: JSON key => name. */
    quicklabels: string;
    daterange: boolean;
    defaultsort: string;
    viewswitch: boolean;
    defaultview: string;
    gridcolumns: string;
    /** List view: same card content as the grid, or its own (listparts, listimage). */
    viewcards: string;
    listparts: string[];
    listimage: string;
    statusbadges: string[];
    progress: boolean;
    favourites: boolean;
    quickview: boolean;
    quickviewstyle: string;
    skeletons: boolean;
    sharelink: boolean;
    defaultimage: string;
    banner: boolean;
    bannertitle: string;
    bannertext: string;
    bannerstyle: string;
    pageheading: boolean;
    pageheadingtext: string;
    filtericon: string;
    filtericoncolour: string;
    filtericonsize: string;
    filtericonposition: string;
    blockicon: string;
    blockiconcolour: string;
    blockiconsize: string;
    blockiconposition: string;
    coursepage: boolean;
}

/** Raw feature values as stored: '1'/'0', a choice key, a comma separated list or text. */
export type RawFeatures = Record<string, string>;

export interface FeatureDefinition {
    key: string;
    group: string;
    type: 'bool' | 'select' | 'list' | 'text';
    label: string;
    help: string;
    choices: EditorChoice[];
}

export interface LayoutItem {
    source: string;
    expanded: boolean;
    /** Custom name of the group, '' for the default. */
    label?: string;
}

export interface CardSettings {
    showcategory: boolean;
    showsummary: boolean;
    badges: string[];
    footer: string[];
    /** Colour of the badges of each source; sources without one are 'primary'. */
    badgecolours: {source: string; colour: string}[];
    /** One line of badges per source. */
    badgerows: boolean;
}

export interface EditorChoice {
    key: string;
    label: string;
    /** Human readable kind, e.g. "Course custom field (select)". */
    kind?: string;
}

export interface CatalogOptions {
    perpage: number;
    userperpage: boolean;
    /** Whether the filters drawer starts open (layout/catalog.php). */
    filtersdraweropen: boolean;
}

export interface EditorProps {
    layout: LayoutItem[];
    sources: EditorChoice[];
    card: CardSettings;
    options: CatalogOptions;
    features: RawFeatures;
    featuredefs: FeatureDefinition[];
    badgechoices: EditorChoice[];
    /** Badge colours offered (design system variants). */
    badgecolours: string[];
    footerchoices: EditorChoice[];
    /** Moodle's file picker upload, null when the "Upload a file" repository is disabled. */
    imageupload: ImageUpload | null;
    strings: Strings;
}

/** Upload to the user's draft area through repository_ajax.php (see course_renderer::image_upload_props()). */
export interface ImageUpload {
    url: string;
    repoid: number;
    contextid: number;
    draftitemid: number;
    maxbytes: number;
}

export interface FilterOption {
    value: string;
    label: string;
    count: number;
    selected: boolean;
    /** Parent option value in the category tree, '' at the top level. */
    parent: string;
}

/** A click on "Expand all" (open) or "Collapse all" (closed) in the filter sidebar. */
export interface BulkToggle {
    open: boolean;
}

export interface FilterGroup {
    source: string;
    type: 'tree' | 'list';
    label: string;
    expanded: boolean;
    options: FilterOption[];
}

export interface SelectedOption {
    source: string;
    value: string;
    label: string;
}

export interface Course {
    id: number;
    fullname: string;
    url: string;
    summary: string;
    image: string;
    /** Empty when the theme settings hide the category. */
    categoryname: string;
    visible: boolean;
    /** Origin: "Tag" or "Custom field: name", shown on hover. */
    badges: {source: string; label: string; origin: string}[];
    /** Card footer items chosen in the theme settings. */
    meta: CourseMeta[];
    /** The course offers the quick view (its "Quick view" custom field, else whether its page is useful). */
    quickview: boolean;
    enrolled: boolean;
    completed: boolean;
    favourite: boolean;
    isnew: boolean;
    startingsoon: boolean;
    /** Completion progress of the current user, -1 for none. */
    progress: number;
}

export interface QuickFilter {
    key: string;
    count: number;
    selected: boolean;
}

/** Response of theme_flexium_get_course_preview. */
export interface CoursePreview {
    id: number;
    fullname: string;
    categoryname: string;
    image: string;
    summary: string;
    startdate: string;
    enddate: string;
    contacts: {name: string; role: string}[];
    customfields: {name: string; value: string}[];
    /** Rows with an icon: dates, teachers and custom fields (value is formatted HTML). */
    facts: {key: string; icon: string; label: string; value: string}[];
    /** Long custom fields (text areas) shown under the summary (value is formatted HTML). */
    sections: {key: string; label: string; value: string}[];
    enrolled: boolean;
    url: string;
}

export interface CourseMeta {
    key: string;
    /** Font Awesome classes. */
    icon: string;
    label: string;
    text: string;
    /** Teacher items: the course contacts. */
    people: {name: string; image: string}[];
}

/** Response of theme_flexium_get_catalog. */
export interface CatalogResponse {
    search: string;
    total: number;
    page: number;
    perpage: number;
    autoselected: SelectedOption[];
    selected: SelectedOption[];
    courses: Course[];
    groups: FilterGroup[];
    quick: QuickFilter[];
}

/** What the user asked for; mirrored in the page URL. */
export interface CatalogQuery {
    search: string;
    selected: Selection;
    sort: string;
    page: number;
    /** Courses per page chosen by the visitor, 0 for the default. */
    perpage: number;
    /** Selected quick filters. */
    quick: string[];
    /** Start date range, 'YYYY-MM-DD' or ''. */
    startfrom: string;
    startto: string;
}
