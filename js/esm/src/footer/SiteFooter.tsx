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
 * Flexium site footer: columns of blocks (logo, text, links, contact, social networks, legal links, support, user
 * tour reset, copyright) and a bottom bar.
 *
 * Site administrators with edit mode on build it in place: blocks are dragged between columns and the bottom bar (or
 * moved with the arrows), a magic wand on each block opens its settings, another one the footer's own look.
 *
 * Mounted by theme_flexium\output\core_renderer::flexium_footer().
 *
 * @module     theme_flexium/footer/SiteFooter
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {useEffect, useId, useState, type CSSProperties, type DragEvent, type ReactNode} from 'react';
import {fetchOne} from '@moodle/lms/core/ajax';
import {Spotlight} from '@moodle/lms/theme_flexium/catalog/EditZones';
import {warnOnLeave} from '@moodle/lms/theme_flexium/catalog/useCatalogEditor';
import BlockView, {isEmptyBlock, str, type FooterData} from '@moodle/lms/theme_flexium/footer/Blocks';
import SchemaForm from '@moodle/lms/theme_flexium/home/SchemaForm';
import type {Field, Section as Block, Settings, Strings} from '../home/types';

interface Layout {
    style: Settings;
    columns: {id: string; blocks: Block[]}[];
    bottom: Block[];
}

interface FooterEditorProps {
    schema: {style: Field[]; blocks: Record<string, Field[]>};
    types: string[];
}

interface SiteFooterProps {
    layout: Layout;
    data: FooterData;
    networks: Record<string, string>;
    palette: Record<string, string>;
    strings: Strings;
    editor: FooterEditorProps | null;
}

/** Container key: a column id, or 'bottom' for the bottom bar. */
type Target = string;

type Panel = {kind: 'block'; id: string} | {kind: 'add'; target: Target} | {kind: 'style'} | null;

/** Drag payload type, so drops of unrelated content are ignored. */
const DRAG_TYPE = 'application/x-flexium-footer-block';

/** Strings of the move buttons. */
const MOVE_LABELS = {up: 'home_moveup', down: 'home_movedown', left: 'footer_moveleft', right: 'footer_moveright'};

/**
 * Settings of a new block: empty texts and lists, every choice of a checklist, the first choice of a select.
 *
 * @param fields
 */
const blankSettings = (fields: Field[]): Settings => {
    const settings: Settings = {};
    fields.forEach(field => {
        if (field.type === 'bool') {
            settings[field.key] = false;
        } else if (field.type === 'items') {
            settings[field.key] = [];
        } else if (field.type === 'checklist') {
            settings[field.key] = field.choices.map(choice => choice.key);
        } else {
            settings[field.key] = field.choices[0]?.key ?? '';
        }
    });
    return settings;
};

