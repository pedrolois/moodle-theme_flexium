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
 * Settings form of a home page section, generated from its fields (\theme_flexium\local\home\fields).
 *
 * @module     theme_flexium/home/SchemaForm
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {useId, useState} from 'react';
import type {Field, HomeData, Settings, Strings} from './types';

interface FormContext {
    strings: Strings;
    palette: Record<string, string>;
    icons: Record<string, string>;
    data: HomeData | null;
}

interface FieldControlProps {
    field: Field;
    value: unknown;
    onChange: (value: unknown) => void;
    context: FormContext;
}

const str = (strings: Strings, key: string, a: string | number = ''): string =>
    (strings[key] ?? key).replace('{$a}', String(a));

/**
 * A copy of a list with two entries swapped.
 *
 * @param list
 * @param a
 * @param b
 */
const swap = <T, >(list: T[], a: number, b: number): T[] => {
    const copy = [...list];
    [copy[a], copy[b]] = [copy[b], copy[a]];
    return copy;
};

/**
 * List of entries (feature boxes, questions, testimonials...): each entry folds open with its own fields.
 */
function ItemsControl({field, value, onChange, context}: FieldControlProps) {
    const list = Array.isArray(value) ? value as Settings[] : [];
    const [open, setOpen] = useState<number | null>(null);
    const set = (next: Settings[]) => onChange(next);
    const titleof = (item: Settings, index: number) =>
        String(item.title ?? item.question ?? item.name ?? item.quote ?? '').slice(0, 60) || `#${index + 1}`;

    return (
        <div className="flexium-homeform__items">
            {list.map((item, index) => (
                <div key={index} className={`flexium-homeform__item${open === index ? ' is-open' : ''}`}>
                    <div className="flexium-homeform__itembar">
                        <button type="button" className="flexium-homeform__itemtoggle" aria-expanded={open === index}
                            onClick={() => setOpen(open === index ? null : index)}>
                            {titleof(item, index)}
                        </button>
                        <button type="button" className="flexium-widget__btn" disabled={index === 0}
                            aria-label={str(context.strings, 'home_moveup')}
                            onClick={() => set(swap(list, index, index - 1))}>
                            <i className="fa fa-arrow-up" aria-hidden="true"></i>
                        </button>
                        <button type="button" className="flexium-widget__btn" disabled={index === list.length - 1}
                            aria-label={str(context.strings, 'home_movedown')}
                            onClick={() => set(swap(list, index, index + 1))}>
                            <i className="fa fa-arrow-down" aria-hidden="true"></i>
                        </button>
                        <button type="button" className="flexium-widget__btn flexium-widget__btn--remove"
                            aria-label={str(context.strings, 'home_removeitem')}
                            onClick={() => set(list.filter((_, position) => position !== index))}>
                            <i className="fa fa-xmark" aria-hidden="true"></i>
                        </button>
                    </div>
                    {open === index && (
                        <div className="flexium-homeform__itembody">
                            {field.fields.map(subfield => (
                                <FieldControl key={subfield.key} field={subfield} value={item[subfield.key]} context={context}
                                    onChange={next => set(list.map((entry, position) =>
                                        (position === index ? {...entry, [subfield.key]: next} : entry)))} />
                            ))}
                        </div>
                    )}
                </div>
            ))}
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => {
                const blank: Settings = {};
                field.fields.forEach(subfield => {
                    blank[subfield.key] = subfield.type === 'icon' ? Object.values(context.icons)[0] : '';
                });
                set([...list, blank]);
                setOpen(list.length);
            }}>
                <i className="fa fa-plus me-1" aria-hidden="true"></i>{str(context.strings, 'home_additem')}
            </button>
        </div>
    );
}

/**
 * The control of one field.
 */
