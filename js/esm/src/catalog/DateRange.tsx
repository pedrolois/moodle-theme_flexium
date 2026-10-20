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
 * Start date filter (feature "Start date filter"): courses starting between two dates, both optional.
 *
 * @module     theme_flexium/catalog/DateRange
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {useId} from 'react';
import type {Strings} from './types';
import {str} from './utils';

interface DateRangeProps {
    /** 'YYYY-MM-DD' or ''. */
    from: string;
    to: string;
    onChange: (from: string, to: string) => void;
    strings: Strings;
}

export default function DateRange({from, to, onChange, strings}: DateRangeProps) {
    const id = useId();
    return (
        <fieldset className="flexium-daterange">
            <legend className="flexium-daterange__legend">
                <i className="fa-regular fa-calendar me-2" aria-hidden="true"></i>
                {str(strings, 'catalog_daterange')}
            </legend>
            <div className="flexium-daterange__fields">
                <div>
                    <label htmlFor={`${id}-from`} className="flexium-daterange__label">
                        {str(strings, 'catalog_startfrom')}
                    </label>
                    <input id={`${id}-from`} type="date" className="form-control form-control-sm" value={from}
                        max={to || undefined} onChange={event => onChange(event.target.value, to)} />
                </div>
                <div>
                    <label htmlFor={`${id}-to`} className="flexium-daterange__label">
                        {str(strings, 'catalog_startto')}
                    </label>
                    <input id={`${id}-to`} type="date" className="form-control form-control-sm" value={to}
                        min={from || undefined} onChange={event => onChange(from, event.target.value)} />
                </div>
            </div>
        </fieldset>
    );
}
