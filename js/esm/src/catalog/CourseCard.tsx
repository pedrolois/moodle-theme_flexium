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
 * Course card of the catalogue grid (or row of the list view).
 *
 * Optional features: status badges on the image, progress bar, favourite star and quick view button.
 *
 * @module     theme_flexium/catalog/CourseCard
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {Badge} from '@moodlehq/design-system';
import {EditZone, useEditZones} from '@moodle/lms/theme_flexium/catalog/EditZones';
import type {BadgeStyle, Course, CourseMeta, Features, Strings} from './types';
import {str} from './utils';

interface CourseCardProps {
    course: Course;
    strings: Strings;
    features: Features;
    /** Logged in (not guest): favourites are available. */
    loggedin: boolean;
    onFavourite: (course: Course) => void;
    onQuickView: (course: Course) => void;
    /** Edit mode: this card carries the magic wands of the card parts (the first card only). */
    wands?: boolean;
    /** Colours of the badges and whether each source starts a new line. */
    badgestyle: BadgeStyle;
}

/**
 * One footer item: teachers show their photos and/or names, the others an icon and a text.
 *
 * @param props
 * @param props.item
 */
function MetaItem({item}: {item: CourseMeta}) {
    if (item.key.startsWith('teacher') && item.people.length) {
        const photos = item.key !== 'teachernames';
        const names = item.key !== 'teacherphotos';
        return (
            <span className="flexium-card__meta flexium-card__teachers" title={item.label}>
                <span className="visually-hidden">{item.label}: </span>
                {photos && (
                    <span className="flexium-card__avatars">
                        {item.people.slice(0, 3).map(person => (
                            <img key={person.image + person.name} src={person.image} alt={names ? '' : person.name}
                                title={person.name} className="flexium-card__avatar" />
                        ))}
                    </span>
                )}
                {!photos && <i className={`${item.icon} me-1`} aria-hidden="true"></i>}
                {names && item.text}
            </span>
        );
    }
    return (
        <span className="flexium-card__meta" title={item.label}>
            <i className={`${item.icon} me-1`} aria-hidden="true"></i>
            <span className="visually-hidden">{item.label}: </span>
            {item.text}
        </span>
    );
}

/** Status badge key => [icon, whether the course has it]. */
const statusOf = (course: Course): Record<string, [string, boolean]> => ({
    enrolled: ['fa-solid fa-user-check', course.enrolled],
    completed: ['fa-solid fa-circle-check', course.completed],
    'new': ['fa-solid fa-wand-magic-sparkles', course.isnew],
    startingsoon: ['fa-regular fa-calendar-plus', course.startingsoon],
    favourite: ['fa-solid fa-star', course.favourite],
});

interface CardPartProps {
    course: Course;
    strings: Strings;
    features: Features;
}

/**
 * Card image with the status badges (hidden course first) and the quick view / favourite buttons.
 */
