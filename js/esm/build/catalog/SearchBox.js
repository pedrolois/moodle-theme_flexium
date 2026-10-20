import{useEffect as l,useId as h,useRef as p,useState as g}from"react";import{str as u}from"./utils";import{jsx as a,jsxs as m}from"react/jsx-runtime";/**
 * Debounced catalogue search box.
 *
 * @module     theme_flexium/catalog/SearchBox
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */const S=400;function _({value:r,onSearch:f,strings:o}){const i=h(),[s,c]=g(r),t=p(void 0);l(()=>{c(r)},[r]),l(()=>()=>window.clearTimeout(t.current),[]);const n=e=>{window.clearTimeout(t.current),e.trim()!==r&&f(e.trim())},d=e=>{c(e),window.clearTimeout(t.current),t.current=window.setTimeout(()=>n(e),S)};return m("form",{role:"search",className:"flexium-search",onSubmit:e=>{e.preventDefault(),n(s)},children:[a("label",{htmlFor:i,className:"visually-hidden",children:u(o,"catalog_search")}),m("div",{className:"flexium-search__field",children:[a("i",{className:"fa fa-search flexium-search__icon","aria-hidden":"true"}),a("input",{id:i,type:"search",className:"form-control flexium-search__input",placeholder:u(o,"catalog_searchplaceholder"),value:s,autoComplete:"off",onChange:e=>d(e.target.value)})]})]})}export{_ as default};