const newId = (prefix: string): string => `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

/**
 * The blocks of a container.
 *
 * @param layout
 * @param target column id or 'bottom'
 */
const blocksOf = (layout: Layout, target: Target): Block[] =>
    (target === 'bottom' ? layout.bottom : layout.columns.find(column => column.id === target)?.blocks ?? []);

/**
 * A copy of the layout with the blocks of a container replaced.
 *
 * @param layout
 * @param target
 * @param blocks
 */
const withBlocks = (layout: Layout, target: Target, blocks: Block[]): Layout => (target === 'bottom'
    ? {...layout, bottom: blocks}
    : {...layout, columns: layout.columns.map(column => (column.id === target ? {...column, blocks} : column))});

/**
 * Where a block is: its container and position.
 *
 * @param layout
 * @param id block id
 */
const locate = (layout: Layout, id: string): {target: Target; index: number} | null => {
    for (const target of [...layout.columns.map(column => column.id), 'bottom']) {
        const index = blocksOf(layout, target).findIndex(block => block.id === id);
        if (index >= 0) {
            return {target, index};
        }
    }
    return null;
};

/**
 * Move a block to a container, before the block now at `index` (blocks length: at the end).
 *
 * @param layout
 * @param id
 * @param target
 * @param index
 */
const moveBlock = (layout: Layout, id: string, target: Target, index: number): Layout => {
    const from = locate(layout, id);
    if (!from) {
        return layout;
    }
    const block = blocksOf(layout, from.target)[from.index];
    let next = withBlocks(layout, from.target, blocksOf(layout, from.target).filter(item => item.id !== id));
    const position = from.target === target && from.index < index ? index - 1 : index;
    const blocks = [...blocksOf(next, target)];
    blocks.splice(Math.max(0, Math.min(position, blocks.length)), 0, block);
    next = withBlocks(next, target, blocks);
    return next;
};

/**
 * Background of the footer.
 *
 * @param style footer settings
 * @param palette default header images
 */
const backgroundOf = (style: Settings, palette: Record<string, string>) => {
    const background = String(style.background || 'dark');
    return {
        className: `flexium-footer--${background === 'light' ? 'light' : 'dark'} flexium-footer--bg-${background}`,
        style: background === 'palette' ? {backgroundImage: `url("${palette[String(style.palette || '1')]}")`} : undefined,
    };
};

interface BlockFrameProps {
    block: Block;
    active: boolean;
    strings: Strings;
    dropbefore: boolean;
    onWand: () => void;
    onDelete: () => void;
    onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
    onDragStart: (event: DragEvent) => void;
    onDragEnd: () => void;
    onDragOver: (event: DragEvent) => void;
    children: ReactNode;
}

/**
 * Edit mode: a block with its drag handle, magic wand and tools.
 */
function BlockFrame({block, active, strings, dropbefore, onWand, onDelete, onMove, onDragStart, onDragEnd, onDragOver,
        children}: BlockFrameProps) {
    const name = str(strings, `footer_type_${block.type}`);
    return (
        <div className={`flexium-footerblock flexium-editzone${active ? ' flexium-editzone--active' : ''}`
            + (dropbefore ? ' flexium-footerblock--dropbefore' : '')}
        draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver} data-block={block.type}>
            <div className="flexium-footerblock__bar">
                <span className="flexium-footerblock__handle" title={str(strings, 'footer_drag', name)} aria-hidden="true">
                    <i className="fa fa-grip-vertical"></i>
                </span>
                <span className="flexium-footerblock__name" title={name}>{name}</span>
                <button type="button" className="flexium-homeframe__btn flexium-homeframe__btn--wand" data-action="settings"
                    onClick={onWand}
                    aria-expanded={active} aria-label={str(strings, 'editor_wand', name)} title={str(strings, 'editor_wand', name)}>
                    <i className="fa fa-wand-magic-sparkles" aria-hidden="true"></i>
                </button>
                {(['up', 'down', 'left', 'right'] as const).map(direction => (
                    <button key={direction} type="button" className="flexium-homeframe__btn" data-action={`move${direction}`}
                        onClick={() => onMove(direction)}
                        aria-label={str(strings, MOVE_LABELS[direction])} title={str(strings, MOVE_LABELS[direction])}>
                        <i className={`fa fa-arrow-${direction}`} aria-hidden="true"></i>
                    </button>
                ))}
                <button type="button" className="flexium-homeframe__btn flexium-homeframe__btn--delete" data-action="delete"
                    onClick={onDelete}
                    aria-label={str(strings, 'footer_deleteblock')} title={str(strings, 'footer_deleteblock')}>
                    <i className="fa fa-trash-can" aria-hidden="true"></i>
                </button>
            </div>
            {children}
        </div>
    );
}

interface FooterEditBarProps {
    strings: Strings;
    status: string;
    dirty: boolean;
    canaddcolumn: boolean;
    onStyle: () => void;
    onAddColumn: () => void;
    onReset: () => void;
    onSave: () => void;
}

/**
 * Edit mode bar of the footer: its own magic wand (look), add a column, Discard / Save.
 */
function FooterEditBar({strings, status, dirty, canaddcolumn, onStyle, onAddColumn, onReset, onSave}: FooterEditBarProps) {
    const style = str(strings, 'footer_style');
    return (
        <div className="flexium-footer__editbar">
            <span className="flexium-footer__edittitle">
                <i className="fa fa-pen-to-square me-2" aria-hidden="true"></i>{str(strings, 'footer_editor_title')}
            </span>
            <span className="flexium-footer__edithelp">{str(strings, 'footer_editor_help')}</span>
            <span className="flexium-editor__status" role="status">
                {status === 'saving' && str(strings, 'editor_saving')}
                {status === 'saved' && !dirty && str(strings, 'editor_saved')}
                {status === 'error' && str(strings, 'editor_error')}
                {status !== 'saving' && dirty && str(strings, 'editor_unsaved')}
            </span>
            <button type="button" className="flexium-homeframe__btn flexium-homeframe__btn--wand" data-action="style"
                onClick={onStyle} aria-label={str(strings, 'editor_wand', style)} title={str(strings, 'editor_wand', style)}>
                <i className="fa fa-wand-magic-sparkles" aria-hidden="true"></i>
            </button>
            <button type="button" className="btn btn-sm btn-outline-light" data-action="addcolumn" onClick={onAddColumn}
                disabled={!canaddcolumn}>
                <i className="fa fa-table-columns me-1" aria-hidden="true"></i>{str(strings, 'footer_addcolumn')}
            </button>
            <button type="button" className="btn btn-sm btn-outline-light" data-action="discard"
                disabled={!dirty || status === 'saving'} onClick={onReset}>{str(strings, 'editor_reset')}</button>
            <button type="button" className="btn btn-sm btn-light" data-action="save"
                disabled={!dirty || status === 'saving'} onClick={onSave}>{str(strings, 'editor_save')}</button>
        </div>
    );
}

interface FooterPanelProps {
    panel: Exclude<Panel, null>;
    layout: Layout;
    editor: FooterEditorProps;
    strings: Strings;
    palette: Record<string, string>;
    onClose: () => void;
    onChange: (layout: Layout) => void;
    onAdd: (target: Target, type: string) => void;
}

/**
 * Side panel of the footer: its look, the settings of a block, or the blocks to add.
 */
function FooterPanel({panel, layout, editor, strings, palette, onClose, onChange, onAdd}: FooterPanelProps) {
    const id = useId();
    const panelblock = panel.kind === 'block' ? locate(layout, panel.id) : null;
    const block = panelblock ? blocksOf(layout, panelblock.target)[panelblock.index] : null;
    let paneltitle = str(strings, 'footer_style');
    if (panel.kind === 'add') {
        paneltitle = str(strings, 'footer_addblock');
    } else if (block) {
        paneltitle = str(strings, `footer_type_${block.type}`);
    }
    const setLayout = onChange;
    const setPanel = (value: null) => value === null && onClose();
    const add = onAdd;
    return (
                    <aside className="flexium-editpanel flexium-footerpanel" aria-labelledby={`${id}-title`}>
                        <div className="flexium-editpanel__header">
                            <h2 id={`${id}-title`} className="flexium-editpanel__title">
                                <i className="fa fa-wand-magic-sparkles me-2" aria-hidden="true"></i>{paneltitle}
                            </h2>
                            <button type="button" className="btn-close" aria-label={str(strings, 'editor_closepanel')}
                                onClick={() => setPanel(null)}></button>
                        </div>
                        <div className="flexium-editpanel__body">
                            {panel.kind === 'style' && (
                                <SchemaForm fields={editor.schema.style} settings={layout.style} strings={strings} palette={palette}
                                    icons={{}} data={null} onChange={style => setLayout({...layout, style})} />
                            )}
                            {block && panelblock && (
                                <>
                                    <p className="flexium-feature__help mb-3">
                                        {str(strings, `footer_type_${block.type}_desc`)}
                                    </p>
                                    <SchemaForm fields={editor.schema.blocks[block.type] ?? []} settings={block.settings}
                                        strings={strings} palette={palette} icons={{}} data={null}
                                        onChange={settings => setLayout(withBlocks(layout, panelblock.target,
                                            blocksOf(layout, panelblock.target).map(item =>
                                                (item.id === block.id ? {...item, settings} : item))))} />
                                </>
                            )}
                            {panel.kind === 'add' && (
                                <ul className="flexium-homepicker">
                                    {editor.types.map(type => (
                                        <li key={type}>
                                            <button type="button" className="flexium-homepicker__item" data-type={type}
                                                onClick={() => add(panel.target, type)}>
                                                <strong>{str(strings, `footer_type_${type}`)}</strong>
                                                <span>{str(strings, `footer_type_${type}_desc`)}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </aside>
    );
}

export default function SiteFooter({layout: savedlayout, data, networks, palette, strings, editor}: SiteFooterProps) {
    const id = useId();
    const [saved, setSaved] = useState<Layout>(savedlayout);
    const [layout, setLayout] = useState<Layout>(savedlayout);
    const [panel, setPanel] = useState<Panel>(null);
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [dragging, setDragging] = useState<string | null>(null);
    const [drop, setDrop] = useState<{target: Target; index: number} | null>(null);
    const dirty = JSON.stringify(layout) !== JSON.stringify(saved);
    const editing = !!editor;
    const context = {data, networks, strings, editing};

    useEffect(() => warnOnLeave(dirty, strings.editor_leaveunsaved ?? ''), [dirty, strings]);

    // Boost's "?" button with Moodle's own footer links: shown or hidden with the footer setting.
    useEffect(() => {
        document.body.classList.toggle('flexium-nomoodlefooter', layout.style.moodlebutton === false);
    }, [layout.style.moodlebutton]);

    const background = backgroundOf(layout.style, palette);
    const activeid = panel?.kind === 'block' ? panel.id : '';

    const move = (blockid: string, direction: 'up' | 'down' | 'left' | 'right') => {
        const from = locate(layout, blockid);
        if (!from) {
            return;
        }
        const targets = [...layout.columns.map(column => column.id), 'bottom'];
        const position = targets.indexOf(from.target);
        if (direction === 'up' || direction === 'down') {
            const index = from.index + (direction === 'up' ? -1 : 2);
            setLayout(moveBlock(layout, blockid, from.target, Math.max(0, index)));
        } else {
            const target = targets[position + (direction === 'left' ? -1 : 1)];
            if (target) {
                setLayout(moveBlock(layout, blockid, target, blocksOf(layout, target).length));
            }
        }
    };

    const remove = (blockid: string) => {
        const from = locate(layout, blockid);
        // eslint-disable-next-line no-alert
        if (from && window.confirm(str(strings, 'footer_deleteblock_confirm'))) {
            setLayout(withBlocks(layout, from.target, blocksOf(layout, from.target).filter(block => block.id !== blockid)));
            setPanel(null);
        }
    };

    const add = (target: Target, type: string) => {
        const block: Block = {id: newId('b'), type, settings: blankSettings(editor?.schema.blocks[type] ?? [])};
        setLayout(withBlocks(layout, target, [...blocksOf(layout, target), block]));
        setPanel({kind: 'block', id: block.id});
    };

    const save = () => {
        setStatus('saving');
        fetchOne<string>({methodname: 'theme_flexium_save_footer', args: {footer: JSON.stringify(layout)}})
            .then(result => {
                const next = JSON.parse(result) as Layout;
                setSaved(next);
                setLayout(next);
                setStatus('saved');
                return next;
            })
            .catch(() => setStatus('error'));
    };

    // Drag and drop: over a block = before or after it (by the pointer position); over an empty place = at the end.
    const overBlock = (event: DragEvent, target: Target, index: number) => {
        if (!dragging || !event.dataTransfer.types.includes(DRAG_TYPE)) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const after = target === 'bottom' ? event.clientX > rect.left + rect.width / 2 : event.clientY > rect.top + rect.height / 2;
        setDrop({target, index: after ? index + 1 : index});
    };
    const overContainer = (event: DragEvent, target: Target) => {
        if (!dragging || !event.dataTransfer.types.includes(DRAG_TYPE)) {
            return;
        }
        event.preventDefault();
        if (!drop || drop.target !== target) {
            setDrop({target, index: blocksOf(layout, target).length});
        }
    };
    const dropHere = (event: DragEvent) => {
        event.preventDefault();
        if (dragging && drop) {
            setLayout(moveBlock(layout, dragging, drop.target, drop.index));
        }
        setDragging(null);
        setDrop(null);
    };

    const renderBlocks = (target: Target) => blocksOf(layout, target).map((block, index) => (editing ? (
        <BlockFrame key={block.id} block={block} active={activeid === block.id} strings={strings}
            dropbefore={drop?.target === target && drop.index === index && dragging !== block.id}
            onWand={() => setPanel(activeid === block.id ? null : {kind: 'block', id: block.id})}
            onDelete={() => remove(block.id)} onMove={direction => move(block.id, direction)}
            onDragStart={event => {
                event.dataTransfer.setData(DRAG_TYPE, block.id);
                event.dataTransfer.effectAllowed = 'move';
                setDragging(block.id);
            }}
            onDragEnd={() => {
                setDragging(null);
                setDrop(null);
            }}
            onDragOver={event => overBlock(event, target, index)}>
            <BlockView block={block} context={context} />
        </BlockFrame>
    ) : !isEmptyBlock(block) && (
        <div key={block.id} className="flexium-footer__block"><BlockView block={block} context={context} /></div>
    )));

    const container = (target: Target, className: string, extra?: ReactNode) => (
        <div className={`${className}${editing ? ' flexium-footer__drop' : ''}`
            + (drop?.target === target && drop.index === blocksOf(layout, target).length ? ' flexium-footer__drop--end' : '')}
        onDragOver={editing ? event => overContainer(event, target) : undefined} onDrop={editing ? dropHere : undefined}>
            {extra}
            {renderBlocks(target)}
            {editing && (
                <button type="button" className="flexium-footer__add" data-action="addblock"
                    onClick={() => setPanel({kind: 'add', target})}>
                    <i className="fa fa-plus me-1" aria-hidden="true"></i>{str(strings, 'footer_addblock')}
                </button>
            )}
        </div>
    );

    return (
        <div className={`flexium-footer ${background.className}`
            + ` flexium-footer--${String(layout.style.align || 'left')}${editing ? ' flexium-footer--editing' : ''}`}
        style={background.style}>
            {editing && (
                <FooterEditBar strings={strings} status={status} dirty={dirty} canaddcolumn={layout.columns.length < 6}
                    onStyle={() => setPanel(panel?.kind === 'style' ? null : {kind: 'style'})}
                    onAddColumn={() => setLayout({...layout, columns: [...layout.columns, {id: newId('c'), blocks: []}]})}
                    onReset={() => setLayout(saved)} onSave={save} />
            )}
            <div className="flexium-footer__columns"
                style={{'--flexium-footer-columns': Math.max(1, layout.columns.length)} as CSSProperties}>
                {layout.columns.map((column, index) => container(column.id, 'flexium-footer__column', editing ? (
                    <div className="flexium-footer__columnbar">
                        <span>{str(strings, 'footer_column', index + 1)}</span>
                        <button type="button" className="flexium-homeframe__btn" disabled={index === 0}
                            aria-label={str(strings, 'footer_moveleft')} onClick={() => {
                                const columns = [...layout.columns];
                                [columns[index - 1], columns[index]] = [columns[index], columns[index - 1]];
                                setLayout({...layout, columns});
                            }}>
                            <i className="fa fa-arrow-left" aria-hidden="true"></i>
                        </button>
                        <button type="button" className="flexium-homeframe__btn" disabled={index === layout.columns.length - 1}
                            aria-label={str(strings, 'footer_moveright')} onClick={() => {
                                const columns = [...layout.columns];
                                [columns[index + 1], columns[index]] = [columns[index], columns[index + 1]];
                                setLayout({...layout, columns});
                            }}>
                            <i className="fa fa-arrow-right" aria-hidden="true"></i>
                        </button>
                        <button type="button" className="flexium-homeframe__btn flexium-homeframe__btn--delete"
                            aria-label={str(strings, 'footer_removecolumn')} onClick={() => {
                                // eslint-disable-next-line no-alert
                                if (window.confirm(str(strings, 'footer_removecolumn_confirm'))) {
                                    setLayout({...layout, columns: layout.columns.filter(item => item.id !== column.id)});
                                }
                            }}>
                            <i className="fa fa-trash-can" aria-hidden="true"></i>
                        </button>
                    </div>
                ) : undefined))}
            </div>
            {(layout.style.bottombar !== false || editing) && container('bottom', 'flexium-footer__bottom', editing
                ? <span className="flexium-footer__columnbar"><span>{str(strings, 'footer_bottom')}</span></span> : undefined)}

            {editing && editor && panel && (
                <>
                    {activeid && <Spotlight zone={activeid} />}
                    <FooterPanel panel={panel} layout={layout} editor={editor} strings={strings} palette={palette}
                        onClose={() => setPanel(null)} onChange={setLayout} onAdd={add} />
                </>
            )}
        </div>
    );
}
