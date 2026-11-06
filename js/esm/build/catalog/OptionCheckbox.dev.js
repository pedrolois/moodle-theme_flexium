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
 * A filter option checkbox with its faceted course count.
 *
 * @module     theme_flexium/catalog/OptionCheckbox
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useId } from "react";
import { formatNumber } from "./utils";
function OptionCheckbox({ option, onToggle, showcount = true }) {
  const id = useId();
  const empty = option.count === 0 && !option.selected;
  return /* @__PURE__ */ jsxDEV("div", { className: `form-check flexium-option${empty ? " flexium-option--empty" : ""}`, children: [
    /* @__PURE__ */ jsxDEV(
      "input",
      {
        id,
        type: "checkbox",
        className: "form-check-input",
        checked: option.selected,
        disabled: empty,
        onChange: () => onToggle(option.value)
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/catalog/OptionCheckbox.tsx",
        lineNumber: 45,
        columnNumber: 13
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("label", { htmlFor: id, className: "form-check-label flexium-option__label", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "flexium-option__text", children: option.label }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/OptionCheckbox.tsx",
        lineNumber: 54,
        columnNumber: 17
      }, this),
      showcount && /* @__PURE__ */ jsxDEV("span", { className: "flexium-option__count", children: formatNumber(option.count) }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/OptionCheckbox.tsx",
        lineNumber: 55,
        columnNumber: 31
      }, this)
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/OptionCheckbox.tsx",
      lineNumber: 53,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/OptionCheckbox.tsx",
    lineNumber: 44,
    columnNumber: 9
  }, this);
}
__name(OptionCheckbox, "OptionCheckbox");
export {
  OptionCheckbox as default
};
//# sourceMappingURL=OptionCheckbox.dev.js.map
