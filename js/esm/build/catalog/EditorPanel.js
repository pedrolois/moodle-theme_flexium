import{useId as c}from"react";import{str as i}from"./utils";import{jsx as o,jsxs as t}from"react/jsx-runtime";/*
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
 * Catalogue editor bar (edit mode, site administrators): how to edit (magic wands on the page), every option at
 * once, and Save / Discard for the whole catalogue layout.
 *
 * @module     theme_flexium/catalog/EditorPanel
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */function u({editor:n,dirty:s,status:a,onSave:d,onReset:l,onAllSettings:m}){const r=c(),e=n.strings;return o("section",{className:"flexium-editor","aria-labelledby":`${r}-title`,children:t("div",{className:"flexium-editor__header",children:[t("div",{children:[t("h2",{id:`${r}-title`,className:"flexium-editor__title",children:[o("i",{className:"fa fa-pen-to-square me-2","aria-hidden":"true"}),i(e,"editor_title")]}),t("p",{className:"flexium-editor__help",children:[i(e,"editor_help"),o("i",{className:"fa fa-wand-magic-sparkles flexium-editor__wandhint","aria-hidden":"true"})]})]}),t("div",{className:"flexium-editor__actions",children:[t("span",{className:"flexium-editor__status",role:"status",children:[a==="saving"&&i(e,"editor_saving"),a==="saved"&&!s&&i(e,"editor_saved"),a==="error"&&i(e,"editor_error"),a!=="saving"&&s&&i(e,"editor_unsaved")]}),t("button",{type:"button",className:"btn btn-outline-primary","data-action":"allsettings",onClick:m,children:[o("i",{className:"fa fa-sliders me-2","aria-hidden":"true"}),i(e,"editzone_all")]}),o("button",{type:"button",className:"btn btn-outline-secondary","data-action":"discard",disabled:!s||a==="saving",onClick:l,children:i(e,"editor_reset")}),o("button",{type:"button",className:"btn btn-primary","data-action":"save",disabled:!s||a==="saving",onClick:d,children:i(e,"editor_save")})]})]})})}export{u as default};
