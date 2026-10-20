import{str as s}from"./utils";import{jsx as r,jsxs as l}from"react/jsx-runtime";/**
 * Catalogue header (feature "Catalogue header"): title and text over one of the theme's header images.
 *
 * @module     theme_flexium/catalog/Banner
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */function i({title:t,text:e,image:n,strings:a}){return l("header",{className:"flexium-banner",style:{backgroundImage:n?`url("${n}")`:void 0},children:[r("h2",{className:"flexium-banner__title",children:t||s(a,"catalog_bannertitle")}),e&&r("p",{className:"flexium-banner__text",children:e})]})}export{i as default};
