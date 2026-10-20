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
 * Catalogue editor bar (edit mode, site administrators): how to edit (magic wands on the page), every option at
 * once, and Save / Discard for the whole catalogue layout.
 *
 * @module     theme_flexium/catalog/EditorPanel
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {useId} from 'react';
import type {EditorProps} from './types';
import {str} from './utils';

interface EditorPanelProps {
    editor: EditorProps;
    dirty: boolean;
    status: 'idle' | 'saving' | 'saved' | 'error';
    onSave: () => void;
    onReset: () => void;
    /** Open the side panel with every option. */
    onAllSettings: () => void;
}

export default function EditorPanel({editor, dirty, status, onSave, onReset, onAllSettings}: EditorPanelProps) {
    const id = useId();
    const strings = editor.strings;

    return (
        <section className="flexium-editor" aria-labelledby={`${id}-title`}>
            <div className="flexium-editor__header">
                <div>
                    <h2 id={`${id}-title`} className="flexium-editor__title">
                        <i className="fa fa-pen-to-square me-2" aria-hidden="true"></i>
                        {str(strings, 'editor_title')}
                    </h2>
                    <p className="flexium-editor__help">
                        {str(strings, 'editor_help')}
                        <i className="fa fa-wand-magic-sparkles flexium-editor__wandhint" aria-hidden="true"></i>
                    </p>
                </div>
                <div className="flexium-editor__actions">
                    <span className="flexium-editor__status" role="status">
                        {status === 'saving' && str(strings, 'editor_saving')}
                        {status === 'saved' && !dirty && str(strings, 'editor_saved')}
                        {status === 'error' && str(strings, 'editor_error')}
                        {status !== 'saving' && dirty && str(strings, 'editor_unsaved')}
                    </span>
                    <button type="button" className="btn btn-outline-primary" data-action="allsettings" onClick={onAllSettings}>
                        <i className="fa fa-sliders me-2" aria-hidden="true"></i>
                        {str(strings, 'editzone_all')}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" data-action="discard"
                        disabled={!dirty || status === 'saving'} onClick={onReset}>
                        {str(strings, 'editor_reset')}
                    </button>
                    <button type="button" className="btn btn-primary" data-action="save"
                        disabled={!dirty || status === 'saving'} onClick={onSave}>
                        {str(strings, 'editor_save')}
                    </button>
                </div>
            </div>
        </section>
    );
}
