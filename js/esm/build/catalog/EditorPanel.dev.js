var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { jsxDEV } from "react/jsx-dev-runtime";
/*
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
 */
/**
 * Catalogue editor bar (edit mode, site administrators): how to edit (magic wands on the page), every option at
 * once, and Save / Discard for the whole catalogue layout.
 *
 * @module     theme_flexium/catalog/EditorPanel
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useId } from "react";
import { str } from "./utils";
function EditorPanel({ editor, dirty, status, onSave, onReset, onAllSettings }) {
  const id = useId();
  const strings = editor.strings;
  return /* @__PURE__ */ jsxDEV("section", { className: "flexium-editor", "aria-labelledby": `${id}-title`, children: /* @__PURE__ */ jsxDEV("div", { className: "flexium-editor__header", children: [
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("h2", { id: `${id}-title`, className: "flexium-editor__title", children: [
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-pen-to-square me-2", "aria-hidden": "true" }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
          lineNumber: 52,
          columnNumber: 25
        }, this),
        str(strings, "editor_title")
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
        lineNumber: 51,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "flexium-editor__help", children: [
        str(strings, "editor_help"),
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-wand-magic-sparkles flexium-editor__wandhint", "aria-hidden": "true" }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
          lineNumber: 57,
          columnNumber: 25
        }, this)
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
        lineNumber: 55,
        columnNumber: 21
      }, this)
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
      lineNumber: 50,
      columnNumber: 17
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-editor__actions", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "flexium-editor__status", role: "status", children: [
        status === "saving" && str(strings, "editor_saving"),
        status === "saved" && !dirty && str(strings, "editor_saved"),
        status === "error" && str(strings, "editor_error"),
        status !== "saving" && dirty && str(strings, "editor_unsaved")
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
        lineNumber: 61,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("button", { type: "button", className: "btn btn-outline-primary", "data-action": "allsettings", onClick: onAllSettings, children: [
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-sliders me-2", "aria-hidden": "true" }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
          lineNumber: 68,
          columnNumber: 25
        }, this),
        str(strings, "editzone_all")
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
        lineNumber: 67,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          className: "btn btn-outline-secondary",
          "data-action": "discard",
          disabled: !dirty || status === "saving",
          onClick: onReset,
          children: str(strings, "editor_reset")
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
          lineNumber: 71,
          columnNumber: 21
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          className: "btn btn-primary",
          "data-action": "save",
          disabled: !dirty || status === "saving",
          onClick: onSave,
          children: str(strings, "editor_save")
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
          lineNumber: 75,
          columnNumber: 21
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
      lineNumber: 60,
      columnNumber: 17
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
    lineNumber: 49,
    columnNumber: 13
  }, this) }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
    lineNumber: 48,
    columnNumber: 9
  }, this);
}
__name(EditorPanel, "EditorPanel");
export {
  EditorPanel as default
};
//# sourceMappingURL=EditorPanel.dev.js.map
