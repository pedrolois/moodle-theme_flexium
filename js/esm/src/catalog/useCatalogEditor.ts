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
 * State of the catalogue editor (edit mode, site administrators): the draft filter layout, card
 * settings, page options and features, compared with the saved ones, and saving them.
 *
 * @module     theme_flexium/catalog/useCatalogEditor
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {useEffect, useState} from 'react';
import {saveCatalogLayout} from './repository';
import type {CardSettings, CatalogOptions, EditorProps, LayoutItem, RawFeatures} from './types';

/**
 * While there are unsaved changes: turning edit mode off asks for confirmation (with our message), and leaving the
 * page otherwise gets the browser's own warning.
 *
 * @param dirty
 * @param message confirmation shown when turning edit mode off
 * @returns cleanup
 */
export const warnOnLeave = (dirty: boolean, message: string): (() => void) | undefined => {
    if (!dirty) {
        return undefined;
    }
    const warn = (event: BeforeUnloadEvent) => {
        event.preventDefault();
    };
    const editswitch = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        if (!target?.closest('.editmode-switch-form, input[name="setmode"]')) {
            return;
        }
        // eslint-disable-next-line no-alert
        if (window.confirm(message)) {
            window.removeEventListener('beforeunload', warn);
        } else {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    };
    window.addEventListener('beforeunload', warn);
    document.addEventListener('click', editswitch, true);
    return () => {
        window.removeEventListener('beforeunload', warn);
        document.removeEventListener('click', editswitch, true);
    };
};

export type EditorStatus = 'idle' | 'saving' | 'saved' | 'error';

interface Draft {
    layout: LayoutItem[];
    card: CardSettings;
    options: CatalogOptions;
    features: RawFeatures;
}

/**
 * Editor state.
 *
 * @param editor editor props, null when the editor is not available
 * @param onSaved called after a successful save, to reload the catalogue
 */
export default function useCatalogEditor(editor: EditorProps | null, onSaved: () => void) {
    const initial: Draft | null = editor
        ? {layout: editor.layout, card: editor.card, options: editor.options, features: editor.features}
        : null;
    const [saved, setSaved] = useState<Draft | null>(initial);
    const [draft, setDraft] = useState<Draft | null>(initial);
    const [status, setStatus] = useState<EditorStatus>('idle');

    const dirty = JSON.stringify(saved) !== JSON.stringify(draft);

    // Leaving the page (or turning edit mode off) with unsaved changes asks first.
    useEffect(() => warnOnLeave(dirty, editor?.strings.editor_leaveunsaved ?? ''), [dirty, editor]);

    const setLayout = (layout: LayoutItem[]) => draft && setDraft({...draft, layout});
    const setCard = (card: CardSettings) => draft && setDraft({...draft, card});
    const setOptions = (options: CatalogOptions) => draft && setDraft({...draft, options});
    const setFeature = (key: string, value: string) => draft && setDraft({...draft, features: {...draft.features, [key]: value}});

    const save = () => {
        if (!draft) {
            return;
        }
        setStatus('saving');
        saveCatalogLayout(draft.layout, draft.card, draft.options, draft.features)
            .then(([layout, card, options, features]) => {
                const next = {layout, card, options, features};
                setSaved(next);
                setDraft(next);
                setStatus('saved');
                onSaved();
                return next;
            })
            .catch(() => setStatus('error'));
    };

    const reset = () => {
        setDraft(saved);
        setStatus('idle');
    };

    return {draft, dirty, status, setLayout, setCard, setOptions, setFeature, save, reset};
}
