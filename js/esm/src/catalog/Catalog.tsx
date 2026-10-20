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
 * Flexium course catalogue: filter sidebar, active filters, sorting and the course grid.
 *
 * Mounted by theme_flexium\output\core\course_renderer::course_category(). The query lives in the
 * page URL (search, filters, quick filters, dates, sort, page), so results can be shared and survive reloads.
 *
 * Every optional part (see \theme_flexium\local\catalog\features) can be switched on and off; in edit mode the
 * draft features are previewed at once.
 *
 * @module     theme_flexium/catalog/Catalog
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import ActiveFilters from '@moodle/lms/theme_flexium/catalog/ActiveFilters';
import Banner from '@moodle/lms/theme_flexium/catalog/Banner';
import CatalogFooter from '@moodle/lms/theme_flexium/catalog/CatalogFooter';
import CourseCard from '@moodle/lms/theme_flexium/catalog/CourseCard';
import DateRange from '@moodle/lms/theme_flexium/catalog/DateRange';
import EditorPanel from '@moodle/lms/theme_flexium/catalog/EditorPanel';
import {EditSidePanel, EditZone, EditZonesProvider, ExternalZone, useEditZones, type EditZonesValue}
    from '@moodle/lms/theme_flexium/catalog/EditZones';
import FilterGroupPanel from '@moodle/lms/theme_flexium/catalog/FilterGroupPanel';
import QuickFilters from '@moodle/lms/theme_flexium/catalog/QuickFilters';
import QuickView from '@moodle/lms/theme_flexium/catalog/QuickView';
import ResultsToolbar from '@moodle/lms/theme_flexium/catalog/ResultsToolbar';
import SearchBox from '@moodle/lms/theme_flexium/catalog/SearchBox';
import WidgetList from '@moodle/lms/theme_flexium/catalog/WidgetList';
import useCatalogEditor from '@moodle/lms/theme_flexium/catalog/useCatalogEditor';
import {getCatalog, setFavourite, setPreference} from './repository';
import type {BadgeStyle, BulkToggle, CatalogOptions, CatalogProps, CatalogQuery, CatalogResponse, Course, EditorProps,
    Features, LayoutItem, Selection, Strings} from './types';
import {decodeFeatures, readLocal, readQueryFromUrl, str, toggleValue, writeLocal,
    writeQueryToUrl} from './utils';

/** Preference names (logged in users) and browser storage keys (visitors). */
const PREF_GROUPS = 'theme_flexium_catalog_groups';
const PREF_VIEW = 'theme_flexium_catalog_view';

/** Placeholder cards while the first results load. */
const SKELETON_CARDS = 6;

interface FilterWidgetsProps {
    editor: EditorProps;
    layout: LayoutItem[];
    onChange: (layout: LayoutItem[]) => void;
}

/**
 * Edit mode: the filter groups become widgets (drag to reorder, add, remove, start expanded).
 */
function FilterWidgets({editor, layout, onChange}: FilterWidgetsProps) {
    const itemof = (source: string) => layout.find(item => item.source === source);
    const expanded = (source: string) => itemof(source)?.expanded ?? false;
    const update = (source: string, changes: Partial<LayoutItem>) =>
        onChange(layout.map(item => (item.source === source ? {...item, ...changes} : item)));
    return (
        <div className="flexium-filterwidgets">
            <EditZone zone="filters">
                <h3 className="flexium-filterwidgets__title">{str(editor.strings, 'editor_filterstitle')}</h3>
            </EditZone>
            <WidgetList
                title={str(editor.strings, 'editor_filterstitle')}
                value={layout.map(item => item.source)}
                choices={editor.sources}
                onChange={sources => onChange(sources.map(source => ({source, expanded: expanded(source),
                    label: itemof(source)?.label ?? ''})))}
                renderExtra={source => (
                    <>
                        {/* Custom name of the group; empty keeps the default one. */}
                        <input type="text" className="form-control form-control-sm flexium-widget__name" maxLength={100}
                            value={itemof(source)?.label ?? ''} aria-label={str(editor.strings, 'filtereditor_name')}
                            placeholder={editor.sources.find(choice => choice.key === source)?.label ?? ''}
                            onChange={event => update(source, {label: event.target.value})} />
                        <label className="flexium-widget__check">
                            <input type="checkbox" className="form-check-input me-1" checked={expanded(source)}
                                onChange={event => update(source, {expanded: event.target.checked})} />
                            {str(editor.strings, 'filtereditor_expanded')}
                        </label>
                    </>
                )}
                strings={editor.strings}
            />
        </div>
    );
}