function CardImage({course, strings, features, loggedin, onFavourite, onQuickView}: CardPartProps & {
        loggedin: boolean; onFavourite: (course: Course) => void; onQuickView: (course: Course) => void}) {
    const status = statusOf(course);
    // Completed courses do not show "Enrolled" as well.
    const statuses = features.statusbadges
        .filter(key => status[key]?.[1] && !(key === 'enrolled' && course.completed && features.statusbadges.includes('completed')))
        .slice(0, 2);
    const favourites = features.favourites && loggedin;
    const quickview = features.quickview && course.quickview;
    const favouritelabel = str(strings, course.favourite ? 'catalog_unfavourite' : 'catalog_favourite', course.fullname);

    return (
        <>
            <div className="flexium-card__image" style={{backgroundImage: `url("${course.image}")`}}>
                {(statuses.length > 0 || !course.visible) && (
                    <ul className="flexium-card__status">
                        {!course.visible && (
                            <li className="flexium-card__statusbadge flexium-card__statusbadge--hidden">
                                <i className="fa fa-eye-slash me-1" aria-hidden="true"></i>
                                {str(strings, 'catalog_hidden')}
                            </li>
                        )}
                        {statuses.map(key => (
                            <li key={key} className={`flexium-card__statusbadge flexium-card__statusbadge--${key}`}>
                                <i className={`${status[key][0]} me-1`} aria-hidden="true"></i>
                                {str(strings, `status_${key}`)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {(favourites || quickview) && (
                // Above the card link (see .flexium-card__link::after), so they stay clickable.
                <div className="flexium-card__actions">
                    {quickview && (
                        <button type="button" className="flexium-card__action" data-action="quickview"
                            aria-label={str(strings, 'catalog_quickview', course.fullname)}
                            title={str(strings, 'catalog_quickview', course.fullname)} onClick={() => onQuickView(course)}>
                            <i className="fa fa-eye" aria-hidden="true"></i>
                        </button>
                    )}
                    {favourites && (
                        <button type="button" data-action="favourite"
                            className={`flexium-card__action${course.favourite ? ' flexium-card__action--on' : ''}`}
                            aria-pressed={course.favourite} aria-label={favouritelabel} title={favouritelabel}
                            onClick={() => onFavourite(course)}>
                            <i className={`fa-${course.favourite ? 'solid' : 'regular'} fa-star`} aria-hidden="true"></i>
                        </button>
                    )}
                </div>
            )}
        </>
    );
}

/**
 * Card badges (custom fields and tags) and the progress bar.
 */
function CardBadges({course, strings, features, wands, placeholder, badgestyle}: CardPartProps & {wands: boolean;
        placeholder: string; badgestyle: BadgeStyle}) {
    const showprogress = features.progress && course.progress >= 0;
    // One list per source when each source starts a new line, else a single list.
    const lists = badgestyle.rows
        ? [...new Set(course.badges.map(badge => badge.source))].map(source =>
            course.badges.filter(badge => badge.source === source))
        : [course.badges];
    return (
        <>
            {(course.badges.length > 0 || placeholder) && (
                <EditZone zone="badges" enabled={wands} className="flexium-editzone--padded">
                    {course.badges.length > 0 ? (
                        <div className="flexium-card__badgegroups">
                            {lists.map(list => (
                                <ul key={list[0].source} className="flexium-card__badges">
                                    {list.map(badge => (
                                        <li key={`${badge.source}-${badge.label}`} title={`${badge.origin}: ${badge.label}`}>
                                            <Badge label={badge.label} subtle pill
                                                variant={(badgestyle.colours[badge.source] ?? 'primary') as 'primary'} />
                                        </li>
                                    ))}
                                </ul>
                            ))}
                        </div>
                    ) : <p className="flexium-editzone__placeholder">{placeholder}</p>}
                </EditZone>
            )}
            {showprogress && (
                <div className="flexium-card__progress">
                    <div className="progress" role="progressbar" aria-valuenow={course.progress} aria-valuemin={0}
                        aria-valuemax={100} aria-label={str(strings, 'catalog_progress', course.progress)}>
                        <div className="progress-bar" style={{width: `${course.progress}%`}}></div>
                    </div>
                    <span className="flexium-card__progresstext">{str(strings, 'catalog_progress', course.progress)}</span>
                </div>
            )}
        </>
    );
}

export default function CourseCard({course, strings, features, loggedin, onFavourite, onQuickView,
        wands = false, badgestyle}: CourseCardProps) {
    const edit = useEditZones();
    // Edit mode: empty parts of the card with a wand still show a placeholder, so they can be switched on.
    const placeholder = wands && edit ? str(edit.editor.strings, 'editzone_nothing') : '';

    return (
        <article className={`flexium-card${course.visible ? '' : ' flexium-card--hidden'}`}>
            <EditZone zone="image" enabled={wands} className="flexium-editzone--image">
                <CardImage course={course} strings={strings} features={features} loggedin={loggedin}
                    onFavourite={onFavourite} onQuickView={onQuickView} />
            </EditZone>
            <div className="flexium-card__body">
                <EditZone zone="text" enabled={wands} className="flexium-editzone--padded">
                    {course.categoryname && <p className="flexium-card__category">{course.categoryname}</p>}
                    <h3 className="flexium-card__title">
                        {/* The link covers the whole card (see .flexium-card__link::after). */}
                        <a href={course.url} className="flexium-card__link"
                            onClick={edit ? event => event.preventDefault() : undefined}>{course.fullname}</a>
                    </h3>
                    {course.summary && <p className="flexium-card__summary">{course.summary}</p>}
                </EditZone>
                <CardBadges course={course} strings={strings} features={features} wands={wands} placeholder={placeholder}
                    badgestyle={badgestyle} />
            </div>
            {(course.meta.length > 0 || placeholder) && (
                // Items chosen in the theme settings (Course cards tab), formatted on the server.
                <EditZone zone="footer" enabled={wands} className="flexium-editzone--padded">
                    <footer className="flexium-card__footer">
                        {course.meta.map(item => <MetaItem key={item.key} item={item} />)}
                        {course.meta.length === 0 && <span className="flexium-editzone__placeholder">{placeholder}</span>}
                    </footer>
                </EditZone>
            )}
        </article>
    );
}
