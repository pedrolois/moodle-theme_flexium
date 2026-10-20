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
 * The sections of the home page: how each section type looks with its settings.
 *
 * @module     theme_flexium/home/Sections
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {useEffect, useRef, useState, type CSSProperties} from 'react';
import type {Course} from '@moodle/lms/theme_flexium/catalog/types';
import {getSectionCourses} from './repository';
import type {HomeData, Section, Settings, Strings} from './types';

/** What every section renderer receives. */
export interface SectionContext {
    data: HomeData | null;
    strings: Strings;
    palette: Record<string, string>;
    catalogurl: string;
    loggedin: boolean;
    sitecontent: string;
    sitename: string;
}

/**
 * A string, with its placeholder replaced.
 *
 * @param strings
 * @param key
 * @param a
 */
export const str = (strings: Strings, key: string, a: string | number = ''): string =>
    (strings[key] ?? key).replace('{$a}', String(a));

/** Typed reads of section settings. */
const text = (settings: Settings, key: string): string => (typeof settings[key] === 'string' ? settings[key] as string : '');
const num = (settings: Settings, key: string, fallback: number): number => Number(settings[key]) || fallback;
const items = (settings: Settings): Record<string, string>[] =>
    (Array.isArray(settings.items) ? settings.items as Record<string, string>[] : []);

/**
 * Section heading (title and subtitle), when there is one.
 */
function Heading({settings, centred = false}: {settings: Settings; centred?: boolean}) {
    const title = text(settings, 'title');
    const subtitle = text(settings, 'subtitle');
    if (!title && !subtitle) {
        return null;
    }
    return (
        <div className={`flexium-home__heading${centred ? ' text-center' : ''}`}>
            {title && <h2 className="flexium-home__title">{title}</h2>}
            {subtitle && <p className="flexium-home__subtitle">{subtitle}</p>}
        </div>
    );
}

/**
 * Hero: big header with title, text, buttons and an optional search box.
 */
