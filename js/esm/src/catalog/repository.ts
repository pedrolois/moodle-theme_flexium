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
 * Data access for the course catalogue: the only module that calls web services.
 *
 * @module     theme_flexium/catalog/repository
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {fetchMany, fetchOne} from '@moodle/lms/core/ajax';
import config from '@moodle/lms/core/config';
import type {CardSettings, CatalogOptions, CatalogQuery, CatalogResponse, CoursePreview, ImageUpload, LayoutItem,
    RawFeatures} from './types';
import {dayToTimestamp} from './utils';

/**
 * Whether the page has a user session: logged in users must call the catalogue with it (hidden courses,
 * favourites, enrolments, progress); visitors call it without (service-nologin).
 */
const hasSession = (): boolean => !document.body.classList.contains('notloggedin');

/**
 * Save the filter layout, the card settings and the page options in one request (site administrators, edit mode).
 *
 * @param layout filter groups in order
 * @param card course card settings
 * @param options page options (courses per page)
 */
export const saveCatalogLayout = async(layout: LayoutItem[], card: CardSettings, options: CatalogOptions,
        features: RawFeatures): Promise<[LayoutItem[], CardSettings, CatalogOptions, RawFeatures]> => {
    const [savedlayout, savedcard, savedoptions, savedfeatures] = await (fetchMany([
        {methodname: 'theme_flexium_save_filter_layout', args: {layout}},
        {methodname: 'theme_flexium_save_card_layout', args: {...card}},
        {methodname: 'theme_flexium_save_catalog_options', args: {...options}},
        {methodname: 'theme_flexium_save_catalog_features', args: {
            features: Object.entries(features).map(([name, value]) => ({name, value})),
        }},
    ]) as Promise<[LayoutItem[], CardSettings, CatalogOptions, {name: string; value: string}[]]>);
    const raw: RawFeatures = {};
    savedfeatures.forEach(feature => {
        raw[feature.name] = feature.value;
    });
    return [savedlayout, savedcard, savedoptions, raw];
};

/**
 * Upload an image as the default header of course cards (site administrators, edit mode).
 *
 * The file goes to the user's draft area with Moodle's own file picker upload (repository_ajax.php, as the
 * file picker does), then theme_flexium_save_default_image moves it into the theme setting.
 *
 * @param file the chosen image
 * @param upload upload target (course_renderer::image_upload_props())
 * @returns URL of the stored image
 */
export const uploadDefaultImage = async(file: File, upload: ImageUpload): Promise<string> => {
    if (upload.maxbytes > 0 && file.size > upload.maxbytes) {
        throw new Error(`${file.name}: > ${Math.round(upload.maxbytes / 1048576)} MB`);
    }
    const form = new FormData();
    form.append('repo_upload_file', file);
    form.append('repo_id', String(upload.repoid));
    form.append('itemid', String(upload.draftitemid));
    form.append('ctx_id', String(upload.contextid));
    form.append('sesskey', config.sesskey);
    form.append('savepath', '/');
    form.append('title', file.name);
    form.append('overwrite', '1');
    form.append('accepted_types[]', '.jpg');
    form.append('accepted_types[]', '.jpeg');
    form.append('accepted_types[]', '.png');
    form.append('accepted_types[]', '.gif');
    form.append('accepted_types[]', '.webp');
    form.append('accepted_types[]', '.svg');
    const response = await fetch(upload.url, {method: 'POST', body: form, credentials: 'same-origin'});
    const result = await response.json() as {error?: string; file?: string; event?: string};
    if (result.error || !result.file) {
        throw new Error(result.error ?? response.statusText);
    }
    const saved = await fetchOne<{url: string}>({
        methodname: 'theme_flexium_save_default_image',
        args: {draftitemid: upload.draftitemid, filename: result.file},
    });
    return saved.url;
};

export const getCoursePreview = (courseid: number): Promise<CoursePreview> =>
    fetchOne<CoursePreview>({methodname: 'theme_flexium_get_course_preview', args: {courseid}}, {loginrequired: hasSession()});

export const setFavourite = (courseid: number, favourite: boolean): Promise<unknown> =>
    fetchOne({methodname: 'core_course_set_favourite_courses', args: {courses: [{id: courseid, favourite}]}});

export const setPreference = (name: string, value: string): Promise<unknown> =>
    fetchOne({methodname: 'core_user_set_user_preferences', args: {preferences: [{name, value, userid: 0}]}});

/**
 * Fetch one page of the catalogue (theme_flexium_get_catalog).
 *
 * Callable without login, so guests and visitors can browse when the site allows it.
 *
 * @param query search, selection, sort and page
 * @param perpage page size
 */
/**
 * One page of the catalogue.
 *
 * @param query
 * @param perpage
 * @param preview catalogue editor: unsaved settings as JSON {features, card, layout}, '' for none
 */
export const getCatalog = (query: CatalogQuery, perpage: number, preview = ''): Promise<CatalogResponse> => {
    const filters = Object.entries(query.selected)
        .filter(([, values]) => values.length > 0)
        .map(([source, values]) => ({source, values}));

    const request = () => fetchOne<CatalogResponse>({
        methodname: 'theme_flexium_get_catalog',
        args: {
            search: query.search,
            filters,
            sort: query.sort,
            page: query.page,
            perpage,
            quick: query.quick,
            startfrom: dayToTimestamp(query.startfrom),
            startto: dayToTimestamp(query.startto, true),
            preview,
        },
    }, {loginrequired: hasSession()});

    // One more try before reporting an error: a busy server (e.g. building the theme styles) can drop a request.
    return request().catch(async() => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return request();
    });
};
