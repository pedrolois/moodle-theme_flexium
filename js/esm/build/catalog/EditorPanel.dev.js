var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { jsxDEV } from "react/jsx-dev-runtime";
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
          lineNumber: 48,
          columnNumber: 25
        }, this),
        str(strings, "editor_title")
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
        lineNumber: 47,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "flexium-editor__help", children: [
        str(strings, "editor_help"),
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-wand-magic-sparkles flexium-editor__wandhint", "aria-hidden": "true" }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
          lineNumber: 53,
          columnNumber: 25
        }, this)
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
        lineNumber: 51,
        columnNumber: 21
      }, this)
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
      lineNumber: 46,
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
        lineNumber: 57,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("button", { type: "button", className: "btn btn-outline-primary", "data-action": "allsettings", onClick: onAllSettings, children: [
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-sliders me-2", "aria-hidden": "true" }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
          lineNumber: 64,
          columnNumber: 25
        }, this),
        str(strings, "editzone_all")
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
        lineNumber: 63,
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
          lineNumber: 67,
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
          lineNumber: 71,
          columnNumber: 21
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
      lineNumber: 56,
      columnNumber: 17
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
    lineNumber: 45,
    columnNumber: 13
  }, this) }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/catalog/EditorPanel.tsx",
    lineNumber: 44,
    columnNumber: 9
  }, this);
}
__name(EditorPanel, "EditorPanel");
export {
  EditorPanel as default
};
//# sourceMappingURL=EditorPanel.dev.js.map
