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
 * Page margins wand (edit mode, site administrators): left and right space around the page content, for the whole
 * site or only the home page / catalogue, with a live preview. Mounted on every page by core_renderer::margins_wand().
 *
 * @module     theme_flexium/margins/MarginsWand
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {useEffect, useId, useState} from 'react';
import {fetchOne} from '@moodle/lms/core/ajax';

type Side = 'left' | 'right';
type Part = 'footer' | 'navbar';
/** Left and right margins (null: Moodle's default), and whether the footer / top bar take them too. */
type Sides = Record<Side, number | null> & Record<Part, boolean>;
type Margins = Record<string, Sides>;

interface MarginsWandProps {
    /** Saved margins: scope (site, home, catalog) => sides, null for Moodle's default. */
    margins: Margins;
    /** Specific scope of this page ('home', 'catalog') or '' when only the whole site applies. */
    pagescope: string;
    /** Largest margin in pixels. */
    max: number;
    strings: Record<string, string>;
}

/** Body selector of each scope, as \theme_flexium\local\margins::SCOPES. */
const SCOPES: Record<string, string> = {site: '', home: '#page-site-index', catalog: '.flexium-catalogpage'};

const SIDES: Side[] = ['left', 'right'];

/** Parts that can take the margins too, as \theme_flexium\local\margins::PARTS. */
const PARTS: Record<Part, string> = {footer: '.flexium-footer', navbar: '.navbar.fixed-top'};

const EMPTY: Sides = {left: null, right: null, footer: false, navbar: false};

/**
 * CSS of the margins, as \theme_flexium\local\margins::css() (written after it, so the preview wins).
 *
 * @param margins
 */
const marginsCss = (margins: Margins): string => {
    const rules = Object.entries(SCOPES).map(([scope, body]) => {
        const sides = margins[scope] ?? EMPTY;
        const declarations = SIDES.filter(side => sides[side] !== null)
            .map(side => `padding-${side}: min(${sides[side]}px, 12vw);`).join(' ');
        if (!declarations) {
            return '';
        }
        const selectors = [`body${body} #page-wrapper #page .main-inner`,
            ...(Object.keys(PARTS) as Part[]).filter(part => sides[part])
                .map(part => `body${body} #page-wrapper ${PARTS[part]}`)];
        return `${selectors.join(', ')} { ${declarations} }`;
    }).join('\n');
    return `@media (min-width: 768px) {\n${rules}\n}`;
};

