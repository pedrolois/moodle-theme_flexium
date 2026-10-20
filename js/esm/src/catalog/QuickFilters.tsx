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
 * Quick filters (feature "Quick filters"): toggle buttons for frequent searches, in the order chosen by the admin.
 * "My courses" and "Favourites" are only offered to logged in users.
 *
 * @module     theme_flexium/catalog/QuickFilters
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import type {QuickFilter, Strings} from './types';
import {formatNumber, str} from './utils';

/** Quick filters that need a logged in user. */
const PERSONAL = ['mycourses', 'favourites'];

interface QuickFiltersProps {
    /** Keys chosen by the admin, in order. */
    keys: string[];
    /** Counts from the last response. */
    quick: QuickFilter[];
    selected: string[];
    loggedin: boolean;
    icons: Record<string, string>;
    onToggle: (key: string) => void;
    showcount: boolean;
    strings: Strings;
    /** Custom names: JSON key => name. */
    labels: string;
}

/**
 * Custom names of the quick filters.
 *
 * @param json JSON key => name
 */
export const parseLabels = (json: string): Record<string, string> => {
    try {
        const parsed = JSON.parse(json || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
};

export default function QuickFilters({keys, quick, selected, loggedin, icons, onToggle, showcount,
        strings, labels}: QuickFiltersProps) {
    const names = parseLabels(labels);
    const shown = keys.filter(key => loggedin || !PERSONAL.includes(key));
    if (!shown.length) {
        return null;
    }
    return (
        <div className="flexium-quickfilters" role="group" aria-label={str(strings, 'catalog_quickfilters')}>
            {shown.map(key => {
                const active = selected.includes(key);
                const count = quick.find(item => item.key === key)?.count;
                return (
                    <button key={key} type="button" aria-pressed={active}
                        className={`flexium-quickfilter${active ? ' flexium-quickfilter--active' : ''}`}
                        disabled={!active && count === 0} onClick={() => onToggle(key)}>
                        <i className={`${icons[key] ?? 'fa fa-filter'} me-1`} aria-hidden="true"></i>
                        {names[key] || str(strings, `quick_${key}`)}
                        {showcount && count !== undefined && (
                            <span className="flexium-quickfilter__count">{formatNumber(count)}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
