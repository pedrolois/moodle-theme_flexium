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
 * Debounced catalogue search box.
 *
 * @module     theme_flexium/catalog/SearchBox
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {useEffect, useId, useRef, useState} from 'react';
import type {Strings} from './types';
import {str} from './utils';

const DEBOUNCE_MS = 400;

interface SearchBoxProps {
    /** The search currently applied; the box follows it when it changes from outside (e.g. "Clear all"). */
    value: string;
    onSearch: (value: string) => void;
    strings: Strings;
}

export default function SearchBox({value, onSearch, strings}: SearchBoxProps) {
    const id = useId();
    const [text, setText] = useState(value);
    const timer = useRef<number | undefined>(undefined);

    useEffect(() => {
        setText(value);
    }, [value]);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    const submit = (next: string) => {
        window.clearTimeout(timer.current);
        if (next.trim() !== value) {
            onSearch(next.trim());
        }
    };

    const change = (next: string) => {
        setText(next);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => submit(next), DEBOUNCE_MS);
    };

    return (
        <form
            role="search"
            className="flexium-search"
            onSubmit={event => {
                event.preventDefault();
                submit(text);
            }}
        >
            <label htmlFor={id} className="visually-hidden">{str(strings, 'catalog_search')}</label>
            <div className="flexium-search__field">
                <i className="fa fa-search flexium-search__icon" aria-hidden="true"></i>
                <input
                    id={id}
                    type="search"
                    className="form-control flexium-search__input"
                    placeholder={str(strings, 'catalog_searchplaceholder')}
                    value={text}
                    autoComplete="off"
                    onChange={event => change(event.target.value)}
                />
            </div>
        </form>
    );
}
