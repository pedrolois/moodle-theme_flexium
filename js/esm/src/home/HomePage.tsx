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
 * Flexium home page: a list of sections (hero, course carousels, categories, figures...).
 *
 * Site administrators with edit mode on build it in place: a magic wand on each section opens its settings in a side
 * panel (the rest of the page is shaded), arrows move sections, + adds new ones, and ten templates give a start.
 *
 * Mounted by theme_flexium\output\core\course_renderer::frontpage().
 *
 * @module     theme_flexium/home/HomePage
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {useEffect, useId, useState, type ReactNode} from 'react';
import {Spotlight} from '@moodle/lms/theme_flexium/catalog/EditZones';
import {warnOnLeave} from '@moodle/lms/theme_flexium/catalog/useCatalogEditor';
import SchemaForm from '@moodle/lms/theme_flexium/home/SchemaForm';
import SectionView, {str} from '@moodle/lms/theme_flexium/home/Sections';
import {getHomeData, saveHomePage} from './repository';
import type {HomeData, HomeEditorProps, HomePageProps, Page, Section, Settings, Strings} from './types';

/** What the side panel shows: a section's settings, the sections to add, or the templates. */
type Panel = {kind: 'section'; id: string} | {kind: 'add'; index: number} | {kind: 'templates'} | null;

type Status = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Classes of a block of a template miniature.
 *
 * @param type section type
 */
const blockClass = (type: string): string => `flexium-hometemplate__block flexium-hometemplate__block--${type}`;

/**
 * Style of a block of a template miniature: the hero and the call to action in the template colours.
 *
 * @param type section type
 * @param image header image of the template
 */
const blockStyle = (type: string, image: string) =>
    (type === 'hero' || type === 'cta' ? {backgroundImage: `url("${image}")`} : undefined);

/**
 * A new section id.
 */
