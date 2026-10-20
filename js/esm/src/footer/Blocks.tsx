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
 * The blocks of the site footer: how each block type looks with its settings.
 *
 * @module     theme_flexium/footer/Blocks
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {useEffect, useRef, type CSSProperties} from 'react';
import type {Section as Block, Settings, Strings} from '../home/types';

/** What Moodle provides to the blocks (theme_flexium\local\footer\footer::get_data()). */
export interface FooterData {
    logo: string;
    sitename: string;
    homeurl: string;
    year: string;
    legal: Record<string, {label: string; url: string}>;
    support: {label: string; url: string; external: boolean} | null;
    login: string;
    tourreset: string;
}

export interface BlockContext {
    data: FooterData;
    networks: Record<string, string>;
    strings: Strings;
    editing: boolean;
}

export const str = (strings: Strings, key: string, a: string | number = ''): string =>
    (strings[key] ?? key).replace('{$a}', String(a));

const text = (settings: Settings, key: string): string => (typeof settings[key] === 'string' ? settings[key] as string : '');
const items = (settings: Settings): Record<string, unknown>[] =>
    (Array.isArray(settings.items) ? settings.items as Record<string, unknown>[] : []);

/** Brand colours of the social networks (option "Brand colours"). */
const BRAND: Record<string, string> = {
    linkedin: '#0a66c2', x: '#000000', facebook: '#1877f2', instagram: '#e4405f', youtube: '#ff0000', github: '#181717',
    tiktok: '#000000', whatsapp: '#25d366', telegram: '#26a5e4', mastodon: '#6364ff', bluesky: '#0085ff',
    email: '#6c757d', website: '#6c757d',
};

/**
 * Block title, when set.
 */
function Title({settings}: {settings: Settings}) {
    return text(settings, 'title') ? <h2 className="flexium-footer__title">{text(settings, 'title')}</h2> : null;
}

/**
 * Edit mode: placeholder of a block that shows nothing for the current page or user.
 */
function Nothing({context, label}: {context: BlockContext; label: string}) {
    return context.editing ? <p className="flexium-footer__muted">{label} · {str(context.strings, 'footer_notavailable')}</p>
        : null;
}

/**
 * "Reset user tour on this page": the link Moodle's user tours add to the page, moved here.
 */
function UserTour({context}: {context: BlockContext}) {
    const holder = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const original = document.querySelector<HTMLElement>('#page-footer .tool_usertours-resettourcontainer');
        if (!original || !holder.current) {
            return undefined;
        }
        const move = () => {
            while (original.firstChild && holder.current) {
                holder.current.appendChild(original.firstChild);
            }
        };
        move();
        const observer = new MutationObserver(move);
        observer.observe(original, {childList: true});
        return () => observer.disconnect();
    }, []);
    return (
        <div className="flexium-footer__tour">
            <div ref={holder}></div>
            {context.editing && <span className="flexium-footer__muted">{context.data.tourreset}</span>}
        </div>
    );
}

/**
 * Logo, linked to the home page, with the site name.
 */
function LogoBlock({settings, context}: {settings: Settings; context: BlockContext}) {
    const {data} = context;
    return (
        <a href={data.homeurl} className={`flexium-footer__logo flexium-footer__logo--${text(settings, 'size') || 'md'}`}>
            {data.logo && <img src={data.logo} alt={settings.showname === true ? '' : data.sitename} />}
            {(settings.showname === true || !data.logo) && <span>{data.sitename}</span>}
        </a>
    );
}

/**
 * Title and paragraphs.
 */
function TextBlock({settings}: {settings: Settings}) {
    return (
        <div>
            <Title settings={settings} />
            {text(settings, 'text').split(/\n{2,}/).filter(Boolean)
                .map((paragraph, index) => <p key={index} className="flexium-footer__text">{paragraph}</p>)}
        </div>
    );
}

/**
 * Links with their names.
 */
