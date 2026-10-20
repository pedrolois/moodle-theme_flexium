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
 * Toolbar above the results: number of courses, share link, grid / list switch and sort order.
 *
 * @module     theme_flexium/catalog/ResultsToolbar
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {useId, useState} from 'react';
import {EditZone} from '@moodle/lms/theme_flexium/catalog/EditZones';
import type {Features, SortOption, Strings} from './types';
import {formatNumber, str} from './utils';

interface ResultsToolbarProps {
    /** Number of courses, null before the first response. */
    total: number | null;
    features: Features;
    view: string;
    onViewChange: (view: string) => void;
    sort: string;
    sorts: SortOption[];
    onSortChange: (sort: string) => void;
    strings: Strings;
}

/**
 * Copy the page URL (it holds the query) to the clipboard; falls back to a prompt to copy it by hand.
 *
 * @returns whether it was copied
 */
const copyLink = async(): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(window.location.href);
        return true;
    } catch {
        window.prompt('', window.location.href); // eslint-disable-line no-alert
        return false;
    }
};

export default function ResultsToolbar({total, features, view, onViewChange, sort, sorts, onSortChange,
        strings}: ResultsToolbarProps) {
    const sortid = useId();
    const [copied, setCopied] = useState('');

    const share = async() => {
        if (await copyLink()) {
            setCopied(str(strings, 'catalog_linkcopied'));
            window.setTimeout(() => setCopied(''), 3000);
        }
    };

    let totaltext = '';
    if (total !== null) {
        totaltext = total === 1 ? str(strings, 'catalog_result') : str(strings, 'catalog_results', formatNumber(total));
    }

    return (
        <div className="flexium-catalog__toolbar">
            <p className="flexium-catalog__total" aria-live="polite">{totaltext}</p>
            <div className="flexium-catalog__tools">
                {features.sharelink && (
                    <button type="button" className="btn btn-outline-secondary btn-sm flexium-catalog__share"
                        onClick={share} title={str(strings, 'catalog_sharelink')}>
                        <i className="fa fa-link" aria-hidden="true"></i>
                        <span className="visually-hidden">{str(strings, 'catalog_sharelink')}</span>
                    </button>
                )}
                <EditZone zone="views" className="flexium-editzone--padded flexium-editzone--views">
                {features.viewswitch && (
                    <div className="btn-group btn-group-sm flexium-catalog__views" role="group"
                        aria-label={str(strings, 'catalog_view')}>
                        {(['grid', 'list'] as const).map(key => (
                            <button key={key} type="button" aria-pressed={view === key}
                                className={`btn btn-outline-secondary${view === key ? ' active' : ''}`}
                                title={str(strings, `catalog_view${key}`)} onClick={() => onViewChange(key)}>
                                <i className={`fa ${key === 'grid' ? 'fa-table-cells-large' : 'fa-list'}`} aria-hidden="true"></i>
                                <span className="visually-hidden">{str(strings, `catalog_view${key}`)}</span>
                            </button>
                        ))}
                    </div>
                )}
                </EditZone>
                <div className="flexium-catalog__sort">
                    <label htmlFor={sortid} className="flexium-catalog__sortlabel">{str(strings, 'catalog_sortby')}</label>
                    <select id={sortid} className="form-select" value={sort} onChange={event => onSortChange(event.target.value)}>
                        {sorts.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                </div>
            </div>
            <div className="visually-hidden" role="status">{copied}</div>
            {copied && <div className="flexium-catalog__toast" aria-hidden="true">{copied}</div>}
        </div>
    );
}
