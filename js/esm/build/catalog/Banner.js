import{str as s}from"./utils";import{jsx as r,jsxs as l}from"react/jsx-runtime";/*
 * This file is part of Moodle - http://moodle.org/
 *
 * Moodle is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Moodle is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Moodle.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 *//**
 * Catalogue header (feature "Catalogue header"): title and text over one of the theme's header images.
 *
 * @module     theme_flexium/catalog/Banner
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */function i({title:t,text:e,image:n,strings:a}){return l("header",{className:"flexium-banner",style:{backgroundImage:n?`url("${n}")`:void 0},children:[r("h2",{className:"flexium-banner__title",children:t||s(a,"catalog_bannertitle")}),e&&r("p",{className:"flexium-banner__text",children:e})]})}export{i as default};