interface ResultsProps {
    data: CatalogResponse | null;
    loading: boolean;
    error: boolean;
    strings: Strings;
    features: Features;
    view: string;
    loggedin: boolean;
    onFavourite: (course: Course) => void;
    onQuickView: (course: Course) => void;
    /** Edit mode: the first card carries the magic wands of the card parts. */
    editing: boolean;
    badgestyle: BadgeStyle;
}

/**
 * Classes of the course grid: view, columns and, for a list with its own card content, the hidden parts.
 *
 * @param features
 * @param view grid or list
 */
const gridClasses = (features: Features, view: string): string => {
    const classes = ['flexium-catalog__grid', `flexium-catalog__grid--${view}`];
    if (view === 'grid' && features.gridcolumns !== 'auto') {
        classes.push(`flexium-catalog__grid--cols-${features.gridcolumns}`);
    }
    if (view === 'list' && features.viewcards === 'separate') {
        classes.push(`flexium-catalog__grid--image-${features.listimage}`);
        ['image', 'category', 'summary', 'badges', 'footer'].filter(part => !features.listparts.includes(part))
            .forEach(part => classes.push(`flexium-catalog__grid--no-${part}`));
    }
    return classes.join(' ');
};

/**
 * The course grid (or list), with its first-load and empty states. Previous results stay visible, dimmed, while loading.
 */
