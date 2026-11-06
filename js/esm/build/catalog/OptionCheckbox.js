import{useId as n}from"react";import{formatNumber as s}from"./utils";import{jsx as o,jsxs as c}from"react/jsx-runtime";/*
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
 * A filter option checkbox with its faceted course count.
 *
 * @module     theme_flexium/catalog/OptionCheckbox
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */function m({option:e,onToggle:a,showcount:i=!0}){const t=n(),l=e.count===0&&!e.selected;return c("div",{className:`form-check flexium-option${l?" flexium-option--empty":""}`,children:[o("input",{id:t,type:"checkbox",className:"form-check-input",checked:e.selected,disabled:l,onChange:()=>a(e.value)}),c("label",{htmlFor:t,className:"form-check-label flexium-option__label",children:[o("span",{className:"flexium-option__text",children:e.label}),i&&o("span",{className:"flexium-option__count",children:s(e.count)})]})]})}export{m as default};