export default function MarginsWand({margins, pagescope, max, strings}: MarginsWandProps) {
    const id = useId();
    const str = (key: string, a = '') => (strings[key] ?? key).replace('{$a}', a);
    const [saved, setSaved] = useState<Margins>(margins);
    const [draft, setDraft] = useState<Margins>(margins);
    const [open, setOpen] = useState(false);
    const [scope, setScope] = useState(pagescope || 'site');
    const [linked, setLinked] = useState(true);
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    const dirty = JSON.stringify(saved) !== JSON.stringify(draft);
    const sides = draft[scope] ?? EMPTY;
    // On the home page or catalogue, their own margins (when set) override the whole site ones.
    const overridden = scope === 'site' && pagescope !== ''
        && SIDES.some(side => draft[pagescope]?.[side] !== null && draft[pagescope]?.[side] !== undefined);

    // Live preview while editing, and a tint showing the margins while the panel is open.
    useEffect(() => {
        if (!open && !dirty) {
            return undefined;
        }
        const style = document.createElement('style');
        style.id = 'flexium-margins-preview';
        style.textContent = marginsCss(draft);
        document.body.appendChild(style);
        document.body.classList.toggle('flexium-margins-editing', open);
        return () => {
            style.remove();
            document.body.classList.remove('flexium-margins-editing');
        };
    }, [draft, open, dirty]);

    const setPart = (part: Part, value: boolean) => {
        setDraft({...draft, [scope]: {...sides, [part]: value}});
        setStatus('idle');
    };

    const setSide = (side: Side, value: number | null) => {
        const next = {...sides, [side]: value};
        if (linked) {
            next.left = value;
            next.right = value;
        }
        setDraft({...draft, [scope]: next});
        setStatus('idle');
    };

    const save = () => {
        setStatus('saving');
        fetchOne<{scope: string; left: number; right: number; footer: boolean; navbar: boolean}[]>({
            methodname: 'theme_flexium_save_page_margins',
            args: {margins: Object.entries(draft).map(([key, value]) => ({
                scope: key, left: value.left ?? -1, right: value.right ?? -1, footer: value.footer, navbar: value.navbar,
            }))},
        }).then(result => {
            const next: Margins = {};
            result.forEach(item => {
                next[item.scope] = {
                    left: item.left < 0 ? null : item.left,
                    right: item.right < 0 ? null : item.right,
                    footer: item.footer,
                    navbar: item.navbar,
                };
            });
            setSaved(next);
            setDraft(next);
            setStatus('saved');
            return next;
        }).catch(() => setStatus('error'));
    };

    const scopes = ['site', ...(pagescope ? [pagescope] : [])];

    // Floating at the bottom left of the window, on every page (the page parts have no room for it).
    const wand = (
        <button type="button" className="btn btn-primary flexium-marginswand" aria-expanded={open}
            aria-controls={`${id}-panel`} onClick={() => setOpen(!open)}>
            <i className="fa fa-wand-magic-sparkles me-2" aria-hidden="true"></i>
            <i className="fa fa-left-right me-2" aria-hidden="true"></i>
            {str('margins_title')}
        </button>
    );

    const panel = open && (
        <section id={`${id}-panel`} className="flexium-marginspanel" aria-labelledby={`${id}-title`}>
            <div className="flexium-marginspanel__header">
                <h2 id={`${id}-title`} className="h6 m-0">
                    <i className="fa fa-left-right me-2" aria-hidden="true"></i>{str('margins_title')}
                </h2>
                <button type="button" className="btn-close" aria-label={str('editor_closepanel')}
                    onClick={() => setOpen(false)}></button>
            </div>
            <p className="flexium-marginspanel__help">{str('margins_help')}</p>

            {scopes.length > 1 && (
                <fieldset className="flexium-marginspanel__scopes">
                    <legend className="flexium-marginspanel__label">{str('margins_scope')}</legend>
                    {scopes.map(key => (
                        <div key={key} className="form-check form-check-inline">
                            <input id={`${id}-scope-${key}`} type="radio" className="form-check-input" name={`${id}-scope`}
                                checked={scope === key} onChange={() => setScope(key)} />
                            <label htmlFor={`${id}-scope-${key}`} className="form-check-label">
                                {str(`margins_scope_${key}`)}
                            </label>
                        </div>
                    ))}
                </fieldset>
            )}

            <div className="form-check form-switch mb-2">
                <input id={`${id}-link`} type="checkbox" role="switch" className="form-check-input" checked={linked}
                    onChange={event => setLinked(event.target.checked)} />
                <label htmlFor={`${id}-link`} className="form-check-label">{str('margins_link')}</label>
            </div>

            {SIDES.map(side => (
                <div key={side} className="flexium-marginspanel__side">
                    <label htmlFor={`${id}-${side}`} className="flexium-marginspanel__label">
                        {str(`margins_${side}`)}
                        <span className="flexium-marginspanel__value">
                            {sides[side] === null ? str('margins_default') : `${sides[side]} px`}
                        </span>
                    </label>
                    <div className="flexium-marginspanel__row">
                        <input id={`${id}-${side}`} type="range" className="form-range" min={0} max={max} step={8}
                            value={sides[side] ?? 0} disabled={linked && side === 'right'}
                            onChange={event => setSide(side, Number(event.target.value))} />
                        <button type="button" className="btn btn-link btn-sm p-0" disabled={sides[side] === null}
                            onClick={() => setSide(side, null)}>{str('margins_default')}</button>
                    </div>
                </div>
            ))}

            <fieldset className="flexium-marginspanel__parts">
                <legend className="flexium-marginspanel__label">{str('margins_alsoapply')}</legend>
                {(Object.keys(PARTS) as Part[]).map(part => (
                    <div key={part} className="form-check form-switch">
                        <input id={`${id}-${part}`} type="checkbox" role="switch" className="form-check-input"
                            checked={sides[part]} onChange={event => setPart(part, event.target.checked)} />
                        <label htmlFor={`${id}-${part}`} className="form-check-label">{str(`margins_${part}`)}</label>
                    </div>
                ))}
            </fieldset>

            {overridden && <p className="flexium-marginspanel__note">{str('margins_override')}</p>}

            <div className="flexium-marginspanel__actions">
                <span role="status" className="flexium-marginspanel__status">
                    {status === 'saving' && str('editor_saving')}
                    {status === 'saved' && !dirty && str('editor_saved')}
                    {status === 'error' && str('editor_error')}
                    {status !== 'saving' && dirty && str('editor_unsaved')}
                </span>
                <button type="button" className="btn btn-sm btn-outline-secondary" disabled={!dirty || status === 'saving'}
                    onClick={() => {
                        setDraft(saved);
                        setStatus('idle');
                    }}>{str('editor_reset')}</button>
                <button type="button" className="btn btn-sm btn-primary" disabled={!dirty || status === 'saving'}
                    onClick={save}>{str('editor_save')}</button>
            </div>
        </section>
    );

    return (
        <>
            {wand}
            {panel}
        </>
    );
}
