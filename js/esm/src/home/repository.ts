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
 * Web service calls of the home page builder. Course lists reuse the catalogue web service.
 *
 * @module     theme_flexium/home/repository
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {fetchOne} from '@moodle/lms/core/ajax';
import {getCatalog} from '@moodle/lms/theme_flexium/catalog/repository';
import type {Course} from '@moodle/lms/theme_flexium/catalog/types';
import type {HomeData, Page} from './types';

/** Whether the page has a user session (logged in users call the web services with it). */
const hasSession = (): boolean => !document.body.classList.contains('notloggedin');

export const getHomeData = (): Promise<HomeData> =>
    fetchOne<HomeData>({methodname: 'theme_flexium_get_home_data', args: {}}, {loginrequired: hasSession()});

export const saveHomePage = async(page: Page): Promise<Page> => {
    const saved = await fetchOne<string>({methodname: 'theme_flexium_save_home_page', args: {page: JSON.stringify(page)}});
    return JSON.parse(saved) as Page;
};

/**
 * Courses of a home page courses section.
 *
 * @param source latest, popular, startingsoon, inprogress, mycourses, favourites or category
 * @param categoryid for 'category'
 * @param count how many
 */
export const getSectionCourses = async(source: string, categoryid: number, count: number): Promise<Course[]> => {
    const quick = ['startingsoon', 'inprogress', 'mycourses', 'favourites'].includes(source) ? [source] : [];
    const sort = {latest: 'latest', popular: 'popularity', startingsoon: 'startdate'}[source] ?? 'name';
    const response = await getCatalog({
        search: '',
        selected: source === 'category' && categoryid ? {category: [String(categoryid)]} : {},
        sort,
        page: 0,
        perpage: 0,
        quick,
        startfrom: '',
        startto: '',
    }, count);
    return response.courses;
};
