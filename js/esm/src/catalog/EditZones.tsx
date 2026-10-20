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
 * In-place editing of the catalogue (edit mode, site administrators): a magic wand on each part of the page that can
 * change (card image, texts, badges, footer, toolbar, filters, header). Clicking it highlights that part and opens a
 * side panel with its options, previewed at once.
 *
 * @module     theme_flexium/catalog/EditZones
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {createContext, useContext, useEffect, useId, useState, type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import FeatureControl from '@moodle/lms/theme_flexium/catalog/FeatureControl';
import {parseLabels} from '@moodle/lms/theme_flexium/catalog/QuickFilters';
import WidgetList from '@moodle/lms/theme_flexium/catalog/WidgetList';
import type {CardSettings, CatalogOptions, EditorProps, RawFeatures} from './types';
import {str} from './utils';

/** What each part of the page lets the admin change: features, card settings and page options. */
export const ZONES: Record<string, {features: string[]; card?: (keyof CardSettings)[]; options?: (keyof CatalogOptions)[]}> = {
    image: {features: ['statusbadges', 'defaultimage', 'quickview', 'quickviewstyle', 'favourites', 'progress']},
    text: {features: [], card: ['showcategory', 'showsummary']},
    badges: {features: [], card: ['badges']},
    footer: {features: [], card: ['footer']},
    toolbar: {features: ['sharelink', 'defaultsort', 'skeletons']},
    views: {features: ['viewswitch', 'defaultview', 'gridcolumns', 'viewcards', 'listparts', 'listimage']},
    filters: {
        features: ['quickfilters', 'daterange', 'expandall', 'optioncounts', 'showemptyoptions', 'groupsearch', 'groupclear',
            'rememberopen'],
        options: ['filtersdraweropen'],
    },
    heading: {features: ['pageheading', 'pageheadingtext']},
    filtertoggle: {features: ['filtericon', 'filtericoncolour', 'filtericonsize', 'filtericonposition']},
    blocktoggle: {features: ['blockicon', 'blockiconcolour', 'blockiconsize', 'blockiconposition']},
    quickfilters: {features: ['quickfilters', 'optioncounts']},
    breadcrumbs: {features: ['bc_enabled', 'bc_pages', 'bc_source', 'bc_home', 'bc_maxitems', 'bc_maxlength', 'bc_hidelast',
        'bc_hidecategories', 'bc_hidesections', 'bc_separator', 'bc_style', 'bc_mobile']},
    banner: {features: ['banner', 'bannertitle', 'bannertext', 'bannerstyle']},
    coursepage: {features: ['coursepage']},
};

export interface EditZonesValue {
    editor: EditorProps;
    card: CardSettings;
    onCardChange: (card: CardSettings) => void;
    options: CatalogOptions;
    onOptionsChange: (options: CatalogOptions) => void;
    features: RawFeatures;
    onFeatureChange: (key: string, value: string) => void;
    palette: Record<string, string>;
    /** A new default header image was uploaded (URL): show it and select it. */
    onImageUploaded: (url: string) => void;
    /** Zone whose options are open, '' for none, 'all' for every option. */
    active: string;
    setActive: (zone: string) => void;
    /** With every option open: the section unfolded in the accordion, highlighted on the page. */
    focus: string;
    setFocus: (zone: string) => void;
}

const EditZonesContext = createContext<EditZonesValue | null>(null);

export const EditZonesProvider = EditZonesContext.Provider;

/**
 * The editing state, null outside edit mode.
 */
export const useEditZones = (): EditZonesValue | null => useContext(EditZonesContext);

interface EditZoneProps {
    zone: string;
    children: ReactNode;
    /** Show the wand here (e.g. only on the first course card). */
    enabled?: boolean;
    className?: string;
}

/**
 * The magic wand of a zone: opens (or closes) its options.
 */
function Wand({zone, edit}: {zone: string; edit: EditZonesValue}) {
    const title = str(edit.editor.strings, `editzone_${zone}`);
    const active = edit.active === zone || (edit.active === 'all' && edit.focus === zone);
    return (
        <button type="button" className="flexium-editzone__wand" data-zone={zone} aria-expanded={active}
            aria-label={str(edit.editor.strings, 'editor_wand', title)} title={str(edit.editor.strings, 'editor_wand', title)}
            onClick={() => edit.setActive(active ? '' : zone)}>
            <i className="fa fa-wand-magic-sparkles" aria-hidden="true"></i>
        </button>
    );
}

/**
 * A part of the page rendered by Moodle, outside the catalogue (page heading, breadcrumbs): in edit mode it gets the
 * zone highlight and a magic wand, like EditZone.
 */
export function ExternalZone({zone, selector}: {zone: string; selector: string}) {
    const edit = useEditZones();
    const [element] = useState(() => document.querySelector<HTMLElement>(selector));
    const editing = !!edit;
    const active = editing && (edit.active === zone || (edit.active === 'all' && edit.focus === zone));

    useEffect(() => {
        if (!element || !editing) {
            return undefined;
        }
        element.classList.add('flexium-editzone', 'flexium-editzone--padded');
        return () => element.classList.remove('flexium-editzone', 'flexium-editzone--padded');
    }, [element, editing]);

    useEffect(() => {
        element?.classList.toggle('flexium-editzone--active', active);
    }, [element, active]);

    return edit && element ? createPortal(<Wand zone={zone} edit={edit} />, element) : null;
}

/**
 * A part of the page that can change: in edit mode, a magic wand opens its options and the part is highlighted
 * while they are open. Outside edit mode it renders its children only.
 */
export function EditZone({zone, children, enabled = true, className = ''}: EditZoneProps) {
    const edit = useEditZones();
    if (!edit || !enabled) {
        return <>{children}</>;
    }
    const active = edit.active === zone || (edit.active === 'all' && edit.focus === zone);
    return (
        <div className={`flexium-editzone${active ? ' flexium-editzone--active' : ''} ${className}`}>
            {children}
            <Wand zone={zone} edit={edit} />
        </div>
    );
}

/**
 * Card settings of a zone.
 *
 * @param props
 * @param props.setting
 * @param props.edit
 */
function CardControl({setting, edit}: {setting: keyof CardSettings; edit: EditZonesValue}) {
    const id = useId();
    const strings = edit.editor.strings;
    const set = (changes: Partial<CardSettings>) => edit.onCardChange({...edit.card, ...changes});
    if (setting === 'badges') {
        const colourof = (source: string) => edit.card.badgecolours.find(item => item.source === source)?.colour ?? 'primary';
        const setColour = (source: string, colour: string) => set({badgecolours: [
            ...edit.card.badgecolours.filter(item => item.source !== source), {source, colour}]});
        return (
            <>
                <div className="flexium-feature flexium-feature--wide" data-feature="card-badges">
                    <p className="flexium-feature__label mb-1">{str(strings, 'cardbadges')}</p>
                    <WidgetList title={str(strings, 'cardbadges')} value={edit.card.badges} choices={edit.editor.badgechoices}
                        onChange={value => set({badges: value})} strings={strings}
                        renderExtra={source => (
                            // Colour of this source's badges.
                            <div className="flexium-colours" role="radiogroup"
                                aria-label={str(strings, 'cardbadgecolour', source)}>
                                {edit.editor.badgecolours.map(colour => (
                                    <button key={colour} type="button" role="radio" aria-checked={colourof(source) === colour}
                                        className={`flexium-colours__swatch text-bg-${colour}`
                                            + (colourof(source) === colour ? ' is-active' : '')}
                                        title={colour} aria-label={colour} onClick={() => setColour(source, colour)}></button>
                                ))}
                            </div>
                        )} />
                </div>
                <div className="flexium-feature" data-feature="card-badgerows">
                    <div className="form-check form-switch">
                        <input id={id} type="checkbox" role="switch" className="form-check-input" checked={edit.card.badgerows}
                            onChange={event => set({badgerows: event.target.checked})} />
                        <label htmlFor={id} className="form-check-label flexium-feature__label">
                            {str(strings, 'cardbadgerows')}
                        </label>
                    </div>
                    <p className="flexium-feature__help">{str(strings, 'cardbadgerows_desc')}</p>
                </div>
            </>
        );
    }
    if (setting === 'footer') {
        return (
            <div className="flexium-feature flexium-feature--wide" data-feature="card-footer">
                <p className="flexium-feature__label mb-1">{str(strings, 'cardfooter')}</p>
                <WidgetList title={str(strings, 'cardfooter')} value={edit.card.footer} choices={edit.editor.footerchoices}
                    onChange={value => set({footer: value})} strings={strings} />
            </div>
        );
    }
    if (setting !== 'showcategory' && setting !== 'showsummary') {
        return null;
    }
    const key = setting === 'showcategory' ? 'cardshowcategory' : 'cardshowsummary';
    return (
        <div className="flexium-feature" data-feature={`card-${setting}`}>
            <div className="form-check form-switch">
                <input id={id} type="checkbox" role="switch" className="form-check-input" checked={edit.card[setting]}
                    onChange={event => set({[setting]: event.target.checked})} />
                <label htmlFor={id} className="form-check-label flexium-feature__label">{str(strings, key)}</label>
            </div>
        </div>
    );
}

/**
 * Page option of a zone (the filters drawer starting open).
 *
 * @param props
 * @param props.edit
 */
function OptionControl({edit}: {edit: EditZonesValue}) {
    const id = useId();
    return (
        <div className="flexium-feature" data-feature="option-filtersdraweropen">
            <div className="form-check form-switch">
                <input id={id} type="checkbox" role="switch" className="form-check-input"
                    checked={edit.options.filtersdraweropen}
                    onChange={event => edit.onOptionsChange({...edit.options, filtersdraweropen: event.target.checked})} />
                <label htmlFor={id} className="form-check-label flexium-feature__label">
                    {str(edit.editor.strings, 'editor_filtersdraweropen')}
                </label>
            </div>
        </div>
    );
}

/**
 * Names of the chosen quick filters: empty keeps the default name.
 *
 * @param props
 * @param props.edit
 */
function QuickLabels({edit}: {edit: EditZonesValue}) {
    const id = useId();
    const strings = edit.editor.strings;
    const keys = (edit.features.quickfilters ?? '').split(',').filter(Boolean);
    const labels = parseLabels(edit.features.quicklabels ?? '');
    if (!keys.length) {
        return null;
    }
    const set = (key: string, name: string) => {
        const next = {...labels, [key]: name};
        if (!name) {
            delete next[key];
        }
        edit.onFeatureChange('quicklabels', Object.keys(next).length ? JSON.stringify(next) : '');
    };
    return (
        <div className="flexium-feature" data-feature="quicklabels">
            <p className="flexium-feature__label mb-1">{str(strings, 'feature_quicklabels')}</p>
            <p className="flexium-feature__help">{str(strings, 'feature_quicklabels_desc')}</p>
            {keys.map(key => (
                <div key={key} className="mt-2">
                    <label htmlFor={`${id}-${key}`} className="visually-hidden">{str(strings, `quick_${key}`)}</label>
                    <input id={`${id}-${key}`} type="text" className="form-control form-control-sm" maxLength={40} data-quick={key}
                        value={labels[key] ?? ''} placeholder={str(strings, `quick_${key}`)}
                        onChange={event => set(key, event.target.value)} />
                </div>
            ))}
        </div>
    );
}

/**
 * The options of one zone.
 *
 * @param props
 * @param props.zone
 * @param props.edit
 */
function ZoneControls({zone, edit}: {zone: string; edit: EditZonesValue}) {
    const definition = ZONES[zone];
    return (
        <div className="flexium-editpanel__controls">
            {definition.card?.map(setting => <CardControl key={setting} setting={setting} edit={edit} />)}
            {definition.options?.map(option => <OptionControl key={option} edit={edit} />)}
            {(zone === 'filters' || zone === 'quickfilters') && <QuickLabels edit={edit} />}
            {definition.features.map(key => {
                const feature = edit.editor.featuredefs.find(item => item.key === key);
                return feature && (
                    <FeatureControl key={key} definition={feature} value={edit.features[key] ?? ''}
                        onChange={value => edit.onFeatureChange(key, value)} palette={edit.palette}
                        strings={edit.editor.strings} upload={edit.editor.imageupload}
                        onUploaded={edit.onImageUploaded} />
                );
            })}
        </div>
    );
}

/**
 * Spotlight on the highlighted part of the page: everything else is shaded, as the theme does elsewhere.
 * Follows the part on scroll and resize; clicks go through (the shade does not block the page).
 */
export function Spotlight({zone}: {zone: string}) {
    const [rect, setRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        const measure = () => {
            const element = document.querySelector('.flexium-editzone--active');
            setRect(element ? element.getBoundingClientRect() : null);
        };
        const element = document.querySelector('.flexium-editzone--active');
        element?.scrollIntoView({behavior: 'smooth', block: 'nearest'});
        measure();
        // Again once the scroll and the layout settle.
        const timer = window.setInterval(measure, 250);
        window.addEventListener('scroll', measure, true);
        window.addEventListener('resize', measure);
        return () => {
            window.clearInterval(timer);
            window.removeEventListener('scroll', measure, true);
            window.removeEventListener('resize', measure);
        };
    }, [zone]);

    if (!rect) {
        return null;
    }
    const margin = 6;
    return (
        <div className="flexium-spotlight" aria-hidden="true" style={{
            top: rect.top - margin,
            left: rect.left - margin,
            width: rect.width + 2 * margin,
            height: rect.height + 2 * margin,
        }}></div>
    );
}

