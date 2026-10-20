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
 * Quick view of a course (feature "Quick view"): a modal dialog with the full summary, dates, teachers and custom
 * fields, loaded with theme_flexium_get_course_preview, and a button to the course.
 *
 * @module     theme_flexium/catalog/QuickView
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {useEffect, useId, useRef, useState} from 'react';
import {getCoursePreview} from './repository';
import type {Course, CoursePreview, Strings} from './types';
import {str} from './utils';

interface QuickViewProps {
    /** The course to show, null when closed. */
    course: Course | null;
    onClose: () => void;
    strings: Strings;
    /** Format: modal (centred), drawer (from the right) or fullscreen. */
    variant: string;
}

export default function QuickView({course, onClose, strings, variant}: QuickViewProps) {
    const id = useId();
    const dialog = useRef<HTMLDialogElement>(null);
    const [preview, setPreview] = useState<CoursePreview | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!course) {
            dialog.current?.close();
            return undefined;
        }
        setPreview(null);
        setError(false);
        if (!dialog.current?.open) {
            dialog.current?.showModal();
        }
        let current = true;
        getCoursePreview(course.id)
            .then(response => {
                if (current) {
                    setPreview(response);
                }
                return response;
            })
            .catch(() => current && setError(true));
        return () => {
            current = false;
        };
    }, [course]);

    const hastext = !!preview && (preview.summary.trim() !== '' || preview.sections.length > 0);

    return (
        <dialog ref={dialog} className={`flexium-quickview flexium-quickview--${variant}`} aria-labelledby={`${id}-title`}
            onClose={onClose}
            onClick={event => event.target === dialog.current && dialog.current?.close()}>
            {course && (
                // Same layout as the enrolment page (templates/courseinfo.mustache): name label, image, summary + facts.
                <div className="flexium-quickview__content">
                    <div className="flexium-quickview__header">
                        <h2 id={`${id}-title`} className="flexium-quickview__title">{course.fullname}</h2>
                        <button type="button" className="btn-close flexium-quickview__close"
                            aria-label={str(strings, 'catalog_close')} onClick={() => dialog.current?.close()}></button>
                    </div>
                    <div className="flexium-quickview__body flexium-courseinfo">
                        {(preview?.categoryname || course.categoryname) && (
                            <p className="flexium-courseinfo__name">{preview?.categoryname || course.categoryname}</p>
                        )}
                        <div className="flexium-courseinfo__image" role="img" aria-label={course.fullname}
                            style={{backgroundImage: `url("${preview?.image ?? course.image}")`}}></div>
                        {!preview && !error && (
                            <p className="flexium-quickview__loading">
                                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                {str(strings, 'catalog_loading')}
                            </p>
                        )}
                        {error && <div className="alert alert-danger">{str(strings, 'catalog_error')}</div>}
                        {preview && (
                            <div className={'flexium-courseinfo__body'
                                + (hastext ? '' : ' flexium-courseinfo__body--nosummary')}>
                                {/* Summary and sections are formatted on the server (format_text). */}
                                {hastext && (
                                    <div className="flexium-courseinfo__summary">
                                        <div dangerouslySetInnerHTML={{__html: preview.summary}}></div>
                                        {preview.sections.map(section => (
                                            <div key={section.key}>
                                                <h3 className="flexium-courseinfo__sectiontitle">{section.label}</h3>
                                                <div className="flexium-courseinfo__section"
                                                    dangerouslySetInnerHTML={{__html: section.value}}></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {preview.facts.length > 0 && (
                                    <ul className="flexium-courseinfo__facts">
                                        {preview.facts.map(fact => (
                                            <li key={fact.key} className="flexium-courseinfo__fact">
                                                <i className={`${fact.icon} flexium-courseinfo__facticon`}
                                                    aria-hidden="true"></i>
                                                <span>
                                                    <strong>{fact.label}</strong>{' '}
                                                    <span dangerouslySetInnerHTML={{__html: fact.value}}></span>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flexium-quickview__footer">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => dialog.current?.close()}>
                            {str(strings, 'catalog_close')}
                        </button>
                        <a href={course.url} className="btn btn-primary">
                            {str(strings, course.enrolled ? 'catalog_gotocourse' : 'catalog_viewcourse')}
                            <i className="fa fa-arrow-right ms-2" aria-hidden="true"></i>
                        </a>
                    </div>
                </div>
            )}
        </dialog>
    );
}
