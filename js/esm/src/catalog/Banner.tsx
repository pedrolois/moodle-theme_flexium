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
 * Catalogue header (feature "Catalogue header"): title and text over one of the theme's header images.
 *
 * @module     theme_flexium/catalog/Banner
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import type {Strings} from './types';
import {str} from './utils';

interface BannerProps {
    title: string;
    text: string;
    image: string;
    strings: Strings;
}

export default function Banner({title, text, image, strings}: BannerProps) {
    return (
        <header className="flexium-banner" style={{backgroundImage: image ? `url("${image}")` : undefined}}>
            <h2 className="flexium-banner__title">{title || str(strings, 'catalog_bannertitle')}</h2>
            {text && <p className="flexium-banner__text">{text}</p>}
        </header>
    );
}
