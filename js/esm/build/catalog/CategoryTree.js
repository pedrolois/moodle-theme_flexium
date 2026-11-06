import{useEffect as y,useMemo as v,useState as C}from"react";import N from"@moodle/lms/theme_flexium/catalog/OptionCheckbox";import{normalise as T,str as O}from"./utils";import{jsx as r,jsxs as b}from"react/jsx-runtime";/*
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
 * Category and subcategory tree with checkboxes and subtree course counts.
 *
 * @module     theme_flexium/catalog/CategoryTree
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */const k=o=>{const n=new Map;o.forEach(e=>n.set(e.value,{option:e,children:[]}));const c=[];return n.forEach(e=>{const a=e.option.parent?n.get(e.option.parent):void 0;(a?a.children:c).push(e)}),c},x=o=>o.option.selected||o.children.some(x);function E({options:o,onToggle:n,strings:c,bulk:e,showcount:a,filter:_}){const p=v(()=>k(o),[o]),[d,m]=C({});y(()=>{if(e){const l={};o.forEach(t=>{t.parent&&(l[t.parent]=e.open)}),m(l)}},[e]);const f=(l,t)=>r("ul",{className:t===0?"flexium-tree":"flexium-tree__children",children:l.map(i=>{const u=i.option.value,h=i.children.length>0,s=d[u]??i.children.some(x);return b("li",{className:"flexium-tree__item",children:[b("div",{className:"flexium-tree__row",children:[h?r("button",{type:"button",className:"flexium-tree__toggle","aria-expanded":s,"aria-label":O(c,s?"catalog_collapse":"catalog_expand",i.option.label),onClick:()=>m({...d,[u]:!s}),children:r("i",{className:`fa fa-${s?"minus":"plus"}`,"aria-hidden":"true"})}):r("span",{className:"flexium-tree__spacer","aria-hidden":"true"}),r(N,{option:i.option,onToggle:n,showcount:a})]}),h&&s&&f(i.children,t+1)]},u)})}),g=T(_.trim());if(g){const l=o.filter(t=>T(t.label).includes(g));return r("ul",{className:"flexium-optionlist",children:l.map(t=>r("li",{children:r(N,{option:t,onToggle:n,showcount:a})},t.value))})}return p.length?f(p,0):null}export{E as default};
