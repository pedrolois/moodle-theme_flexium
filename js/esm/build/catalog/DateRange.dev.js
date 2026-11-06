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
 * Start date filter (feature "Start date filter"): courses starting between two dates, both optional.
 *
 * @module     theme_flexium/catalog/DateRange
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useId } from "react";
import { str } from "./utils";
function DateRange({ from, to, onChange, strings }) {
  const id = useId();
  return /* @__PURE__ */ jsxDEV("fieldset", { className: "flexium-daterange", children: [
    /* @__PURE__ */ jsxDEV("legend", { className: "flexium-daterange__legend", children: [
      /* @__PURE__ */ jsxDEV("i", { className: "fa-regular fa-calendar me-2", "aria-hidden": "true" }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/DateRange.tsx",
        lineNumber: 45,
        columnNumber: 17
      }, this),
      str(strings, "catalog_daterange")
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/DateRange.tsx",
      lineNumber: 44,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-daterange__fields", children: [
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("label", { htmlFor: `${id}-from`, className: "flexium-daterange__label", children: str(strings, "catalog_startfrom") }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/DateRange.tsx",
          lineNumber: 50,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV(
          "input",
          {
            id: `${id}-from`,
            type: "date",
            className: "form-control form-control-sm",
            value: from,
            max: to || void 0,
            onChange: (event) => onChange(event.target.value, to)
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/catalog/DateRange.tsx",
            lineNumber: 53,
            columnNumber: 21
          },
          this
        )
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/DateRange.tsx",
        lineNumber: 49,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("label", { htmlFor: `${id}-to`, className: "flexium-daterange__label", children: str(strings, "catalog_startto") }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/DateRange.tsx",
          lineNumber: 57,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV(
          "input",
          {
            id: `${id}-to`,
            type: "date",
            className: "form-control form-control-sm",
            value: to,
            min: from || void 0,
            onChange: (event) => onChange(from, event.target.value)
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/catalog/DateRange.tsx",
            lineNumber: 60,
            columnNumber: 21
          },
          this
        )
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/DateRange.tsx",
        lineNumber: 56,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/DateRange.tsx",
      lineNumber: 48,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/DateRange.tsx",
    lineNumber: 43,
    columnNumber: 9
  }, this);
}
__name(DateRange, "DateRange");
export {
  DateRange as default
};
//# sourceMappingURL=DateRange.dev.js.map