function LinksBlock({settings}: {settings: Settings}) {
    return (
        <nav aria-label={text(settings, 'title') || undefined}>
            <Title settings={settings} />
            <ul className="flexium-footer__links">
                {items(settings).map((item, index) => (
                    <li key={index}>
                        <a href={String(item.url || '#')}
                            {...(item.newtab === true ? {target: '_blank', rel: 'noopener noreferrer'} : {})}>
                            {String(item.name ?? '')}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

/**
 * Contact details: email, phone, website, address.
 */
function ContactBlock({settings}: {settings: Settings}) {
    const email = text(settings, 'email');
    const phone = text(settings, 'phone');
    const website = text(settings, 'website');
    const address = text(settings, 'address');
    const rows = [
        email && {icon: 'fa-regular fa-envelope', href: `mailto:${email}`, label: email},
        phone && {icon: 'fa-solid fa-phone', href: `tel:${phone.replace(/[^0-9+]/g, '')}`, label: phone},
        website && {icon: 'fa-solid fa-globe', href: website, label: website.replace(/^https?:\/\//, '').replace(/\/$/, '')},
        address && {icon: 'fa-solid fa-location-dot', href: '', label: address},
    ].filter(Boolean) as {icon: string; href: string; label: string}[];
    return (
        <div>
            <Title settings={settings} />
            <ul className="flexium-footer__contact">
                {rows.map(row => (
                    <li key={row.icon}>
                        <i className={row.icon} aria-hidden="true"></i>
                        {row.href ? <a href={row.href}>{row.label}</a> : <span>{row.label}</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * Social network buttons: round, rounded or square; filled, outline or soft; optional brand colours.
 */
function SocialBlock({settings, context}: {settings: Settings; context: BlockContext}) {
    const classes = ['flexium-social', `flexium-social--${text(settings, 'shape') || 'round'}`,
        `flexium-social--${text(settings, 'variant') || 'filled'}`, `flexium-social--${text(settings, 'size') || 'md'}`];
    const href = (network: string, url: string) => (network === 'email' && !url.includes(':') ? `mailto:${url}` : url);
    return (
        <div>
            <Title settings={settings} />
            <ul className={classes.join(' ')}>
                {items(settings).filter(item => item.url).map((item, index) => {
                    const network = String(item.network || 'website');
                    const colour = settings.brandcolours === true ? BRAND[network] : undefined;
                    const label = str(context.strings, `network_${network}`);
                    return (
                        <li key={index}>
                            <a href={href(network, String(item.url))} target="_blank" rel="noopener noreferrer"
                                className="flexium-social__link" title={label}
                                style={colour ? {'--flexium-social': colour} as CSSProperties : undefined}>
                                <i className={context.networks[network] ?? 'fa-solid fa-link'} aria-hidden="true"></i>
                                <span className="visually-hidden">{label}</span>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

/**
 * Moodle's legal links: policies, data retention summary, privacy officer (those set up in Moodle).
 */
function LegalBlock({settings, context}: {settings: Settings; context: BlockContext}) {
    const {data, strings} = context;
    const chosen = (Array.isArray(settings.items) ? settings.items as string[] : []).filter(key => data.legal[key]);
    if (!chosen.length) {
        return <Nothing context={context} label={str(strings, 'footer_type_legal')} />;
    }
    return (
        <nav>
            <Title settings={settings} />
            <ul className="flexium-footer__inline">
                {chosen.map(key => <li key={key}><a href={data.legal[key].url}>{data.legal[key].label}</a></li>)}
            </ul>
        </nav>
    );
}

/**
 * "Contact site support": Moodle's support form (or the support page set in Moodle).
 */
function SupportBlock({settings, context}: {settings: Settings; context: BlockContext}) {
    const support = context.data.support;
    if (!support) {
        return <Nothing context={context} label={str(context.strings, 'footer_type_support')} />;
    }
    return (
        <a href={support.url} {...(support.external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
            className={text(settings, 'style') === 'link' ? 'flexium-footer__supportlink'
                : 'btn flexium-footer__supportbtn'}>
            <i className="fa-regular fa-life-ring me-2" aria-hidden="true"></i>{support.label}
        </a>
    );
}

/**
 * One block of the footer.
 */
/**
 * Whether a block has nothing to show (e.g. contact details or social networks not filled in yet). Such blocks are
 * left out of the page, and shown with a hint in edit mode.
 *
 * @param block
 */
export const isEmptyBlock = (block: Block): boolean => {
    const settings = block.settings;
    switch (block.type) {
        case 'text':
            return text(settings, 'title') === '' && text(settings, 'text').trim() === '';
        case 'links':
            return !items(settings).some(item => item.url && item.name);
        case 'contact':
            return ['email', 'phone', 'website', 'address'].every(key => text(settings, key).trim() === '');
        case 'social':
            return !items(settings).some(item => item.url);
        default:
            return false;
    }
};

export default function BlockView({block, context}: {block: Block; context: BlockContext}) {
    if (isEmptyBlock(block)) {
        return context.editing ? <p className="flexium-footer__muted">{str(context.strings, 'footer_empty')}</p> : null;
    }
    const settings = block.settings;
    const {data} = context;
    switch (block.type) {
        case 'logo': return <LogoBlock settings={settings} context={context} />;
        case 'text': return <TextBlock settings={settings} />;
        case 'links': return <LinksBlock settings={settings} />;
        case 'contact': return <ContactBlock settings={settings} />;
        case 'social': return <SocialBlock settings={settings} context={context} />;
        case 'legal': return <LegalBlock settings={settings} context={context} />;
        case 'support': return <SupportBlock settings={settings} context={context} />;
        case 'usertour': return <UserTour context={context} />;
        case 'copyright':
            return (
                <p className="flexium-footer__copyright">
                    {(text(settings, 'text') || '© {year} {sitename}').replace('{year}', data.year)
                        .replace('{sitename}', data.sitename)}
                </p>
            );
        case 'logininfo': return <p className="flexium-footer__muted">{data.login}</p>;
        default: return null;
    }
}