const newId = (): string => `s${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

/**
 * Settings of a new section: those of the first template that has one, so it starts with example content.
 *
 * @param editor
 * @param type
 */
const defaultSettings = (editor: HomeEditorProps, type: string): Settings => {
    for (const template of editor.templates) {
        const section = template.sections.find(item => item.type === type);
        if (section) {
            return JSON.parse(JSON.stringify(section.settings)) as Settings;
        }
    }
    const settings: Settings = {};
    const blank = (key: string) => (key === 'title' ? str(editor.strings, `home_type_${type}`) : '');
    (editor.schema[type] ?? []).forEach(field => {
        if (field.type === 'bool') {
            settings[field.key] = false;
        } else if (field.type === 'items' || field.type === 'checklist') {
            settings[field.key] = [];
        } else {
            settings[field.key] = field.choices[0]?.key ?? blank(field.key);
        }
    });
    return settings;
};

/**
 * Site administrators outside edit mode: how to build the page. Closing it leaves a small reminder.
 */
function EditHint({strings}: {strings: Strings}) {
    const [collapsed, setCollapsed] = useState(() => {
        try {
            return window.localStorage.getItem('theme_flexium_homehint') === 'hidden';
        } catch {
            return false;
        }
    });
    const toggle = (next: boolean) => {
        try {
            window.localStorage.setItem('theme_flexium_homehint', next ? 'hidden' : '');
        } catch {
            // Not remembered.
        }
        setCollapsed(next);
    };
    if (collapsed) {
        return (
            <button type="button" className="flexium-edithint__pill" onClick={() => toggle(false)}>
                <i className="fa fa-wand-magic-sparkles me-2" aria-hidden="true"></i>{str(strings, 'home_edithint_title')}
            </button>
        );
    }
    return (
        <div className="alert alert-info flexium-edithint" role="note">
            <i className="fa fa-wand-magic-sparkles flexium-edithint__icon" aria-hidden="true"></i>
            <div>
                <strong>{str(strings, 'home_edithint_title')}</strong>
                <p className="mb-0">{str(strings, 'home_edithint')}</p>
            </div>
            <button type="button" className="btn-close" aria-label={str(strings, 'catalog_close') || 'Close'}
                onClick={() => toggle(true)}></button>
        </div>
    );
}

interface SectionFrameProps {
    section: Section;
    index: number;
    count: number;
    active: boolean;
    strings: Strings;
    onSettings: () => void;
    onMove: (direction: number) => void;
    onDuplicate: () => void;
    onDelete: () => void;
    children: ReactNode;
}

/**
 * Edit mode: a section with its magic wand (settings) and its tools (move, duplicate, delete).
 */
function SectionFrame({section, index, count, active, strings, onSettings, onMove, onDuplicate, onDelete,
        children}: SectionFrameProps) {
    const name = str(strings, `home_type_${section.type}`);
    return (
        <div className={`flexium-homeframe flexium-editzone${active ? ' flexium-editzone--active' : ''}`}
            data-section={section.type}>
            <div className="flexium-homeframe__bar">
                <span className="flexium-homeframe__name">{name}</span>
                <button type="button" className="flexium-homeframe__btn flexium-homeframe__btn--wand" data-action="settings"
                    aria-expanded={active}
                    title={str(strings, 'editor_wand', name)} aria-label={str(strings, 'editor_wand', name)} onClick={onSettings}>
                    <i className="fa fa-wand-magic-sparkles" aria-hidden="true"></i>
                </button>
                <button type="button" className="flexium-homeframe__btn" data-action="moveup" disabled={index === 0}
                    onClick={() => onMove(-1)}
                    title={str(strings, 'home_moveup')} aria-label={str(strings, 'home_moveup')}>
                    <i className="fa fa-arrow-up" aria-hidden="true"></i>
                </button>
                <button type="button" className="flexium-homeframe__btn" data-action="movedown" disabled={index === count - 1}
                    onClick={() => onMove(1)} title={str(strings, 'home_movedown')} aria-label={str(strings, 'home_movedown')}>
                    <i className="fa fa-arrow-down" aria-hidden="true"></i>
                </button>
                <button type="button" className="flexium-homeframe__btn" data-action="duplicate" onClick={onDuplicate}
                    title={str(strings, 'home_duplicate')} aria-label={str(strings, 'home_duplicate')}>
                    <i className="fa fa-clone" aria-hidden="true"></i>
                </button>
                <button type="button" className="flexium-homeframe__btn flexium-homeframe__btn--delete" data-action="delete"
                    onClick={onDelete}
                    title={str(strings, 'home_delete')} aria-label={str(strings, 'home_delete')}>
                    <i className="fa fa-trash-can" aria-hidden="true"></i>
                </button>
            </div>
            {children}
        </div>
    );
}

/**
 * Edit mode: "+" between sections, to add one there.
 */
function Inserter({strings, onClick, active}: {strings: Strings; onClick: () => void; active: boolean}) {
    return (
        <div className={`flexium-homeinserter${active ? ' is-active' : ''}`}>
            <button type="button" className="flexium-homeinserter__btn" data-action="add" onClick={onClick}
                title={str(strings, 'home_addsection')} aria-label={str(strings, 'home_addsection')}>
                <i className="fa fa-plus" aria-hidden="true"></i>
            </button>
        </div>
    );
}

interface EditBarProps {
    strings: Strings;
    dirty: boolean;
    status: Status;
    onTemplates: () => void;
    onSave: () => void;
    onReset: () => void;
}

/**
 * Edit mode bar: how to edit, templates, and Save / Discard.
 */
function EditBar({strings, dirty, status, onTemplates, onSave, onReset}: EditBarProps) {
    return (
        <section className="flexium-editor flexium-homeeditor">
            <div className="flexium-editor__header">
                <div>
                    <h2 className="flexium-editor__title">
                        <i className="fa fa-pen-to-square me-2" aria-hidden="true"></i>{str(strings, 'home_editor_title')}
                    </h2>
                    <p className="flexium-editor__help">{str(strings, 'home_editor_help')}</p>
                </div>
                <div className="flexium-editor__actions">
                    <span className="flexium-editor__status" role="status">
                        {status === 'saving' && str(strings, 'editor_saving')}
                        {status === 'saved' && !dirty && str(strings, 'editor_saved')}
                        {status === 'error' && str(strings, 'editor_error')}
                        {status !== 'saving' && dirty && str(strings, 'editor_unsaved')}
                    </span>
                    <button type="button" className="btn btn-outline-primary" data-action="templates" onClick={onTemplates}>
                        <i className="fa fa-swatchbook me-2" aria-hidden="true"></i>{str(strings, 'home_templates')}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" data-action="discard"
                        disabled={!dirty || status === 'saving'} onClick={onReset}>{str(strings, 'editor_reset')}</button>
                    <button type="button" className="btn btn-primary" data-action="save"
                        disabled={!dirty || status === 'saving'} onClick={onSave}>{str(strings, 'editor_save')}</button>
                </div>
            </div>
        </section>
    );
}

interface SidePanelProps {
    panel: Panel;
    page: Page;
    editor: HomeEditorProps;
    palette: Record<string, string>;
    data: HomeData | null;
    onClose: () => void;
    onSettings: (id: string, settings: Settings) => void;
    onAdd: (index: number, type: string) => void;
    onTemplate: (key: string) => void;
}

/**
 * Side panel: settings of a section, sections to add, or templates.
 */
function SidePanel({panel, page, editor, palette, data, onClose, onSettings, onAdd, onTemplate}: SidePanelProps) {
    const id = useId();
    const strings = editor.strings;

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    if (!panel) {
        return null;
    }
    const section = panel.kind === 'section' ? page.sections.find(item => item.id === panel.id) : undefined;
    let title = str(strings, 'home_templates');
    if (panel.kind === 'add') {
        title = str(strings, 'home_addsection');
    } else if (section) {
        title = str(strings, `home_type_${section.type}`);
    }

    return (
        <aside className="flexium-editpanel" aria-labelledby={`${id}-title`}>
            <div className="flexium-editpanel__header">
                <h2 id={`${id}-title`} className="flexium-editpanel__title">
                    <i className="fa fa-wand-magic-sparkles me-2" aria-hidden="true"></i>{title}
                </h2>
                <button type="button" className="btn-close" aria-label={str(strings, 'editor_closepanel')}
                    onClick={onClose}></button>
            </div>
            <div className="flexium-editpanel__body">
                {section && (
                    <>
                        <p className="flexium-feature__help mb-3">{str(strings, `home_type_${section.type}_desc`)}</p>
                        <SchemaForm fields={editor.schema[section.type] ?? []} settings={section.settings} strings={strings}
                            palette={palette} icons={editor.icons} data={data}
                            onChange={settings => onSettings(section.id, settings)} />
                    </>
                )}
                {panel.kind === 'add' && (
                    <>
                        <p className="flexium-feature__help mb-3">{str(strings, 'home_addsection_help')}</p>
                        <ul className="flexium-homepicker">
                            {editor.types.map(type => (
                                <li key={type}>
                                    <button type="button" className="flexium-homepicker__item" data-type={type}
                                        onClick={() => onAdd(panel.index, type)}>
                                        <strong>{str(strings, `home_type_${type}`)}</strong>
                                        <span>{str(strings, `home_type_${type}_desc`)}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
                {panel.kind === 'templates' && (
                    <>
                        <p className="flexium-feature__help mb-3">{str(strings, 'home_templates_help')}</p>
                        <ul className="flexium-hometemplates">
                            {editor.templates.map(template => (
                                <li key={template.key}>
                                    <button type="button" className={`flexium-hometemplate${page.template === template.key
                                        ? ' is-current' : ''}`} onClick={() => onTemplate(template.key)}>
                                        {/* Miniature: one bar per section, the hero in the template colours. */}
                                        <span className="flexium-hometemplate__preview" aria-hidden="true">
                                            {template.sections.map(item => (
                                                <span key={item.id} className={blockClass(item.type)}
                                                    style={blockStyle(item.type, palette[template.palette])}></span>
                                            ))}
                                        </span>
                                        <strong>
                                            {template.name}
                                            {page.template === template.key && (
                                                <span className="badge text-bg-primary ms-2">{str(strings, 'home_current')}</span>
                                            )}
                                        </strong>
                                        <span>{template.description}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </aside>
    );
}

export default function HomePage({page: savedpage, sitecontent, sitename, palette, catalogurl, loggedin, strings, editor,
        canedit}: HomePageProps) {
    const [saved, setSaved] = useState<Page>(savedpage);
    const [page, setPage] = useState<Page>(savedpage);
    const [data, setData] = useState<HomeData | null>(null);
    const [panel, setPanel] = useState<Panel>(null);
    const [status, setStatus] = useState<Status>('idle');
    const dirty = JSON.stringify(page) !== JSON.stringify(saved);
    const allstrings = editor ? {...strings, ...editor.strings} : strings;

    useEffect(() => warnOnLeave(dirty, editor?.strings.editor_leaveunsaved ?? ''), [dirty, editor]);

    useEffect(() => {
        getHomeData().then(setData).catch(() => setData({categories: [], stats: {}, news: []}));
    }, []);

    const setSections = (sections: Section[]) => setPage({...page, sections});
    const move = (index: number, direction: number) => {
        const sections = [...page.sections];
        [sections[index], sections[index + direction]] = [sections[index + direction], sections[index]];
        setSections(sections);
    };
    const duplicate = (index: number) => {
        const copy = {...page.sections[index], id: newId(), settings: JSON.parse(JSON.stringify(page.sections[index].settings))};
        setSections([...page.sections.slice(0, index + 1), copy, ...page.sections.slice(index + 1)]);
    };
    const remove = (index: number) => {
        // eslint-disable-next-line no-alert
        if (window.confirm(str(allstrings, 'home_delete_confirm'))) {
            setSections(page.sections.filter((_, position) => position !== index));
            setPanel(null);
        }
    };
    const add = (index: number, type: string) => {
        if (!editor) {
            return;
        }
        const section = {id: newId(), type, settings: defaultSettings(editor, type)};
        setSections([...page.sections.slice(0, index), section, ...page.sections.slice(index)]);
        setPanel({kind: 'section', id: section.id});
    };
    const useTemplate = (key: string) => {
        const template = editor?.templates.find(item => item.key === key);
        // eslint-disable-next-line no-alert
        if (template && window.confirm(str(allstrings, 'home_usetemplate_confirm', template.name))) {
            setPage({template: key, sections: JSON.parse(JSON.stringify(template.sections)) as Section[]});
        }
    };
    const save = () => {
        setStatus('saving');
        saveHomePage(page)
            .then(result => {
                setSaved(result);
                setPage(result);
                setStatus('saved');
                return result;
            })
            .catch(() => setStatus('error'));
    };

    const context = {data, strings: allstrings, palette, catalogurl, loggedin, sitecontent, sitename};
    const activeid = panel?.kind === 'section' ? panel.id : '';

    return (
        <div className={`flexium-home${panel ? ' flexium-catalog--editing' : ''}`}>
            {canedit && <EditHint strings={strings} />}
            {editor && (
                <EditBar strings={allstrings} dirty={dirty} status={status} onTemplates={() => setPanel({kind: 'templates'})}
                    onSave={save} onReset={() => {
                        setPage(saved);
                        setStatus('idle');
                    }} />
            )}
            {editor && page.sections.length === 0 && <p className="flexium-home__muted">{str(allstrings, 'home_empty')}</p>}
            {page.sections.map((section, index) => (
                <div key={section.id} className="flexium-home__section">
                    {editor && (
                        <Inserter strings={allstrings} onClick={() => setPanel({kind: 'add', index})}
                            active={panel?.kind === 'add' && panel.index === index} />
                    )}
                    {editor ? (
                        <SectionFrame section={section} index={index} count={page.sections.length}
                            active={activeid === section.id} strings={allstrings}
                            onSettings={() => setPanel(activeid === section.id ? null : {kind: 'section', id: section.id})}
                            onMove={direction => move(index, direction)} onDuplicate={() => duplicate(index)}
                            onDelete={() => remove(index)}>
                            <SectionView section={section} context={context} />
                        </SectionFrame>
                    ) : <SectionView section={section} context={context} />}
                </div>
            ))}
            {editor && (
                <Inserter strings={allstrings} onClick={() => setPanel({kind: 'add', index: page.sections.length})}
                    active={panel?.kind === 'add' && panel.index === page.sections.length} />
            )}
            {editor && (
                <>
                    {activeid && <Spotlight zone={activeid} />}
                    <SidePanel panel={panel} page={page} editor={editor} palette={palette} data={data}
                        onClose={() => setPanel(null)} onAdd={add} onTemplate={useTemplate}
                        onSettings={(id, settings) => setSections(page.sections.map(item =>
                            (item.id === id ? {...item, settings} : item)))} />
                </>
            )}
        </div>
    );
}
