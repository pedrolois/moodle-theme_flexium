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
 * Debounced catalogue search box.
 *
 * @module     theme_flexium/catalog/SearchBox
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useEffect, useId, useRef, useState } from "react";
import { str } from "./utils";
const DEBOUNCE_MS = 400;
function SearchBox({ value, onSearch, strings }) {
  const id = useId();
  const [text, setText] = useState(value);
  const timer = useRef(void 0);
  useEffect(() => {
    setText(value);
  }, [value]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const submit = /* @__PURE__ */ __name((next) => {
    window.clearTimeout(timer.current);
    if (next.trim() !== value) {
      onSearch(next.trim());
    }
  }, "submit");
  const change = /* @__PURE__ */ __name((next) => {
    setText(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => submit(next), DEBOUNCE_MS);
  }, "change");
  return /* @__PURE__ */ jsxDEV(
    "form",
    {
      role: "search",
      className: "flexium-search",
      onSubmit: (event) => {
        event.preventDefault();
        submit(text);
      },
      children: [
        /* @__PURE__ */ jsxDEV("label", { htmlFor: id, className: "visually-hidden", children: str(strings, "catalog_search") }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/SearchBox.tsx",
          lineNumber: 74,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flexium-search__field", children: [
          /* @__PURE__ */ jsxDEV("i", { className: "fa fa-search flexium-search__icon", "aria-hidden": "true" }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/SearchBox.tsx",
            lineNumber: 76,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV(
            "input",
            {
              id,
              type: "search",
              className: "form-control flexium-search__input",
              placeholder: str(strings, "catalog_searchplaceholder"),
              value: text,
              autoComplete: "off",
              onChange: (event) => change(event.target.value)
            },
            void 0,
            false,
            {
              fileName: "public/theme/flexium/js/esm/src/catalog/SearchBox.tsx",
              lineNumber: 77,
              columnNumber: 17
            },
            this
          )
        ] }, void 0, true, {
          fileName: "public/theme/flexium/js/esm/src/catalog/SearchBox.tsx",
          lineNumber: 75,
          columnNumber: 13
        }, this)
      ]
    },
    void 0,
    true,
    {
      fileName: "public/theme/flexium/js/esm/src/catalog/SearchBox.tsx",
      lineNumber: 66,
      columnNumber: 9
    },
    this
  );
}
__name(SearchBox, "SearchBox");
export {
  SearchBox as default
};
//# sourceMappingURL=SearchBox.dev.js.map