function Results({data, loading, error, strings, features, view, loggedin, onFavourite, onQuickView,
        editing, badgestyle}: ResultsProps) {
    const gridclass = gridClasses(features, view);
    return (
        <div className={`flexium-catalog__results${loading ? ' flexium-catalog__results--loading' : ''}`}
            aria-busy={loading}>
            {!data && loading && (features.skeletons ? (
                <ul className={gridclass} aria-hidden="true">
                    {Array.from({length: SKELETON_CARDS}, (_, index) => (
                        <li key={index}>
                            <div className="flexium-card flexium-card--skeleton">
                                <div className="flexium-card__image"></div>
                                <div className="flexium-card__body">
                                    <span className="flexium-skeleton flexium-skeleton--short"></span>
                                    <span className="flexium-skeleton flexium-skeleton--title"></span>
                                    <span className="flexium-skeleton"></span>
                                    <span className="flexium-skeleton"></span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="flexium-catalog__loading">
                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                    {str(strings, 'catalog_loading')}
                </div>
            ))}
            {data && data.courses.length === 0 && !error && (
                <div className="flexium-catalog__empty">
                    <i className="fa fa-magnifying-glass flexium-catalog__emptyicon" aria-hidden="true"></i>
                    <h2 className="h4">{str(strings, 'catalog_noresults')}</h2>
                    <p>{str(strings, 'catalog_noresults_help')}</p>
                </div>
            )}
            {data && data.courses.length > 0 && (
                <ul className={gridclass}>
                    {data.courses.map((course, index) => (
                        <li key={course.id}>
                            <CourseCard course={course} strings={strings} features={features} loggedin={loggedin}
                                onFavourite={onFavourite} onQuickView={onQuickView} wands={editing && index === 0}
                                badgestyle={badgestyle} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/**
 * Courses per page: the edit mode draft, else the visitor's choice when allowed, else the site default.
 *
 * @param options edit mode draft options, undefined outside edit mode
 * @param userperpage whether visitors may choose (site setting)
 * @param perpageoptions allowed values
 * @param chosen the visitor's choice from the URL, 0 for none
 * @param defaultperpage the site default
 */
const resolvePerpage = (options: CatalogOptions | undefined, userperpage: boolean, perpageoptions: number[],
        chosen: number, defaultperpage: number): {allowuser: boolean; perpage: number} => {
    if (options) {
        return {allowuser: options.userperpage, perpage: options.perpage};
    }
    return {allowuser: userperpage, perpage: userperpage && perpageoptions.includes(chosen) ? chosen : defaultperpage};
};

/**
 * Remember a catalogue preference: user preference when logged in, browser storage for visitors.
 *
 * @param name preference name
 * @param value
 * @param loggedin
 */
const remember = (name: string, value: string, loggedin: boolean) => {
    if (loggedin) {
        setPreference(name, value).catch(() => writeLocal(name, value));
    } else {
        writeLocal(name, value);
    }
};

/**
 * A remembered value: the user preference when logged in, else (or when unset) the browser storage.
 *
 * @param name preference name
 * @param saved user preference value
 * @param loggedin
 */
const remembered = (name: string, saved: string, loggedin: boolean): string => (loggedin && saved) || readLocal(name);

/**
 * The results view: the user's choice when they can switch, else the default.
 *
 * @param features
 * @param chosen the remembered choice, '' for none
 */
const resolveView = (features: Features, chosen: string): string =>
    (features.viewswitch && ['grid', 'list'].includes(chosen) ? chosen : features.defaultview);

/**
 * Parse the remembered open filter groups.
 *
 * @param json JSON object source => open
 */
const parseGroups = (json: string): Record<string, boolean> => {
    try {
        const parsed = JSON.parse(json);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
};

/**
 * The query without the quick filters and dates whose feature is off.
 *
 * @param query
 * @param quickfilters quick filters offered
 * @param daterange whether the start date filter is on
 */
const effectiveQuery = (query: CatalogQuery, quickfilters: string[], daterange: boolean): CatalogQuery => ({
    ...query,
    quick: query.quick.filter(key => quickfilters.includes(key)),
    startfrom: daterange ? query.startfrom : '',
    startto: daterange ? query.startto : '',
});

/**
 * Number of active filters (badge of the mobile filters button).
 *
 * @param query the effective query
 */
const countActive = (query: CatalogQuery): number =>
    Object.values(query.selected).reduce((sum, values) => sum + values.length, 0) + query.quick.length
    + [query.search, query.startfrom, query.startto].filter(Boolean).length;

interface CatalogFiltersProps {
    query: CatalogQuery;
    effective: CatalogQuery;
    data: CatalogResponse | null;
    features: Features;
    loggedin: boolean;
    quickicons: Record<string, string>;
    strings: Strings;
    bulk: BulkToggle | null;
    onBulk: (bulk: BulkToggle) => void;
    onUpdate: (changes: Partial<CatalogQuery>) => void;
    onToggle: (source: string, value: string) => void;
    groupsopen: Record<string, boolean>;
    onGroupOpen: (source: string, open: boolean) => void;
}

interface QuickFiltersZoneProps {
    features: Features;
    data: CatalogResponse | null;
    selected: string[];
    loggedin: boolean;
    quickicons: Record<string, string>;
    strings: Strings;
    onToggle: (key: string) => void;
}

/**
 * The quick filters. In edit mode they have their own wand (show, hide, reorder and rename them) and stay
 * even when all are hidden, so they can be shown again.
 */
function QuickFiltersZone({features, data, selected, loggedin, quickicons, strings, onToggle}: QuickFiltersZoneProps) {
    const editing = !!useEditZones();
    if (!features.quickfilters.length && !editing) {
        return null;
    }
    return (
        <EditZone zone="quickfilters" className="flexium-editzone--padded">
            {features.quickfilters.length > 0 ? (
                <QuickFilters keys={features.quickfilters} quick={data?.quick ?? []} selected={selected}
                    loggedin={loggedin} icons={quickicons} onToggle={onToggle} showcount={features.optioncounts}
                    strings={strings} labels={features.quicklabels} />
            ) : <p className="flexium-filtergroup__empty">{str(strings, 'catalog_noquickfilters')}</p>}
        </EditZone>
    );
}

/**
 * The filters: search, quick filters, start dates, expand / collapse all and the filter groups.
 */
function CatalogFilters({query, effective, data, features, loggedin, quickicons, strings, bulk, onBulk, onUpdate, onToggle,
        groupsopen, onGroupOpen}: CatalogFiltersProps) {
    // Which groups are open now: one button, "Collapse all" when they all are, else "Expand all".
    const [openstate, setOpenstate] = useState<Record<string, boolean>>({});
    const setOpenState = (source: string, open: boolean) => setOpenstate(current => ({...current, [source]: open}));
    const allopen = !!data?.groups.length && data.groups.every(group => openstate[group.source]);

    const clearGroup = (source: string) => {
        const selected = {...query.selected};
        delete selected[source];
        onUpdate({selected});
    };
    const toggleQuick = (key: string) => onUpdate({
        quick: query.quick.includes(key) ? query.quick.filter(item => item !== key) : [...query.quick, key],
    });

    return (
        <>
            <SearchBox value={query.search} onSearch={search => onUpdate({search})} strings={strings} />
            <QuickFiltersZone features={features} data={data} selected={effective.quick} loggedin={loggedin}
                quickicons={quickicons} strings={strings} onToggle={toggleQuick} />
            {features.daterange && (
                <DateRange from={query.startfrom} to={query.startto} strings={strings}
                    onChange={(startfrom, startto) => onUpdate({startfrom, startto})} />
            )}
            {features.expandall && !!data?.groups.length && (
                <div className="flexium-catalog__expandall">
                    <button type="button" className="btn btn-link btn-sm" onClick={() => onBulk({open: !allopen})}>
                        <i className={`fa fa-angles-${allopen ? 'up' : 'down'} me-1`} aria-hidden="true"></i>
                        {str(strings, allopen ? 'catalog_collapseall' : 'catalog_expandall')}
                    </button>
                </div>
            )}
            {data?.groups.map(group => (
                <FilterGroupPanel key={group.source} group={group} onToggle={onToggle} onClear={clearGroup} strings={strings}
                    bulk={bulk} features={features} onOpenChange={onGroupOpen} onOpenState={setOpenState}
                    savedopen={features.rememberopen ? groupsopen[group.source] : undefined} />
            ))}
        </>
    );
}

/**
 * Site administrators outside edit mode: edit mode lets them change every part of the catalogue. Closing it leaves a
 * small reminder that opens it again.
 */
function EditHint({strings}: {strings: Strings}) {
    const [collapsed, setCollapsed] = useState(() => readLocal('edithint') === 'hidden');
    const toggle = (next: boolean) => {
        writeLocal('edithint', next ? 'hidden' : '');
        setCollapsed(next);
    };
    if (collapsed) {
        return (
            <button type="button" className="flexium-edithint__pill" onClick={() => toggle(false)}>
                <i className="fa fa-wand-magic-sparkles me-2" aria-hidden="true"></i>
                {str(strings, 'catalog_edithint_title')}
            </button>
        );
    }
    return (
        <div className="alert alert-info flexium-edithint" role="note">
            <i className="fa fa-wand-magic-sparkles flexium-edithint__icon" aria-hidden="true"></i>
            <div>
                <strong>{str(strings, 'catalog_edithint_title')}</strong>
                <p className="mb-0">{str(strings, 'catalog_edithint')}</p>
            </div>
            <button type="button" className="btn-close" aria-label={str(strings, 'catalog_close')}
                onClick={() => toggle(true)}></button>
        </div>
    );
}

/**
 * Edit mode: the unsaved settings as JSON (a moment after the last change), so the catalogue is computed with them
 * and every change shows at once. '' when there is nothing unsaved.
 *
 * @param edit editor state
 */
const usePreview = (edit: ReturnType<typeof useCatalogEditor>): string => {
    const draft = edit.draft;
    const preview = draft && edit.dirty
        ? JSON.stringify({features: draft.features, card: draft.card, layout: draft.layout}) : '';
    const [debounced, setDebounced] = useState(preview);
    useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(preview), 350);
        return () => window.clearTimeout(timer);
    }, [preview]);
    return debounced;
};

/**
 * Badge look: the edit mode draft (live preview), else the saved one.
 *
 * @param edit editor state
 * @param saved saved badge look
 */
const badgeStyleOf = (edit: ReturnType<typeof useCatalogEditor>, saved: BadgeStyle): BadgeStyle => (edit.draft ? {
    colours: Object.fromEntries(edit.draft.card.badgecolours.map(item => [item.source, item.colour])),
    rows: edit.draft.card.badgerows,
} : saved);

/**
 * The shared state of the magic wands and their side panel, null outside edit mode.
 *
 * @param editor editor props
 * @param edit editor state (useCatalogEditor)
 * @param onFeatureChange
 * @param palette default header images
 * @param zones open zone and accordion section, with their setters
 */
const editZonesValue = (editor: EditorProps | null, edit: ReturnType<typeof useCatalogEditor>,
        onFeatureChange: (key: string, value: string) => void, palette: Record<string, string>,
        onImageUploaded: (url: string) => void,
        zones: Pick<EditZonesValue, 'active' | 'setActive' | 'focus' | 'setFocus'>): EditZonesValue | null =>
    (editor && edit.draft ? {
        editor,
        card: edit.draft.card,
        onCardChange: edit.setCard,
        options: edit.draft.options,
        onOptionsChange: edit.setOptions,
        features: edit.draft.features,
        onFeatureChange,
        palette,
        onImageUploaded,
        ...zones,
    } : null);

/**
 * Edit mode: wands on the page heading, the breadcrumbs and the filters button (rendered by Moodle, around the
 * catalogue), with a live preview of their options.
 */
interface HeaderZonesProps {
    features: Features;
    toggleicons: Record<string, string>;
    blockicons: Record<string, string>;
}

const POSITIONS = ['top', 'upper', 'middle', 'lower', 'bottom'];

/**
 * Show the colour, size and position chosen for a button opening a drawer.
 *
 * @param button the button
 * @param colour Bootstrap theme colour
 * @param size sm, md or lg
 * @param position key of POSITIONS
 */
const styleToggle = (button: HTMLElement, colour: string, size: string, position: string) => {
    button.style.setProperty('--flexium-toggle-bg', `var(--bs-${colour})`);
    button.classList.remove('flexium-filtertoggle--sm', 'flexium-filtertoggle--md', 'flexium-filtertoggle--lg');
    button.classList.add(`flexium-filtertoggle--${size}`);
    const holder = button.closest('.drawer-toggler');
    holder?.classList.remove(...POSITIONS.map(key => `flexium-togglepos--${key}`));
    holder?.classList.add(`flexium-togglepos--${position}`);
};

function HeaderZones({features, toggleicons, blockicons}: HeaderZonesProps) {
    useEffect(() => {
        const heading = document.querySelector<HTMLElement>('#page-header .page-context-header h1, #page-header h1');
        if (!heading) {
            return;
        }
        heading.dataset.flexiumText ??= heading.textContent ?? '';
        heading.textContent = features.pageheadingtext || heading.dataset.flexiumText;
        heading.closest('.page-context-header')?.classList.toggle('flexium-heading--off', !features.pageheading);
    }, [features.pageheading, features.pageheadingtext]);

    // Button opening the filters drawer: icon, colour, size and position.
    useEffect(() => {
        const button = document.querySelector<HTMLElement>('.drawer-left-toggle .flexium-filtertoggle');
        const icon = button?.querySelector('i');
        if (!button || !icon) {
            return;
        }
        icon.className = toggleicons[features.filtericon] ?? 'fa-solid fa-filter';
        styleToggle(button, features.filtericoncolour, features.filtericonsize, features.filtericonposition);
    }, [features.filtericon, features.filtericoncolour, features.filtericonsize, features.filtericonposition, toggleicons]);

    // Button opening the blocks drawer: Moodle's icon and grey unless others are chosen.
    useEffect(() => {
        const button = document.querySelector<HTMLElement>('.flexium-blocktoggle');
        const icon = button?.querySelector('.flexium-blocktoggle__icon');
        if (!button || !icon) {
            return;
        }
        const classes = blockicons[features.blockicon] ?? '';
        icon.className = `flexium-blocktoggle__icon ${classes}`;
        button.classList.toggle('flexium-blocktoggle--custom', classes !== '');
        button.classList.toggle('flexium-blocktoggle--plain', features.blockiconcolour === 'default');
        styleToggle(button, features.blockiconcolour, features.blockiconsize, features.blockiconposition);
    }, [features.blockicon, features.blockiconcolour, features.blockiconsize, features.blockiconposition, blockicons]);

    return (
        <>
            <ExternalZone zone="heading" selector="#page-header .page-context-header" />
            <ExternalZone zone="filtertoggle" selector=".drawer-left-toggle" />
            <ExternalZone zone="blocktoggle" selector=".drawer-right-toggle" />
            <ExternalZone zone="breadcrumbs" selector="#page-navbar .flexium-breadcrumbs" />
        </>
    );
}

interface BannerZoneProps {
    features: Features;
    palette: Record<string, string>;
    strings: Strings;
    editing: boolean;
}

/**
 * The catalogue header when it is on; in edit mode, a placeholder when it is off, so its wand can switch it on.
 */
function BannerZone({features, palette, strings, editing}: BannerZoneProps) {
    if (!features.banner && !editing) {
        return null;
    }
    return (
        <EditZone zone="banner" className="flexium-editzone--padded">
            {features.banner ? (
                <Banner title={features.bannertitle} text={features.bannertext} image={palette[features.bannerstyle] ?? ''}
                    strings={strings} />
            ) : (
                <div className="flexium-banner flexium-banner--off">{str(strings, 'catalog_bannertitle')}</div>
            )}
        </EditZone>
    );
}

interface FiltersContainerProps {
    /** Left drawer slot of the Flexium catalogue layout, null with other layouts. */
    drawer: HTMLElement | null;
    activecount: number;
    strings: Strings;
    children: ReactNode;
}

/**
 * Where the filters live: the layout's left drawer, or a sidebar that is a toggled panel on small screens.
 */
function FiltersContainer({drawer, activecount, strings, children}: FiltersContainerProps) {
    const [sidebaropen, setSidebaropen] = useState(false);
    if (drawer) {
        return createPortal(
            <div className="flexium-catalog__drawerfilters" role="region" aria-label={str(strings, 'catalog_filters')}>
                {children}
            </div>,
            drawer,
        );
    }
    return (
        <>
            <button type="button" className="btn btn-outline-secondary flexium-catalog__filtertoggle"
                aria-expanded={sidebaropen} onClick={() => setSidebaropen(!sidebaropen)}>
                <i className="fa fa-sliders me-2" aria-hidden="true"></i>
                {str(strings, 'catalog_togglefilters')}
                {activecount > 0 && <span className="badge rounded-pill text-bg-primary ms-2">{activecount}</span>}
            </button>

            <aside className={`flexium-catalog__sidebar${sidebaropen ? ' flexium-catalog__sidebar--open' : ''}`}
                aria-label={str(strings, 'catalog_filters')}>
                <div className="flexium-catalog__sidebarheader">
                    <h2 className="flexium-catalog__sidebartitle">{str(strings, 'catalog_filters')}</h2>
                    <button type="button" className="btn-close flexium-catalog__sidebarclose"
                        aria-label={str(strings, 'catalog_closefilters')} onClick={() => setSidebaropen(false)}></button>
                </div>
                {children}
            </aside>
        </>
    );
}

export default function Catalog({perpage: defaultperpage, userperpage, perpageoptions, initialcategory, sorts, strings,
        editor, features: savedfeatures, loggedin, savedgroups, savedview, palette, quickicons, canedit,
        badgestyle, toggleicons, blockicons}: CatalogProps) {
    const [query, setQuery] = useState<CatalogQuery>(() => readQueryFromUrl(initialcategory, savedfeatures.defaultsort));
    // Bumped after the editor saves, to reload the catalogue with the new layout.
    const [reload, setReload] = useState(0);
    const edit = useCatalogEditor(editor, () => setReload(count => count + 1));
    const [data, setData] = useState<CatalogResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [notice, setNotice] = useState('');
    // Last "Expand all" / "Collapse all" click: a new object each time, so repeating the same click applies again.
    const [bulk, setBulk] = useState<BulkToggle | null>(null);
    const [quickview, setQuickview] = useState<Course | null>(null);
    const [activezone, setActivezone] = useState('');
    // Default header images; the uploaded one ("custom") changes when an administrator uploads a new one.
    const [palettestate, setPalettestate] = useState(palette);
    const [focuszone, setFocuszone] = useState('');
    // Left drawer slot rendered by the Flexium catalogue layout (absent with other layouts or themes).
    const [drawer] = useState(() => document.getElementById('flexium-catalog-filters'));
    const requestid = useRef(0);
    const resultsref = useRef<HTMLDivElement>(null);

    // Features in effect: the edit mode draft (live preview) or the saved ones. Memoised: decoding creates new
    // arrays (e.g. quickfilters), and the catalogue request depends on them (a new array each render = a request loop).
    const draftfeatures = edit.draft?.features;
    const features = useMemo(
        () => (editor && draftfeatures ? decodeFeatures(draftfeatures, editor.featuredefs) : savedfeatures),
        [editor, draftfeatures, savedfeatures]);

    const [groupsopen, setGroupsopen] = useState<Record<string, boolean>>(
        () => parseGroups(remembered(PREF_GROUPS, savedgroups, loggedin)));
    const [chosenview, setChosenview] = useState(() => remembered(PREF_VIEW, savedview, loggedin));
    const view = resolveView(features, chosenview);

    const options = edit.draft?.options;
    const {allowuser, perpage} = resolvePerpage(options, userperpage, perpageoptions, query.perpage, defaultperpage);

    // Quick filters and dates only apply while their feature is on.
    const effective = useMemo<CatalogQuery>(() => effectiveQuery(query, features.quickfilters, features.daterange),
        [query, features.quickfilters, features.daterange]);

    const debouncedpreview = usePreview(edit);

    useEffect(() => {
        writeQueryToUrl(query, savedfeatures.defaultsort);
        const current = ++requestid.current;
        setLoading(true);
        getCatalog(effective, perpage, debouncedpreview)
            .then(response => {
                if (current !== requestid.current) {
                    return response; // A newer request superseded this one.
                }
                setData(response);
                setError(false);
                if (response.autoselected.length) {
                    // The search matched filter options: they are now ticked and the text is cleared.
                    setNotice(str(strings, 'catalog_searchmatched',
                        response.autoselected.map(option => option.label).join(', ')));
                    const selected: Selection = {};
                    response.selected.forEach(option => (selected[option.source] ??= []).push(option.value));
                    setQuery({...query, search: response.search, selected, page: 0});
                }
                return response;
            })
            .catch(() => {
                if (current === requestid.current) {
                    setError(true);
                }
            })
            .finally(() => {
                if (current === requestid.current) {
                    setLoading(false);
                }
            });
    }, [effective, perpage, strings, reload, debouncedpreview]);

    const update = (changes: Partial<CatalogQuery>, keepnotice = false) => {
        if (!keepnotice) {
            setNotice('');
        }
        setQuery({...query, page: 0, ...changes});
    };

    const toggle = (source: string, value: string) => update({selected: toggleValue(query.selected, source, value)});

    const changePage = (page: number) => {
        setQuery({...query, page});
        resultsref.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
    };

    const changeView = (next: string) => {
        setChosenview(next);
        remember(PREF_VIEW, next, loggedin);
    };

    const changeGroupOpen = (source: string, open: boolean) => {
        if (!features.rememberopen) {
            return;
        }
        const next = {...groupsopen, [source]: open};
        setGroupsopen(next);
        remember(PREF_GROUPS, JSON.stringify(next), loggedin);
    };

    const toggleFavourite = (course: Course) => {
        const flip = (favourite: boolean) => setData(current => current && {
            ...current,
            courses: current.courses.map(item => (item.id === course.id ? {...item, favourite} : item)),
        });
        flip(!course.favourite);
        setFavourite(course.id, !course.favourite).catch(() => flip(course.favourite));
    };

    const setFeature = (key: string, value: string) => {
        edit.setFeature(key, value);
        if (key === 'defaultsort') {
            update({sort: value}, true);
        }
    };

    const grouplabels = useMemo(() => {
        const labels: Record<string, string> = {};
        data?.groups.forEach(group => {
            labels[group.source] = group.label;
        });
        return labels;
    }, [data]);

    const total = data?.total ?? 0;
    const activecount = countActive(effective);

    const draftlayout = edit.draft?.layout;
    // Edit mode: the quick filters (with their wand) above the filter widgets.
    const filters = editor && draftlayout ? (
        <>
            <QuickFiltersZone features={features} data={data} selected={effective.quick} loggedin={loggedin}
                quickicons={quickicons} strings={strings} onToggle={key => update({
                    quick: query.quick.includes(key) ? query.quick.filter(item => item !== key) : [...query.quick, key],
                })} />
            <FilterWidgets editor={editor} layout={draftlayout} onChange={edit.setLayout} />
        </>
    ) : (
        <CatalogFilters query={query} effective={effective} data={data} features={features} loggedin={loggedin}
            quickicons={quickicons} strings={strings} bulk={bulk} onBulk={setBulk} onUpdate={update} onToggle={toggle}
            groupsopen={groupsopen} onGroupOpen={changeGroupOpen} />
    );

    // Edit mode: the magic wands and their side panel share the draft through a context.
    // A new default header image is stored at once: show it in the palette, select it and reload the preview.
    const imageUploaded = (url: string) => {
        setPalettestate(current => ({...current, custom: url}));
        setFeature('defaultimage', 'custom');
        setReload(count => count + 1);
    };
    const editzones = editZonesValue(editor, edit, setFeature, palettestate, imageUploaded,
        {active: activezone, setActive: setActivezone, focus: focuszone, setFocus: setFocuszone});

    const page = (
        <div className={`flexium-catalog${drawer ? ' flexium-catalog--indrawer' : ''}`
            + (activezone ? ' flexium-catalog--editing' : '')}>
            <FiltersContainer drawer={drawer} activecount={activecount} strings={strings}>{filters}</FiltersContainer>

            <div className="flexium-catalog__main" ref={resultsref}>
                {editzones ? (
                    <EditorPanel editor={editzones.editor} dirty={edit.dirty} status={edit.status} onSave={edit.save}
                        onReset={edit.reset} onAllSettings={() => setActivezone('all')} />
                ) : canedit && <EditHint strings={strings} />}

                {editzones && <HeaderZones features={features} toggleicons={toggleicons} blockicons={blockicons} />}
                <BannerZone features={features} palette={palettestate} strings={strings} editing={!!editzones} />

                <ActiveFilters
                    search={query.search}
                    selected={data?.selected ?? []}
                    grouplabels={grouplabels}
                    onRemoveSearch={() => update({search: ''})}
                    onRemove={toggle}
                    onClearAll={() => update({search: '', selected: {}, quick: [], startfrom: '', startto: ''})}
                    strings={strings}
                />

                {notice && (
                    <div className="alert alert-info flexium-catalog__notice" role="status">{notice}</div>
                )}

                <EditZone zone="toolbar" className="flexium-editzone--padded">
                    <ResultsToolbar total={data ? total : null} features={features} view={view} onViewChange={changeView}
                        sort={query.sort} sorts={sorts} onSortChange={sort => update({sort}, true)} strings={strings} />
                </EditZone>

                {error && <div className="alert alert-danger" role="alert">{str(strings, 'catalog_error')}</div>}

                <Results data={data} loading={loading} error={error} strings={strings} features={features} view={view}
                    loggedin={loggedin} onFavourite={toggleFavourite} onQuickView={setQuickview} editing={!!editzones}
                    badgestyle={badgeStyleOf(edit, badgestyle)} />

                {data && (
                    <CatalogFooter
                        total={total}
                        page={data.page}
                        perpage={data.perpage}
                        perpageoptions={perpageoptions}
                        showperpage={allowuser}
                        onPageChange={changePage}
                        onPerpageChange={next => update({perpage: next === defaultperpage ? 0 : next}, true)}
                        strings={strings}
                        editoptions={editor ? options : undefined}
                        onEditOptions={editor ? edit.setOptions : undefined}
                        editorstrings={editor?.strings}
                    />
                )}
            </div>

            {features.quickview && <QuickView course={quickview} onClose={() => setQuickview(null)} strings={strings}
                variant={features.quickviewstyle} />}
            <EditSidePanel />
        </div>
    );
    return editzones ? <EditZonesProvider value={editzones}>{page}</EditZonesProvider> : page;
}
