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
 * One collapsible filter group of the catalogue sidebar: a checkbox list or the category tree.
 *
 * Optional features: course counts, options without courses, a search box in long groups, a clear button and
 * remembering whether the group is open. Arrow keys move between the options.
 *
 * @module     theme_flexium/catalog/FilterGroupPanel
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {useEffect, useId, useRef, useState, type KeyboardEvent} from 'react';
import CategoryTree from '@moodle/lms/theme_flexium/catalog/CategoryTree';
import OptionCheckbox from '@moodle/lms/theme_flexium/catalog/OptionCheckbox';
import type {BulkToggle, Features, FilterGroup, Strings} from './types';
import {normalise, str} from './utils';

/** Options shown before "Show all" in a list group. */
const COLLAPSED_OPTIONS = 8;

/** Options from which a group gets its search box. */
const SEARCH_FROM = 8;

interface FilterGroupPanelProps {
    group: FilterGroup;
    onToggle: (source: string, value: string) => void;
    /** Clear the selection of this group. */
    onClear: (source: string) => void;
    strings: Strings;
    /** Last "Expand all" / "Collapse all" click of the sidebar. */
    bulk: BulkToggle | null;
    features: Features;
    /** Remembered open state, undefined when not remembered. */
    savedopen?: boolean;
    /** Called when the user opens or closes the group. */
    onOpenChange: (source: string, open: boolean) => void;
    /** Called whenever the group is open or closed, whatever the reason (the "Expand all" / "Collapse all" button). */
    onOpenState: (source: string, open: boolean) => void;
}

/**
 * Arrow keys move the focus between the checkboxes of the group (Home / End: first / last).
 *
 * @param event
 */
const moveFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)
            || !(event.target instanceof HTMLInputElement) || event.target.type !== 'checkbox') {
        return;
    }
    const boxes = Array.from(event.currentTarget.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:not(:disabled)'));
    const index = boxes.indexOf(event.target);
    const next = {
        ArrowDown: Math.min(boxes.length - 1, index + 1),
        ArrowUp: Math.max(0, index - 1),
        Home: 0,
        End: boxes.length - 1,
    }[event.key] ?? index;
    event.preventDefault();
    boxes[next]?.focus();
};

export default function FilterGroupPanel({group, onToggle, onClear, strings, bulk, features, savedopen,
        onOpenChange, onOpenState}: FilterGroupPanelProps) {
    const bodyid = useId();
    const [open, setOpen] = useState(savedopen ?? group.expanded);
    const [showall, setShowall] = useState(false);
    const [filter, setFilter] = useState('');
    const selectedcount = group.options.filter(option => option.selected).length;
    const firstbulk = useRef(bulk);

    // A group opens when one of its options gets selected from outside (e.g. a search matched it).
    useEffect(() => {
        if (selectedcount > 0) {
            setOpen(true);
        }
    }, [selectedcount]);

    useEffect(() => {
        if (bulk && bulk !== firstbulk.current) {
            setOpen(bulk.open);
        }
    }, [bulk]);

    useEffect(() => {
        onOpenState(group.source, open);
    }, [open]);

    const toggleOpen = () => {
        setOpen(!open);
        onOpenChange(group.source, !open);
    };

    // Options without courses are hidden unless the feature shows them (greyed out); selected ones always stay.
    const shown = features.showemptyoptions
        ? group.options
        : group.options.filter(option => option.count > 0 || option.selected);
    const needle = normalise(filter.trim());
    const matching = needle ? shown.filter(option => normalise(option.label).includes(needle)) : shown;
    const options = group.type === 'list' && !showall && !needle ? matching.slice(0, COLLAPSED_OPTIONS) : matching;
    const searchable = features.groupsearch && shown.length > SEARCH_FROM;

    return (
        <section className="flexium-filtergroup">
            <div className="flexium-filtergroup__header">
                <h3 className="flexium-filtergroup__heading">
                    <button
                        type="button"
                        className="flexium-filtergroup__toggle"
                        aria-expanded={open}
                        aria-controls={bodyid}
                        onClick={toggleOpen}
                    >
                        <span className="flexium-filtergroup__label">{group.label}</span>
                        {selectedcount > 0 && (
                            <span className="flexium-filtergroup__count">{selectedcount}</span>
                        )}
                        <i className={`fa fa-chevron-${open ? 'up' : 'down'} flexium-filtergroup__chevron`}
                            aria-hidden="true"></i>
                    </button>
                </h3>
                {features.groupclear && selectedcount > 0 && (
                    <button type="button" className="flexium-filtergroup__clear"
                        aria-label={str(strings, 'catalog_clearoptions', group.label)} title={str(strings, 'catalog_clearoptions',
                            group.label)} onClick={() => onClear(group.source)}>
                        <i className="fa fa-eraser" aria-hidden="true"></i>
                    </button>
                )}
            </div>
            <div id={bodyid} className="flexium-filtergroup__body" hidden={!open} onKeyDown={moveFocus}>
                {searchable && (
                    <div className="flexium-filtergroup__search">
                        <i className="fa fa-magnifying-glass" aria-hidden="true"></i>
                        <input type="search" className="form-control form-control-sm" value={filter}
                            placeholder={str(strings, 'catalog_filteroptions', group.label)}
                            aria-label={str(strings, 'catalog_filteroptions', group.label)}
                            onChange={event => setFilter(event.target.value)} />
                    </div>
                )}
                {matching.length === 0 && (
                    <p className="flexium-filtergroup__empty">{str(strings, 'catalog_nooptions')}</p>
                )}
                {group.type === 'tree' ? (
                    <CategoryTree
                        options={shown}
                        onToggle={value => onToggle(group.source, value)}
                        strings={strings}
                        bulk={bulk}
                        showcount={features.optioncounts}
                        filter={searchable ? filter : ''}
                    />
                ) : (
                    <ul className="flexium-optionlist">
                        {options.map(option => (
                            <li key={option.value}>
                                <OptionCheckbox option={option} onToggle={value => onToggle(group.source, value)}
                                    showcount={features.optioncounts} />
                            </li>
                        ))}
                    </ul>
                )}
                {group.type === 'list' && !needle && matching.length > COLLAPSED_OPTIONS && (
                    <button type="button" className="btn btn-link btn-sm flexium-filtergroup__more"
                        onClick={() => setShowall(!showall)}>
                        {showall ? str(strings, 'catalog_showless') : str(strings, 'catalog_showmore', matching.length)}
                    </button>
                )}
            </div>
        </section>
    );
}
