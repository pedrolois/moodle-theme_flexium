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
 * Active filters panel: one removable chip per selected option and for the search text.
 *
 * @module     theme_flexium/catalog/ActiveFilters
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import type {SelectedOption, Strings} from './types';
import {str} from './utils';

interface ActiveFiltersProps {
    search: string;
    selected: SelectedOption[];
    /** Group label of each source, for the chip prefix. */
    grouplabels: Record<string, string>;
    onRemoveSearch: () => void;
    onRemove: (source: string, value: string) => void;
    onClearAll: () => void;
    strings: Strings;
}

interface ChipProps {
    prefix: string;
    label: string;
    onRemove: () => void;
    strings: Strings;
}

function Chip({prefix, label, onRemove, strings}: ChipProps) {
    const text = `${prefix}: ${label}`;
    return (
        <li className="flexium-chip">
            <span className="flexium-chip__prefix">{prefix}:</span>
            <span className="flexium-chip__label">{label}</span>
            <button type="button" className="flexium-chip__remove" onClick={onRemove}
                aria-label={str(strings, 'catalog_removefilter', text)}>
                <i className="fa fa-xmark" aria-hidden="true"></i>
            </button>
        </li>
    );
}

export default function ActiveFilters({search, selected, grouplabels, onRemoveSearch, onRemove, onClearAll,
        strings}: ActiveFiltersProps) {
    if (!search && selected.length === 0) {
        return null;
    }
    const searchlabel = str(strings, 'catalog_search');

    return (
        <section className="flexium-activefilters" aria-label={str(strings, 'catalog_activefilters')}>
            <h2 className="flexium-activefilters__title">{str(strings, 'catalog_activefilters')}</h2>
            <ul className="flexium-activefilters__chips">
                {search && (
                    <Chip prefix={searchlabel} label={`“${search}”`} onRemove={onRemoveSearch} strings={strings} />
                )}
                {selected.map(option => (
                    <Chip
                        key={`${option.source}|${option.value}`}
                        prefix={grouplabels[option.source] ?? option.source}
                        label={option.label}
                        onRemove={() => onRemove(option.source, option.value)}
                        strings={strings}
                    />
                ))}
            </ul>
            <button type="button" className="btn btn-link flexium-activefilters__clear" onClick={onClearAll}>
                {str(strings, 'catalog_clearall')}
            </button>
        </section>
    );
}
