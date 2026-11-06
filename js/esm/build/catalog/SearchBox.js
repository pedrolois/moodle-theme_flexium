import{useEffect as l,useId as h,useRef as p,useState as g}from"react";import{str as u}from"./utils";import{jsx as a,jsxs as m}from"react/jsx-runtime";/*
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
 * Debounced catalogue search box.
 *
 * @module     theme_flexium/catalog/SearchBox
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */const S=400;function _({value:r,onSearch:f,strings:o}){const i=h(),[s,c]=g(r),t=p(void 0);l(()=>{c(r)},[r]),l(()=>()=>window.clearTimeout(t.current),[]);const n=e=>{window.clearTimeout(t.current),e.trim()!==r&&f(e.trim())},d=e=>{c(e),window.clearTimeout(t.current),t.current=window.setTimeout(()=>n(e),S)};return m("form",{role:"search",className:"flexium-search",onSubmit:e=>{e.preventDefault(),n(s)},children:[a("label",{htmlFor:i,className:"visually-hidden",children:u(o,"catalog_search")}),m("div",{className:"flexium-search__field",children:[a("i",{className:"fa fa-search flexium-search__icon","aria-hidden":"true"}),a("input",{id:i,type:"search",className:"form-control flexium-search__input",placeholder:u(o,"catalog_searchplaceholder"),value:s,autoComplete:"off",onChange:e=>d(e.target.value)})]})]})}export{_ as default};
