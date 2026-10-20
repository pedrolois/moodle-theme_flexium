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
 * Results footer, centred: "Showing 13–24 of 45 courses", pagination and the courses per page selector.
 *
 * The selector is shown to visitors when the site allows it; in edit mode (site administrators) it sets the
 * default for everyone, together with the "Let visitors change it" option.
 *
 * @module     theme_flexium/catalog/CatalogFooter
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {useId} from 'react';
import {Pagination} from '@moodlehq/design-system';
import type {CatalogOptions, Strings} from './types';
import {formatNumber, str} from './utils';

interface CatalogFooterProps {
    total: number;
    /** Zero based. */
    page: number;
    perpage: number;
    perpageoptions: number[];
    /** Visitors can choose the courses per page. */
    showperpage: boolean;
    onPageChange: (page: number) => void;
    onPerpageChange: (perpage: number) => void;
    strings: Strings;
    /** Edit mode: the draft page options and their setter. */
    editoptions?: CatalogOptions;
    onEditOptions?: (options: CatalogOptions) => void;
    editorstrings?: Strings;
}

export default function CatalogFooter({total, page, perpage, perpageoptions, showperpage, onPageChange, onPerpageChange,
        strings, editoptions, onEditOptions, editorstrings}: CatalogFooterProps) {
    const id = useId();
    const pages = Math.max(1, Math.ceil(total / perpage));
    const from = total ? page * perpage + 1 : 0;
    const to = Math.min(total, (page + 1) * perpage);
    const showing = str(strings, 'catalog_showing')
        .replace('{from}', formatNumber(from))
        .replace('{to}', formatNumber(to))
        .replace('{total}', formatNumber(total));

    return (
        <footer className="flexium-catalogfooter">
            {total > 0 && <p className="flexium-catalogfooter__showing">{showing}</p>}

            {pages > 1 && (
                // First and last page buttons around the design system pagination.
                <div className="flexium-catalogfooter__pager">
                    <button type="button" className="flexium-catalogfooter__edge" disabled={page === 0}
                        aria-label={str(strings, 'catalog_firstpage')} title={str(strings, 'catalog_firstpage')}
                        onClick={() => onPageChange(0)}>
                        <i className="fa fa-angles-left" aria-hidden="true"></i>
                    </button>
                    <Pagination
                        className="flexium-catalogfooter__pagination"
                        totalPages={pages}
                        currentPage={page + 1}
                        onPageChange={next => onPageChange(next - 1)}
                        previousPageLabel={str(strings, 'catalog_previous')}
                        nextPageLabel={str(strings, 'catalog_next')}
                        pageLabelFormatter={number => str(strings, 'catalog_page', number)}
                    />
                    <button type="button" className="flexium-catalogfooter__edge" disabled={page === pages - 1}
                        aria-label={str(strings, 'catalog_lastpage')} title={str(strings, 'catalog_lastpage')}
                        onClick={() => onPageChange(pages - 1)}>
                        <i className="fa fa-angles-right" aria-hidden="true"></i>
                    </button>
                </div>
            )}

            {editoptions && onEditOptions && editorstrings ? (
                <div className="flexium-catalogfooter__perpage flexium-catalogfooter__perpage--editing">
                    <label htmlFor={`${id}-perpage`}>{str(editorstrings, 'editor_perpage')}</label>
                    <select id={`${id}-perpage`} className="form-select form-select-sm" value={editoptions.perpage}
                        onChange={event => onEditOptions({...editoptions, perpage: Number(event.target.value)})}>
                        {perpageoptions.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                    <div className="form-check form-switch m-0">
                        <input id={`${id}-userperpage`} type="checkbox" role="switch" className="form-check-input"
                            checked={editoptions.userperpage}
                            onChange={event => onEditOptions({...editoptions, userperpage: event.target.checked})} />
                        <label htmlFor={`${id}-userperpage`} className="form-check-label">
                            {str(editorstrings, 'editor_userperpage')}
                        </label>
                    </div>
                </div>
            ) : showperpage && total > 0 && (
                <div className="flexium-catalogfooter__perpage">
                    <label htmlFor={`${id}-perpage`}>{str(strings, 'catalog_perpage')}</label>
                    <select id={`${id}-perpage`} className="form-select form-select-sm" value={perpage}
                        onChange={event => onPerpageChange(Number(event.target.value))}>
                        {perpageoptions.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                </div>
            )}
        </footer>
    );
}
