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
 * Active filters panel: one removable chip per selected option and for the search text.
 *
 * @module     theme_flexium/catalog/ActiveFilters
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { str } from "./utils";
function Chip({ prefix, label, onRemove, strings }) {
  const text = `${prefix}: ${label}`;
  return /* @__PURE__ */ jsxDEV("li", { className: "flexium-chip", children: [
    /* @__PURE__ */ jsxDEV("span", { className: "flexium-chip__prefix", children: [
      prefix,
      ":"
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/ActiveFilters.tsx",
      lineNumber: 53,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("span", { className: "flexium-chip__label", children: label }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/ActiveFilters.tsx",
      lineNumber: 54,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV(
      "button",
      {
        type: "button",
        className: "flexium-chip__remove",
        onClick: onRemove,
        "aria-label": str(strings, "catalog_removefilter", text),
        children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-xmark", "aria-hidden": "true" }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/ActiveFilters.tsx",
          lineNumber: 57,
          columnNumber: 17
        }, this)
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/catalog/ActiveFilters.tsx",
        lineNumber: 55,
        columnNumber: 13
      },
      this
    )
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/ActiveFilters.tsx",
    lineNumber: 52,
    columnNumber: 9
  }, this);
}
__name(Chip, "Chip");
function ActiveFilters({
  search,
  selected,
  grouplabels,
  onRemoveSearch,
  onRemove,
  onClearAll,
  strings
}) {
  if (!search && selected.length === 0) {
    return null;
  }
  const searchlabel = str(strings, "catalog_search");
  return /* @__PURE__ */ jsxDEV("section", { className: "flexium-activefilters", "aria-label": str(strings, "catalog_activefilters"), children: [
    /* @__PURE__ */ jsxDEV("h2", { className: "flexium-activefilters__title", children: str(strings, "catalog_activefilters") }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/ActiveFilters.tsx",
      lineNumber: 72,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("ul", { className: "flexium-activefilters__chips", children: [
      search && /* @__PURE__ */ jsxDEV(Chip, { prefix: searchlabel, label: `\u201C${search}\u201D`, onRemove: onRemoveSearch, strings }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/ActiveFilters.tsx",
        lineNumber: 75,
        columnNumber: 21
      }, this),
      selected.map((option) => /* @__PURE__ */ jsxDEV(
        Chip,
        {
          prefix: grouplabels[option.source] ?? option.source,
          label: option.label,
          onRemove: () => onRemove(option.source, option.value),
          strings
        },
        `${option.source}|${option.value}`,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/ActiveFilters.tsx",
          lineNumber: 78,
          columnNumber: 21
        },
        this
      ))
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/ActiveFilters.tsx",
      lineNumber: 73,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("button", { type: "button", className: "btn btn-link flexium-activefilters__clear", onClick: onClearAll, children: str(strings, "catalog_clearall") }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/ActiveFilters.tsx",
      lineNumber: 87,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/ActiveFilters.tsx",
    lineNumber: 71,
    columnNumber: 9
  }, this);
}
__name(ActiveFilters, "ActiveFilters");
export {
  ActiveFilters as default
};
//# sourceMappingURL=ActiveFilters.dev.js.map