interface AccordionProps {
    edit: EditZonesValue;
}

/**
 * Every option, as an accordion: one part of the page unfolded (and highlighted) at a time.
 */
function Accordion({edit}: AccordionProps) {
    const id = useId();
    const strings = edit.editor.strings;
    return (
        <div className="flexium-editpanel__accordion">
            {Object.keys(ZONES).map(zone => {
                const open = edit.focus === zone;
                return (
                    <section key={zone} className={`flexium-editpanel__section${open ? ' is-open' : ''}`} data-zone={zone}>
                        <h3 className="flexium-editpanel__sectionheading">
                            <button type="button" id={`${id}-${zone}`} aria-expanded={open} aria-controls={`${id}-${zone}-body`}
                                className="flexium-editpanel__sectiontoggle" onClick={() => edit.setFocus(open ? '' : zone)}>
                                {str(strings, `editzone_${zone}`)}
                                <i className={`fa fa-chevron-${open ? 'up' : 'down'}`} aria-hidden="true"></i>
                            </button>
                        </h3>
                        <div id={`${id}-${zone}-body`} className="flexium-editpanel__sectionbody" hidden={!open}
                            role="region" aria-labelledby={`${id}-${zone}`}>
                            {open && <ZoneControls zone={zone} edit={edit} />}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

/**
 * Side panel with the options of the active zone (or of every zone), next to the page so changes are seen at once.
 */
export function EditSidePanel() {
    const edit = useEditZones();
    const id = useId();
    const active = edit?.active ?? '';
    const close = edit?.setActive;

    useEffect(() => {
        if (!active || !close) {
            return undefined;
        }
        const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close('');
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [active, close]);

    if (!edit || !active) {
        return null;
    }
    const strings = edit.editor.strings;
    const highlighted = active === 'all' ? edit.focus : active;
    return (
        <>
        {highlighted && <Spotlight zone={highlighted} />}
        <aside className="flexium-editpanel" aria-labelledby={`${id}-title`}>
            <div className="flexium-editpanel__header">
                <h2 id={`${id}-title`} className="flexium-editpanel__title">
                    <i className="fa fa-wand-magic-sparkles me-2" aria-hidden="true"></i>
                    {str(strings, `editzone_${active}`)}
                </h2>
                <button type="button" className="btn-close" aria-label={str(strings, 'editor_closepanel')}
                    onClick={() => edit.setActive('')}></button>
            </div>
            <div className="flexium-editpanel__body">
                <p className="flexium-feature__help mb-3">{str(strings, 'editor_aftersave')}</p>
                {active === 'all' ? <Accordion edit={edit} /> : <ZoneControls zone={active} edit={edit} />}
            </div>
        </aside>
        </>
    );
}
