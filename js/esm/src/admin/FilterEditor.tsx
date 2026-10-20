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
 * Admin editor of the catalogue filter layout: drag and drop (or arrow buttons) to reorder,
 * add and remove filter groups, and choose which start expanded.
 *
 * Rendered by theme_flexium\admin\setting_catalogfilters. Every change is written as JSON to the
 * setting's hidden input, which the admin settings form saves.
 *
 * @module     theme_flexium/admin/FilterEditor
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {useEffect, useState, type DragEvent} from 'react';

interface LayoutItem {
    source: string;
    expanded: boolean;
}

interface Source {
    source: string;
    label: string;
    /** Human readable kind, e.g. "Course custom field (select)". */
    kind: string;
}

interface FilterEditorProps {
    inputid: string;
    layout: LayoutItem[];
    sources: Source[];
    strings: Record<string, string>;
}

/** Drag payload type, so drops of unrelated content are ignored. */
const DRAG_TYPE = 'application/x-flexium-filter';

export default function FilterEditor({inputid, layout: initiallayout, sources, strings}: FilterEditorProps) {
    const [layout, setLayout] = useState<LayoutItem[]>(initiallayout);
    const [dragging, setDragging] = useState<string | null>(null);
    const [dropindex, setDropindex] = useState<number | null>(null);
    const [announcement, setAnnouncement] = useState('');

    const str = (key: string, a = '') => (strings[key] ?? key).replace('{$a}', a);
    const bysource = new Map(sources.map(source => [source.source, source]));
    const labelof = (key: string) => bysource.get(key)?.label ?? key;
    const shown = new Set(layout.map(item => item.source));
    const available = sources.filter(source => !shown.has(source.source));

    // Keep the hidden input (saved by the settings form) in sync, and let the form know it changed.
    useEffect(() => {
        const input = document.getElementById(inputid) as HTMLInputElement | null;
        if (input && input.value !== JSON.stringify(layout)) {
            input.value = JSON.stringify(layout);
            input.dispatchEvent(new Event('change', {bubbles: true}));
        }
    }, [layout, inputid]);

    const move = (from: number, to: number) => {
        if (from === to || to < 0 || to > layout.length) {
            return;
        }
        const next = [...layout];
        const [item] = next.splice(from, 1);
        next.splice(to > from ? to - 1 : to, 0, item);
        setLayout(next);
        setAnnouncement(str('filtereditor_moved', labelof(item.source)));
    };

    const add = (source: string, index = layout.length) => {
        const next = [...layout];
        next.splice(index, 0, {source, expanded: false});
        setLayout(next);
    };

    const remove = (source: string) => setLayout(layout.filter(item => item.source !== source));

    const setExpanded = (source: string, expanded: boolean) =>
        setLayout(layout.map(item => (item.source === source ? {...item, expanded} : item)));

    const startDrag = (event: DragEvent, source: string) => {
        event.dataTransfer.setData(DRAG_TYPE, source);
        event.dataTransfer.effectAllowed = 'move';
        setDragging(source);
    };

    const endDrag = () => {
        setDragging(null);
        setDropindex(null);
    };

    const overShown = (event: DragEvent, index: number) => {
        if (!event.dataTransfer.types.includes(DRAG_TYPE)) {
            return;
        }
        event.preventDefault();
        // Drop before or after the hovered row depending on the pointer position.
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        setDropindex(event.clientY > rect.top + rect.height / 2 ? index + 1 : index);
    };

    const dropShown = (event: DragEvent) => {
        event.preventDefault();
        const source = event.dataTransfer.getData(DRAG_TYPE);
        const target = dropindex ?? layout.length;
        const from = layout.findIndex(item => item.source === source);
        if (from >= 0) {
            move(from, target);
        } else if (bysource.has(source)) {
            add(source, target);
        }
        endDrag();
    };

    const dropAvailable = (event: DragEvent) => {
        event.preventDefault();
        const source = event.dataTransfer.getData(DRAG_TYPE);
        if (shown.has(source)) {
            remove(source);
        }
        endDrag();
    };

    return (
        <div className="flexium-filtereditor">
            <div className="flexium-filtereditor__column">
                <h4 className="flexium-filtereditor__title">{str('filtereditor_shown')}</h4>
                <ol
                    className="flexium-filtereditor__list flexium-filtereditor__list--shown"
                    onDragOver={event => {
                        if (event.dataTransfer.types.includes(DRAG_TYPE) && layout.length === 0) {
                            event.preventDefault();
                            setDropindex(0);
                        }
                    }}
                    onDrop={dropShown}
                >
                    {layout.length === 0 && <li className="flexium-filtereditor__empty">{str('filtereditor_empty')}</li>}
                    {layout.map((item, index) => {
                        const label = labelof(item.source);
                        const classes = ['flexium-filtereditor__item'];
                        if (dragging === item.source) {
                            classes.push('flexium-filtereditor__item--dragging');
                        }
                        if (dropindex === index) {
                            classes.push('flexium-filtereditor__item--dropbefore');
                        }
                        if (dropindex === index + 1 && index === layout.length - 1) {
                            classes.push('flexium-filtereditor__item--dropafter');
                        }
                        return (
                            <li
                                key={item.source}
                                className={classes.join(' ')}
                                draggable
                                onDragStart={event => startDrag(event, item.source)}
                                onDragEnd={endDrag}
                                onDragOver={event => overShown(event, index)}
                            >
                                <span className="flexium-filtereditor__handle" title={str('filtereditor_drag', label)}
                                    aria-hidden="true">
                                    <i className="fa fa-grip-vertical"></i>
                                </span>
                                <span className="flexium-filtereditor__text">
                                    <span className="flexium-filtereditor__label">{label}</span>
                                    <span className="flexium-filtereditor__kind">{bysource.get(item.source)?.kind}</span>
                                </span>
                                <label className="flexium-filtereditor__expanded">
                                    <input type="checkbox" className="form-check-input me-1" checked={item.expanded}
                                        onChange={event => setExpanded(item.source, event.target.checked)} />
                                    {str('filtereditor_expanded')}
                                </label>
                                <span className="flexium-filtereditor__actions">
                                    <button type="button" className="btn btn-sm btn-outline-secondary"
                                        disabled={index === 0} onClick={() => move(index, index - 1)}
                                        aria-label={str('filtereditor_moveup', label)}>
                                        <i className="fa fa-arrow-up" aria-hidden="true"></i>
                                    </button>
                                    <button type="button" className="btn btn-sm btn-outline-secondary"
                                        disabled={index === layout.length - 1} onClick={() => move(index, index + 2)}
                                        aria-label={str('filtereditor_movedown', label)}>
                                        <i className="fa fa-arrow-down" aria-hidden="true"></i>
                                    </button>
                                    <button type="button" className="btn btn-sm btn-outline-danger"
                                        onClick={() => remove(item.source)} aria-label={str('filtereditor_remove', label)}>
                                        <i className="fa fa-xmark" aria-hidden="true"></i>
                                    </button>
                                </span>
                            </li>
                        );
                    })}
                </ol>
            </div>

            <div className="flexium-filtereditor__column">
                <h4 className="flexium-filtereditor__title">{str('filtereditor_available')}</h4>
                <ul
                    className="flexium-filtereditor__list flexium-filtereditor__list--available"
                    onDragOver={event => {
                        if (event.dataTransfer.types.includes(DRAG_TYPE)) {
                            event.preventDefault();
                        }
                    }}
                    onDrop={dropAvailable}
                >
                    {available.length === 0 && (
                        <li className="flexium-filtereditor__empty">{str('filtereditor_noavailable')}</li>
                    )}
                    {available.map(source => (
                        <li key={source.source} className="flexium-filtereditor__item" draggable
                            onDragStart={event => startDrag(event, source.source)} onDragEnd={endDrag}>
                            <span className="flexium-filtereditor__handle" aria-hidden="true">
                                <i className="fa fa-grip-vertical"></i>
                            </span>
                            <span className="flexium-filtereditor__text">
                                <span className="flexium-filtereditor__label">{source.label}</span>
                                <span className="flexium-filtereditor__kind">{source.kind}</span>
                            </span>
                            <span className="flexium-filtereditor__actions">
                                <button type="button" className="btn btn-sm btn-outline-primary"
                                    onClick={() => add(source.source)} aria-label={str('filtereditor_add', source.label)}>
                                    <i className="fa fa-plus" aria-hidden="true"></i>
                                </button>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="visually-hidden" aria-live="polite">{announcement}</div>
        </div>
    );
}
