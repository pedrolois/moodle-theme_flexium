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
 * Control of one optional catalogue feature (switch, select with colour swatches, ordered list or text), generated
 * from the server definition. Used by the side panel of the in-place editor (EditZones).
 *
 * @module     theme_flexium/catalog/FeatureControl
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {useId, useState} from 'react';
import WidgetList from '@moodle/lms/theme_flexium/catalog/WidgetList';
import {uploadDefaultImage} from './repository';
import type {FeatureDefinition, ImageUpload, Strings} from './types';
import {str} from './utils';

interface FeatureControlProps {
    definition: FeatureDefinition;
    value: string;
    onChange: (value: string) => void;
    palette: Record<string, string>;
    strings: Strings;
    /** Default header image: Moodle's file picker upload, null when uploads are not available. */
    upload?: ImageUpload | null;
    /** Called with the URL of a newly uploaded default header image. */
    onUploaded?: (url: string) => void;
}

interface ImageUploaderProps {
    upload: ImageUpload | null;
    onUploaded: (url: string) => void;
    strings: Strings;
}

/**
 * "Upload your own image" for the default header of course cards: stores it at once and selects it.
 */
function ImageUploader({upload, onUploaded, strings}: ImageUploaderProps) {
    const id = useId();
    const [status, setStatus] = useState<{state: 'idle' | 'uploading' | 'done' | 'error'; message?: string}>(
        {state: 'idle'});

    if (!upload) {
        return <p className="flexium-feature__help">{str(strings, 'image_noupload')}</p>;
    }

    const choose = (file: File | undefined) => {
        if (!file) {
            return;
        }
        setStatus({state: 'uploading'});
        uploadDefaultImage(file, upload)
            .then(url => {
                setStatus({state: 'done'});
                onUploaded(url);
                return url;
            })
            .catch((error: Error) => setStatus({state: 'error', message: error.message}));
    };

    return (
        <div className="flexium-feature__upload">
            <label htmlFor={id} className={`btn btn-sm btn-outline-primary${status.state === 'uploading' ? ' disabled' : ''}`}>
                <i className="fa fa-upload me-1" aria-hidden="true"></i>
                {str(strings, status.state === 'uploading' ? 'image_uploading' : 'image_upload')}
            </label>
            <input id={id} type="file" className="visually-hidden" accept="image/*"
                disabled={status.state === 'uploading'}
                onChange={event => {
                    choose(event.target.files?.[0]);
                    event.target.value = '';
                }} />
            <span role="status" className="flexium-feature__uploadstatus">
                {status.state === 'done' && str(strings, 'image_uploaded')}
                {status.state === 'error' && str(strings, 'image_uploaderror', status.message ?? '')}
            </span>
        </div>
    );
}

export default function FeatureControl({definition, value, onChange, palette, strings, upload,
        onUploaded}: FeatureControlProps) {
    const id = useId();
    const help = <p id={`${id}-help`} className="flexium-feature__help">{definition.help}</p>;

    if (definition.type === 'bool') {
        return (
            <div className="flexium-feature" data-feature={definition.key}>
                <div className="form-check form-switch">
                    <input id={id} type="checkbox" role="switch" className="form-check-input" checked={value === '1'}
                        aria-describedby={`${id}-help`} onChange={event => onChange(event.target.checked ? '1' : '0')} />
                    <label htmlFor={id} className="form-check-label flexium-feature__label">{definition.label}</label>
                </div>
                {help}
            </div>
        );
    }

    if (definition.type === 'list') {
        return (
            <div className="flexium-feature flexium-feature--wide" data-feature={definition.key}>
                <p className="flexium-feature__label mb-1">{definition.label}</p>
                {help}
                <WidgetList title={definition.label} value={value === '' ? [] : value.split(',')}
                    choices={definition.choices} onChange={keys => onChange(keys.join(','))} strings={strings} />
            </div>
        );
    }

    if (definition.type === 'select') {
        // Colour choices (the six default headers): clickable previews.
        const swatches = ['bannerstyle', 'defaultimage'].includes(definition.key);
        return (
            <div className="flexium-feature" data-feature={definition.key}>
                <label htmlFor={id} className="flexium-feature__label">{definition.label}</label>
                <select id={id} className="form-select form-select-sm" value={value} aria-describedby={`${id}-help`}
                    onChange={event => onChange(event.target.value)}>
                    {definition.choices.map(choice => <option key={choice.key} value={choice.key}>{choice.label}</option>)}
                </select>
                {swatches && (
                    // Colour choices: clickable previews of the six headers.
                    <div className="flexium-feature__swatches">
                        {definition.choices.filter(choice => palette[choice.key]).map(choice => (
                            <button key={choice.key} type="button"
                                className={`flexium-feature__swatch${value === choice.key ? ' is-active' : ''}`}
                                style={{backgroundImage: `url("${palette[choice.key]}")`}}
                                aria-label={choice.label} aria-pressed={value === choice.key}
                                onClick={() => onChange(choice.key)}></button>
                        ))}
                    </div>
                )}
                {definition.key === 'defaultimage' && onUploaded && (
                    <ImageUploader upload={upload ?? null} onUploaded={onUploaded} strings={strings} />
                )}
                {help}
            </div>
        );
    }

    return (
        <div className="flexium-feature" data-feature={definition.key}>
            <label htmlFor={id} className="flexium-feature__label">{definition.label}</label>
            <input id={id} type="text" className="form-control form-control-sm" value={value} maxLength={255}
                aria-describedby={`${id}-help`} onChange={event => onChange(event.target.value)} />
            {help}
        </div>
    );
}
