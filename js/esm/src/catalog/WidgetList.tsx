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
 * Widget style list editor: drag (or use the arrow buttons) to reorder, remove with ×, add from a menu.
 *
 * Used by the catalogue editor (edit mode, site administrators) for the filters, card badges and card footer.
 *
 * @module     theme_flexium/catalog/WidgetList
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {useId, useState, type DragEvent, type ReactNode} from 'react';
import type {EditorChoice, Strings} from './types';
import {str} from './utils';

/** Drag payload type, so drops of unrelated content are ignored. */
const DRAG_TYPE = 'application/x-flexium-widget';

interface WidgetListProps {
    /** Accessible name of the list, e.g. "Card footer". */
    title: string;
    /** Selected keys, in order. */
    value: string[];
    /** Everything that can be added. */
    choices: EditorChoice[];
    onChange: (value: string[]) => void;
    /** Extra controls of one widget (e.g. "Expanded by default"). */
    renderExtra?: (key: string) => ReactNode;
    strings: Strings;
}

export default function WidgetList({title, value, choices, onChange, renderExtra, strings}: WidgetListProps) {
    const addid = useId();
    const [dragging, setDragging] = useState<string | null>(null);
    const [dropindex, setDropindex] = useState<number | null>(null);
    const [announcement, setAnnouncement] = useState('');
    const [adding, setAdding] = useState('');

    const bykey = new Map(choices.map(choice => [choice.key, choice]));
    const labelof = (key: string) => bykey.get(key)?.label ?? key;
    const available = choices.filter(choice => !value.includes(choice.key));

    /**
     * Move the item at `from` so it ends up before the item now at `to` (to = length: at the end).
     */
    const move = (from: number, to: number) => {
        if (from === to || from + 1 === to || to < 0 || to > value.length) {
            return;
        }
        const next = [...value];
        const [item] = next.splice(from, 1);
        next.splice(to > from ? to - 1 : to, 0, item);
        onChange(next);
        setAnnouncement(str(strings, 'filtereditor_moved', labelof(item)));
    };

    const over = (event: DragEvent, index: number) => {
        if (!dragging || !event.dataTransfer.types.includes(DRAG_TYPE)) {
            return;
        }
        event.preventDefault();
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        setDropindex(event.clientY > rect.top + rect.height / 2 ? index + 1 : index);
    };

    const drop = (event: DragEvent) => {
        event.preventDefault();
        const key = event.dataTransfer.getData(DRAG_TYPE);
        const from = value.indexOf(key);
        if (from >= 0 && dropindex !== null) {
            move(from, dropindex);
        }
        setDragging(null);
        setDropindex(null);
    };

    return (
        <div className="flexium-widgets">
            <ol className="flexium-widgets__list" aria-label={title} onDrop={drop}
                onDragOver={event => dragging && event.preventDefault()}>
                {value.length === 0 && <li className="flexium-widgets__empty">{str(strings, 'editor_empty')}</li>}
                {value.map((key, index) => {
                    const label = labelof(key);
                    const classes = ['flexium-widget'];
                    if (dragging === key) {
                        classes.push('flexium-widget--dragging');
                    }
                    if (dropindex === index) {
                        classes.push('flexium-widget--dropbefore');
                    } else if (dropindex === index + 1 && index === value.length - 1) {
                        classes.push('flexium-widget--dropafter');
                    }
                    return (
                        <li
                            key={key}
                            className={classes.join(' ')}
                            draggable
                            onDragStart={event => {
                                event.dataTransfer.setData(DRAG_TYPE, key);
                                event.dataTransfer.effectAllowed = 'move';
                                setDragging(key);
                            }}
                            onDragEnd={() => {
                                setDragging(null);
                                setDropindex(null);
                            }}
                            onDragOver={event => over(event, index)}
                        >
                            <div className="flexium-widget__bar">
                                <span className="flexium-widget__handle" title={str(strings, 'filtereditor_drag', label)}
                                    aria-hidden="true">
                                    <i className="fa fa-grip-vertical"></i>
                                </span>
                                <span className="flexium-widget__label">
                                    {label}
                                    {bykey.get(key)?.kind && (
                                        <span className="flexium-widget__kind">{bykey.get(key)?.kind}</span>
                                    )}
                                </span>
                                <span className="flexium-widget__actions">
                                    <button type="button" className="flexium-widget__btn" disabled={index === 0}
                                        onClick={() => move(index, index - 1)}
                                        aria-label={str(strings, 'filtereditor_moveup', label)}>
                                        <i className="fa fa-arrow-up" aria-hidden="true"></i>
                                    </button>
                                    <button type="button" className="flexium-widget__btn" disabled={index === value.length - 1}
                                        onClick={() => move(index, index + 2)}
                                        aria-label={str(strings, 'filtereditor_movedown', label)}>
                                        <i className="fa fa-arrow-down" aria-hidden="true"></i>
                                    </button>
                                    <button type="button" className="flexium-widget__btn flexium-widget__btn--remove"
                                        onClick={() => onChange(value.filter(item => item !== key))}
                                        aria-label={str(strings, 'filtereditor_remove', label)}>
                                        <i className="fa fa-xmark" aria-hidden="true"></i>
                                    </button>
                                </span>
                            </div>
                            {renderExtra && <div className="flexium-widget__extra">{renderExtra(key)}</div>}
                        </li>
                    );
                })}
            </ol>

            <div className="flexium-widgets__add">
                <label htmlFor={addid} className="visually-hidden">{str(strings, 'editor_add')}</label>
                <select id={addid} className="form-select form-select-sm" value={adding}
                    disabled={available.length === 0} onChange={event => setAdding(event.target.value)}>
                    <option value="">
                        {available.length ? str(strings, 'editor_add') : str(strings, 'editor_nothingtoadd')}
                    </option>
                    {available.map(choice => <option key={choice.key} value={choice.key}>{choice.label}</option>)}
                </select>
                <button type="button" className="btn btn-sm btn-outline-primary" disabled={!adding}
                    aria-label={str(strings, 'editor_add')}
                    onClick={() => {
                        onChange([...value, adding]);
                        setAdding('');
                    }}>
                    <i className="fa fa-plus" aria-hidden="true"></i>
                </button>
            </div>

            <div className="visually-hidden" aria-live="polite">{announcement}</div>
        </div>
    );
}
