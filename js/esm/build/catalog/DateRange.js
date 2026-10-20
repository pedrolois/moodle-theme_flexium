import{useId as m}from"react";import{str as i}from"./utils";import{jsx as e,jsxs as a}from"react/jsx-runtime";/**
 * Start date filter (feature "Start date filter"): courses starting between two dates, both optional.
 *
 * @module     theme_flexium/catalog/DateRange
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */function s({from:l,to:r,onChange:d,strings:n}){const t=m();return a("fieldset",{className:"flexium-daterange",children:[a("legend",{className:"flexium-daterange__legend",children:[e("i",{className:"fa-regular fa-calendar me-2","aria-hidden":"true"}),i(n,"catalog_daterange")]}),a("div",{className:"flexium-daterange__fields",children:[a("div",{children:[e("label",{htmlFor:`${t}-from`,className:"flexium-daterange__label",children:i(n,"catalog_startfrom")}),e("input",{id:`${t}-from`,type:"date",className:"form-control form-control-sm",value:l,max:r||void 0,onChange:o=>d(o.target.value,r)})]}),a("div",{children:[e("label",{htmlFor:`${t}-to`,className:"flexium-daterange__label",children:i(n,"catalog_startto")}),e("input",{id:`${t}-to`,type:"date",className:"form-control form-control-sm",value:r,min:l||void 0,onChange:o=>d(l,o.target.value)})]})]})]})}export{s as default};