function Hero({settings, context}: {settings: Settings; context: SectionContext}) {
    const image = context.palette[text(settings, 'style')] ?? '';
    const align = text(settings, 'align') || 'left';
    return (
        <div className={`flexium-hero flexium-hero--${text(settings, 'height') || 'lg'} flexium-hero--${align}`}
            style={{backgroundImage: image ? `url("${image}")` : undefined}}>
            <div className="flexium-hero__content">
                <h2 className="flexium-hero__title">{text(settings, 'title') || context.sitename}</h2>
                {text(settings, 'text') && <p className="flexium-hero__text">{text(settings, 'text')}</p>}
                {settings.search === true && (
                    <form className="flexium-hero__search" action={context.catalogurl} method="get" role="search">
                        <i className="fa fa-magnifying-glass" aria-hidden="true"></i>
                        <input type="search" name="q" className="form-control form-control-lg"
                            placeholder={str(context.strings, 'home_searchplaceholder')}
                            aria-label={str(context.strings, 'home_search')} />
                        <button type="submit" className="btn btn-primary btn-lg">{str(context.strings, 'home_search')}</button>
                    </form>
                )}
                {(text(settings, 'buttontext') || text(settings, 'button2text')) && (
                    <div className="flexium-hero__buttons">
                        {text(settings, 'buttontext') && (
                            <a className="btn btn-light btn-lg" href={text(settings, 'buttonurl') || context.catalogurl}>
                                {text(settings, 'buttontext')}
                            </a>
                        )}
                        {text(settings, 'button2text') && (
                            <a className="btn btn-outline-light btn-lg" href={text(settings, 'button2url') || '#'}>
                                {text(settings, 'button2text')}
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * One course of a courses section.
 */
function CourseTile({course}: {course: Course}) {
    return (
        <article className="flexium-hometile">
            <div className="flexium-hometile__image" style={{backgroundImage: `url("${course.image}")`}}></div>
            <div className="flexium-hometile__body">
                {course.categoryname && <p className="flexium-hometile__category">{course.categoryname}</p>}
                <h3 className="flexium-hometile__title">
                    <a href={course.url} className="flexium-hometile__link">{course.fullname}</a>
                </h3>
                {course.summary && <p className="flexium-hometile__summary">{course.summary}</p>}
                {course.progress >= 0 && (
                    <div className="progress flexium-hometile__progress" role="progressbar" aria-valuenow={course.progress}
                        aria-valuemin={0} aria-valuemax={100}>
                        <div className="progress-bar" style={{width: `${course.progress}%`}}></div>
                    </div>
                )}
            </div>
        </article>
    );
}

/**
 * Courses: a carousel or a grid of courses from a source (latest, popular, a category...).
 */
function Courses({settings, context}: {settings: Settings; context: SectionContext}) {
    const source = text(settings, 'source') || 'latest';
    const categoryid = num(settings, 'categoryid', 0);
    const count = num(settings, 'count', 8);
    const [courses, setCourses] = useState<Course[] | null>(null);
    const track = useRef<HTMLUListElement>(null);
    const [paused, setPaused] = useState(false);
    const carousel = text(settings, 'layout') !== 'grid';

    useEffect(() => {
        let current = true;
        setCourses(null);
        getSectionCourses(source, categoryid, count)
            .then(result => current && setCourses(result))
            .catch(() => current && setCourses([]));
        return () => {
            current = false;
        };
    }, [source, categoryid, count]);

    const scroll = (direction: number) => {
        const element = track.current;
        if (!element) {
            return;
        }
        const atend = element.scrollLeft + element.clientWidth >= element.scrollWidth - 4;
        if (direction > 0 && atend) {
            element.scrollTo({left: 0, behavior: 'smooth'});
        } else {
            element.scrollBy({left: direction * element.clientWidth * 0.8, behavior: 'smooth'});
        }
    };

    // Moves on by itself, unless the pointer or the focus is on it, or the user prefers less motion.
    useEffect(() => {
        if (!carousel || settings.autoplay !== true || paused
                || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return undefined;
        }
        const timer = window.setInterval(() => scroll(1), 5000);
        return () => window.clearInterval(timer);
    }, [carousel, settings.autoplay, paused]);

    // Personal sources need a logged in user: visitors do not see them.
    if (['mycourses', 'favourites'].includes(source) && !context.loggedin) {
        return null;
    }
    const columns = num(settings, 'columns', 4);

    return (
        <div className="flexium-home__courses" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
            <div className="flexium-home__row">
                <Heading settings={settings} />
                <div className="flexium-home__rowtools">
                    {carousel && courses && courses.length > 0 && (
                        <>
                            <button type="button" className="flexium-home__arrow" onClick={() => scroll(-1)}
                                aria-label={str(context.strings, 'home_previous')}>
                                <i className="fa fa-chevron-left" aria-hidden="true"></i>
                            </button>
                            <button type="button" className="flexium-home__arrow" onClick={() => scroll(1)}
                                aria-label={str(context.strings, 'home_next')}>
                                <i className="fa fa-chevron-right" aria-hidden="true"></i>
                            </button>
                        </>
                    )}
                    <a className="flexium-home__viewall" href={context.catalogurl}>{str(context.strings, 'home_viewall')}</a>
                </div>
            </div>
            {!courses && <p className="flexium-home__muted">{str(context.strings, 'catalog_loading')}</p>}
            {courses && courses.length === 0 && <p className="flexium-home__muted">{str(context.strings, 'home_nocourses')}</p>}
            {courses && courses.length > 0 && (
                <ul ref={track} className={carousel ? 'flexium-home__carousel' : 'flexium-home__grid'}
                    style={{'--flexium-columns': columns} as CSSProperties}>
                    {courses.map(course => <li key={course.id}><CourseTile course={course} /></li>)}
                </ul>
            )}
        </div>
    );
}

/**
 * Categories: tiles or chips linked to the catalogue.
 */
function Categories({settings, context}: {settings: Settings; context: SectionContext}) {
    const categories = (context.data?.categories ?? []).slice(0, num(settings, 'count', 8));
    const chips = text(settings, 'style') === 'chips';
    return (
        <div>
            <Heading settings={settings} />
            <ul className={chips ? 'flexium-home__chips' : 'flexium-home__categories'}>
                {categories.map((category, index) => (
                    <li key={category.id}>
                        <a href={category.url} className={chips ? 'flexium-home__chip' : 'flexium-home__category'}
                            style={chips ? undefined : {backgroundImage: `url("${context.palette[String(index % 6 + 1)]}")`}}>
                            <span className="flexium-home__categoryname">{category.name}</span>
                            <span className="flexium-home__categorycount">
                                {str(context.strings, 'home_coursecount', category.coursecount)}
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/** Icons of the figures. */
const STAT_ICONS: Record<string, string> = {
    courses: 'fa-solid fa-book-open', users: 'fa-solid fa-user-graduate', categories: 'fa-solid fa-layer-group',
    completions: 'fa-solid fa-award',
};

/**
 * Figures of the platform.
 */
function Stats({settings, context}: {settings: Settings; context: SectionContext}) {
    const keys = Array.isArray(settings.items) ? settings.items as string[] : [];
    const format = new Intl.NumberFormat(document.documentElement.lang || undefined);
    return (
        <div>
            <Heading settings={settings} centred />
            <ul className={`flexium-home__stats flexium-home__stats--${text(settings, 'style') || 'cards'}`}>
                {keys.map(key => (
                    <li key={key} className="flexium-home__stat">
                        <i className={`${STAT_ICONS[key] ?? 'fa fa-circle'} flexium-home__staticon`} aria-hidden="true"></i>
                        <span className="flexium-home__statvalue">{format.format(context.data?.stats[key] ?? 0)}</span>
                        <span className="flexium-home__statlabel">{str(context.strings, `home_stat_${key}`)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * Feature boxes: icon, title and text.
 */
function Features({settings}: {settings: Settings}) {
    return (
        <div>
            <Heading settings={settings} centred />
            <ul className="flexium-home__features"
                style={{'--flexium-columns': num(settings, 'columns', 3)} as CSSProperties}>
                {items(settings).map((item, index) => (
                    <li key={index} className="flexium-home__feature">
                        <span className="flexium-home__featureicon">
                            <i className={item.icon || 'fa fa-star'} aria-hidden="true"></i>
                        </span>
                        <h3 className="flexium-home__featuretitle">{item.title}</h3>
                        <p className="flexium-home__featuretext">{item.text}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * Numbered steps.
 */
function Steps({settings}: {settings: Settings}) {
    return (
        <div>
            <Heading settings={settings} centred />
            <ol className="flexium-home__steps">
                {items(settings).map((item, index) => (
                    <li key={index} className="flexium-home__step">
                        <span className="flexium-home__stepnumber" aria-hidden="true">{index + 1}</span>
                        <h3 className="flexium-home__featuretitle">{item.title}</h3>
                        <p className="flexium-home__featuretext">{item.text}</p>
                    </li>
                ))}
            </ol>
        </div>
    );
}

/**
 * Call to action: coloured band with a message and a button.
 */
function Cta({settings, context}: {settings: Settings; context: SectionContext}) {
    const image = context.palette[text(settings, 'style')] ?? '';
    return (
        <div className="flexium-home__cta" style={{backgroundImage: image ? `url("${image}")` : undefined}}>
            <div>
                <h2 className="flexium-home__ctatitle">{text(settings, 'title')}</h2>
                {text(settings, 'text') && <p className="flexium-home__ctatext">{text(settings, 'text')}</p>}
            </div>
            {text(settings, 'buttontext') && (
                <a className="btn btn-light btn-lg" href={text(settings, 'buttonurl') || context.catalogurl}>
                    {text(settings, 'buttontext')}
                </a>
            )}
        </div>
    );
}

/**
 * Testimonials: quotes with a name and a role.
 */
function Testimonials({settings}: {settings: Settings}) {
    return (
        <div>
            <Heading settings={settings} centred />
            <ul className="flexium-home__quotes">
                {items(settings).map((item, index) => (
                    <li key={index} className="flexium-home__quote">
                        <i className="fa fa-quote-left flexium-home__quoteicon" aria-hidden="true"></i>
                        <blockquote className="flexium-home__quotetext">{item.quote}</blockquote>
                        <p className="flexium-home__quotename">
                            <span className="flexium-home__avatar" aria-hidden="true">{(item.name || '?').charAt(0)}</span>
                            <span>
                                <strong>{item.name}</strong>
                                {item.role && <span className="d-block flexium-home__muted">{item.role}</span>}
                            </span>
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * Questions that open to show their answer.
 */
function Faq({settings}: {settings: Settings}) {
    return (
        <div className="flexium-home__narrow">
            <Heading settings={settings} centred />
            <div className="flexium-home__faq">
                {items(settings).map((item, index) => (
                    <details key={index} className="flexium-home__faqitem">
                        <summary>{item.question}</summary>
                        <p>{item.answer}</p>
                    </details>
                ))}
            </div>
        </div>
    );
}

/**
 * Partners: names, linked when there is a link.
 */
function Logos({settings}: {settings: Settings}) {
    return (
        <div>
            <Heading settings={settings} centred />
            <ul className="flexium-home__logos">
                {items(settings).map((item, index) => (
                    <li key={index}>
                        {item.url ? <a href={item.url} className="flexium-home__logo">{item.name}</a>
                            : <span className="flexium-home__logo">{item.name}</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * Latest site announcements.
 */
function News({settings, context}: {settings: Settings; context: SectionContext}) {
    const news = (context.data?.news ?? []).slice(0, num(settings, 'count', 3));
    return (
        <div>
            <Heading settings={settings} />
            {news.length === 0 && <p className="flexium-home__muted">{str(context.strings, 'home_nonews')}</p>}
            <ul className="flexium-home__news">
                {news.map(item => (
                    <li key={item.url} className="flexium-home__newsitem">
                        <span className="flexium-home__muted">{item.date}</span>
                        <a href={item.url}>{item.title}</a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * Free text with a title (plain text, paragraphs kept).
 */
function Text({settings}: {settings: Settings}) {
    return (
        <div className="flexium-home__narrow">
            <Heading settings={settings} />
            {text(settings, 'html').split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
    );
}

/**
 * Moodle's own site home content: the site summary section (moved here from where Moodle prints it, hidden) and the
 * parts chosen in the site home settings.
 */
function SiteContent({html}: {html: string}) {
    const holder = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const section = document.querySelector<HTMLElement>('.flexium-sitesection');
        const original = section?.parentElement;
        if (!section || !holder.current) {
            return undefined;
        }
        holder.current.appendChild(section);
        section.hidden = false;
        // Put it back (hidden) when this section goes away, so Moodle's editor keeps its element.
        return () => {
            section.hidden = true;
            original?.appendChild(section);
        };
    }, []);
    return (
        <div className="flexium-home__sitecontent">
            <div ref={holder}></div>
            <div dangerouslySetInnerHTML={{__html: html}}></div>
        </div>
    );
}

/**
 * One section of the home page.
 */
export default function SectionView({section, context}: {section: Section; context: SectionContext}) {
    const settings = section.settings;
    switch (section.type) {
        case 'hero': return <Hero settings={settings} context={context} />;
        case 'courses': return <Courses settings={settings} context={context} />;
        case 'categories': return <Categories settings={settings} context={context} />;
        case 'stats': return <Stats settings={settings} context={context} />;
        case 'features': return <Features settings={settings} />;
        case 'steps': return <Steps settings={settings} />;
        case 'cta': return <Cta settings={settings} context={context} />;
        case 'testimonials': return <Testimonials settings={settings} />;
        case 'faq': return <Faq settings={settings} />;
        case 'logos': return <Logos settings={settings} />;
        case 'news': return <News settings={settings} context={context} />;
        case 'text': return <Text settings={settings} />;
        // Moodle's own site home content, rendered by Moodle.
        case 'sitecontent':
            return <SiteContent html={context.sitecontent} />;
        case 'spacer':
            return <div className={`flexium-home__spacer flexium-home__spacer--${text(settings, 'size') || 'md'}`}></div>;
        default: return null;
    }
}
