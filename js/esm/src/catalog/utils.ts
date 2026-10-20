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
 * Helpers of the course catalogue: strings, dates and the URL state.
 *
 * @module     theme_flexium/catalog/utils
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import type {CatalogQuery, FeatureDefinition, Features, RawFeatures, Selection, Strings} from './types';

/** URL parameter names. A selection is stored as "f=<source>|<value>", one per selected option. */
const PARAM_SEARCH = 'q';
const PARAM_SORT = 'sort';
const PARAM_PAGE = 'page';
const PARAM_PERPAGE = 'perpage';
const PARAM_FILTER = 'f';
const PARAM_QUICK = 'quick';
const PARAM_FROM = 'from';
const PARAM_TO = 'to';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Get a server-resolved string, replacing the "{$a}" placeholder.
 *
 * @param strings the strings passed as props
 * @param key string identifier
 * @param a placeholder value
 */
export const str = (strings: Strings, key: string, a: string | number = ''): string =>
    (strings[key] ?? key).replace('{$a}', String(a));

/**
 * Format a number in the page language.
 *
 * @param value
 */
export const formatNumber = (value: number): string =>
    new Intl.NumberFormat(document.documentElement.lang || undefined).format(value);

/**
 * Read the catalogue query from the current URL.
 *
 * @param initialcategory category preselected when the URL has no filters (course/index.php?categoryid=X)
 */
export const readQueryFromUrl = (initialcategory: string, defaultsort: string): CatalogQuery => {
    const params = new URLSearchParams(window.location.search);
    const selected: Selection = {};
    for (const entry of params.getAll(PARAM_FILTER)) {
        const separator = entry.indexOf('|');
        if (separator > 0) {
            const source = entry.slice(0, separator);
            (selected[source] ??= []).push(entry.slice(separator + 1));
        }
    }
    if (!params.has(PARAM_FILTER) && initialcategory) {
        selected.category = [initialcategory];
    }
    return {
        search: params.get(PARAM_SEARCH) ?? '',
        selected,
        sort: params.get(PARAM_SORT) ?? defaultsort,
        page: Math.max(0, parseInt(params.get(PARAM_PAGE) ?? '0', 10) || 0),
        perpage: Math.max(0, parseInt(params.get(PARAM_PERPAGE) ?? '0', 10) || 0),
        quick: params.getAll(PARAM_QUICK),
        startfrom: DATE_PATTERN.test(params.get(PARAM_FROM) ?? '') ? params.get(PARAM_FROM) ?? '' : '',
        startto: DATE_PATTERN.test(params.get(PARAM_TO) ?? '') ? params.get(PARAM_TO) ?? '' : '',
    };
};

/**
 * Write the catalogue query to the URL without reloading, so the page can be shared and survives reloads.
 *
 * Moodle's own parameters (e.g. categoryid) are dropped: the selection replaces them.
 *
 * @param query
 */
export const writeQueryToUrl = (query: CatalogQuery, defaultsort: string): void => {
    const params = new URLSearchParams();
    if (query.search) {
        params.set(PARAM_SEARCH, query.search);
    }
    for (const [source, values] of Object.entries(query.selected)) {
        for (const value of values) {
            params.append(PARAM_FILTER, `${source}|${value}`);
        }
    }
    query.quick.forEach(key => params.append(PARAM_QUICK, key));
    if (query.startfrom) {
        params.set(PARAM_FROM, query.startfrom);
    }
    if (query.startto) {
        params.set(PARAM_TO, query.startto);
    }
    if (query.sort !== defaultsort) {
        params.set(PARAM_SORT, query.sort);
    }
    if (query.perpage > 0) {
        params.set(PARAM_PERPAGE, String(query.perpage));
    }
    if (query.page > 0) {
        params.set(PARAM_PAGE, String(query.page));
    }
    const search = params.toString();
    const url = window.location.pathname + (search ? `?${search}` : '') + window.location.hash;
    if (url !== window.location.pathname + window.location.search + window.location.hash) {
        window.history.replaceState(null, '', url);
    }
};

/**
 * Toggle one option in a selection, returning a new selection.
 *
 * @param selected current selection
 * @param source filter source key
 * @param value option value
 */
export const toggleValue = (selected: Selection, source: string, value: string): Selection => {
    const values = selected[source] ?? [];
    const next = values.includes(value) ? values.filter(item => item !== value) : [...values, value];
    const copy = {...selected};
    if (next.length) {
        copy[source] = next;
    } else {
        delete copy[source];
    }
    return copy;
};

/**
 * Typed features from their raw values.
 *
 * @param raw raw values ('1'/'0', choice, comma separated list, text)
 * @param definitions feature definitions
 */
export const decodeFeatures = (raw: RawFeatures, definitions: FeatureDefinition[]): Features => {
    const features: Record<string, boolean | string | string[]> = {};
    definitions.forEach(definition => {
        const value = raw[definition.key] ?? '';
        if (definition.type === 'bool') {
            features[definition.key] = value === '1';
        } else if (definition.type === 'list') {
            features[definition.key] = value === '' ? [] : value.split(',');
        } else {
            features[definition.key] = value;
        }
    });
    return features as unknown as Features;
};

/**
 * Timestamp (seconds) of the start of a local day, 0 for no date.
 *
 * @param date 'YYYY-MM-DD' or ''
 * @param nextday the start of the following day (end of the range, exclusive)
 */
export const dayToTimestamp = (date: string, nextday = false): number => {
    if (!DATE_PATTERN.test(date)) {
        return 0;
    }
    const [year, month, day] = date.split('-').map(Number);
    return Math.floor(new Date(year, month - 1, day + (nextday ? 1 : 0)).getTime() / 1000);
};

/**
 * Read a value remembered in the browser (visitors), '' when the storage is not available.
 *
 * @param key
 */
export const readLocal = (key: string): string => {
    try {
        return window.localStorage.getItem(`theme_flexium_${key}`) ?? '';
    } catch {
        return '';
    }
};

/**
 * Remember a value in the browser (visitors). Failures (private mode, blocked storage) are ignored.
 *
 * @param key
 * @param value
 */
export const writeLocal = (key: string, value: string): void => {
    try {
        window.localStorage.setItem(`theme_flexium_${key}`, value);
    } catch {
        // Not remembered: nothing else to do.
    }
};

/**
 * Lower-case, accent-free text for comparisons.
 *
 * @param text
 */
export const normalise = (text: string): string =>
    text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