function FieldControl({field, value, onChange, context}: FieldControlProps) {
    const id = useId();
    const label = <label htmlFor={id} className="flexium-feature__label">{field.label}</label>;
    const textvalue = typeof value === 'string' || typeof value === 'number' ? String(value) : '';

    switch (field.type) {
        case 'bool':
            return (
                <div className="form-check form-switch flexium-homeform__field" data-field={field.key}>
                    <input id={id} type="checkbox" role="switch" className="form-check-input" checked={value === true}
                        onChange={event => onChange(event.target.checked)} />
                    <label htmlFor={id} className="form-check-label flexium-feature__label">{field.label}</label>
                </div>
            );
        case 'textarea':
            return (
                <div className="flexium-homeform__field" data-field={field.key}>
                    {label}
                    <textarea id={id} className="form-control form-control-sm" rows={3} value={textvalue}
                        onChange={event => onChange(event.target.value)}></textarea>
                </div>
            );
        case 'select':
            return (
                <div className="flexium-homeform__field" data-field={field.key}>
                    {label}
                    <select id={id} className="form-select form-select-sm" value={textvalue}
                        onChange={event => onChange(event.target.value)}>
                        {field.choices.map(choice => <option key={choice.key} value={choice.key}>{choice.label}</option>)}
                    </select>
                </div>
            );
        case 'category':
            return (
                <div className="flexium-homeform__field" data-field={field.key}>
                    {label}
                    <select id={id} className="form-select form-select-sm" value={textvalue}
                        onChange={event => onChange(Number(event.target.value))}>
                        <option value="0">-</option>
                        {(context.data?.categories ?? []).map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                </div>
            );
        case 'palette':
            return (
                <div className="flexium-homeform__field" data-field={field.key}>
                    <span className="flexium-feature__label">{field.label}</span>
                    <div className="flexium-feature__swatches" role="radiogroup" aria-label={field.label}>
                        {Object.entries(context.palette).map(([key, url]) => (
                            <button key={key} type="button" role="radio" aria-checked={textvalue === key} aria-label={key}
                                className={`flexium-feature__swatch${textvalue === key ? ' is-active' : ''}`}
                                style={{backgroundImage: `url("${url}")`}} onClick={() => onChange(key)}></button>
                        ))}
                    </div>
                </div>
            );
        case 'icon':
            return (
                <div className="flexium-homeform__field" data-field={field.key}>
                    <span className="flexium-feature__label">{field.label}</span>
                    <div className="flexium-homeform__icons" role="radiogroup" aria-label={field.label}>
                        {Object.entries(context.icons).map(([key, classes]) => (
                            <button key={key} type="button" role="radio" aria-checked={textvalue === classes} aria-label={key}
                                className={`flexium-homeform__icon${textvalue === classes ? ' is-active' : ''}`}
                                onClick={() => onChange(classes)}>
                                <i className={classes} aria-hidden="true"></i>
                            </button>
                        ))}
                    </div>
                </div>
            );
        case 'checklist': {
            const chosen = Array.isArray(value) ? value as string[] : [];
            return (
                <fieldset className="flexium-homeform__field" data-field={field.key}>
                    <legend className="flexium-feature__label">{field.label}</legend>
                    {field.choices.map(choice => (
                        <div key={choice.key} className="form-check">
                            <input id={`${id}-${choice.key}`} type="checkbox" className="form-check-input"
                                checked={chosen.includes(choice.key)}
                                onChange={event => onChange(event.target.checked
                                    ? field.choices.map(item => item.key).filter(key => key === choice.key || chosen.includes(key))
                                    : chosen.filter(key => key !== choice.key))} />
                            <label htmlFor={`${id}-${choice.key}`} className="form-check-label">{choice.label}</label>
                        </div>
                    ))}
                </fieldset>
            );
        }
        case 'items':
            return (
                <div className="flexium-homeform__field" data-field={field.key}>
                    <span className="flexium-feature__label">{field.label}</span>
                    <ItemsControl field={field} value={value} onChange={onChange} context={context} />
                </div>
            );
        default:
            return (
                <div className="flexium-homeform__field" data-field={field.key}>
                    {label}
                    <input id={id} type={field.type === 'url' ? 'url' : 'text'} className="form-control form-control-sm"
                        value={textvalue} onChange={event => onChange(event.target.value)} />
                </div>
            );
    }
}

interface SchemaFormProps extends FormContext {
    fields: Field[];
    settings: Settings;
    onChange: (settings: Settings) => void;
}

export default function SchemaForm({fields, settings, onChange, strings, palette, icons, data}: SchemaFormProps) {
    const context = {strings, palette, icons, data};
    return (
        <div className="flexium-homeform">
            {fields.map(field => (
                <FieldControl key={field.key} field={field} value={settings[field.key]} context={context}
                    onChange={value => onChange({...settings, [field.key]: value})} />
            ))}
        </div>
    );
}
