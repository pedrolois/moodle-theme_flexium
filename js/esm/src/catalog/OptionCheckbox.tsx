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
 * A filter option checkbox with its faceted course count.
 *
 * @module     theme_flexium/catalog/OptionCheckbox
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {useId} from 'react';
import type {FilterOption} from './types';
import {formatNumber} from './utils';

interface OptionCheckboxProps {
    option: FilterOption;
    onToggle: (value: string) => void;
    /** Show the number of courses (feature "Course counts in the filters"). */
    showcount?: boolean;
}

export default function OptionCheckbox({option, onToggle, showcount = true}: OptionCheckboxProps) {
    const id = useId();
    const empty = option.count === 0 && !option.selected;

    return (
        <div className={`form-check flexium-option${empty ? ' flexium-option--empty' : ''}`}>
            <input
                id={id}
                type="checkbox"
                className="form-check-input"
                checked={option.selected}
                disabled={empty}
                onChange={() => onToggle(option.value)}
            />
            <label htmlFor={id} className="form-check-label flexium-option__label">
                <span className="flexium-option__text">{option.label}</span>
                {showcount && <span className="flexium-option__count">{formatNumber(option.count)}</span>}
            </label>
        </div>
    );
}
