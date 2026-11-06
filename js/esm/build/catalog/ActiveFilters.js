import{str as r}from"./utils";import{jsx as l,jsxs as s}from"react/jsx-runtime";/*
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
 * Active filters panel: one removable chip per selected option and for the search text.
 *
 * @module     theme_flexium/catalog/ActiveFilters
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */function u({prefix:t,label:i,onRemove:c,strings:o}){const n=`${t}: ${i}`;return s("li",{className:"flexium-chip",children:[s("span",{className:"flexium-chip__prefix",children:[t,":"]}),l("span",{className:"flexium-chip__label",children:i}),l("button",{type:"button",className:"flexium-chip__remove",onClick:c,"aria-label":r(o,"catalog_removefilter",n),children:l("i",{className:"fa fa-xmark","aria-hidden":"true"})})]})}function p({search:t,selected:i,grouplabels:c,onRemoveSearch:o,onRemove:n,onClearAll:m,strings:a}){if(!t&&i.length===0)return null;const f=r(a,"catalog_search");return s("section",{className:"flexium-activefilters","aria-label":r(a,"catalog_activefilters"),children:[l("h2",{className:"flexium-activefilters__title",children:r(a,"catalog_activefilters")}),s("ul",{className:"flexium-activefilters__chips",children:[t&&l(u,{prefix:f,label:`\u201C${t}\u201D`,onRemove:o,strings:a}),i.map(e=>l(u,{prefix:c[e.source]??e.source,label:e.label,onRemove:()=>n(e.source,e.value),strings:a},`${e.source}|${e.value}`))]}),l("button",{type:"button",className:"btn btn-link flexium-activefilters__clear",onClick:m,children:r(a,"catalog_clearall")})]})}export{p as default};
