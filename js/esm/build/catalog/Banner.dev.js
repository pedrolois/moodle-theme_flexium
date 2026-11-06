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
 * Catalogue header (feature "Catalogue header"): title and text over one of the theme's header images.
 *
 * @module     theme_flexium/catalog/Banner
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { str } from "./utils";
function Banner({ title, text, image, strings }) {
  return /* @__PURE__ */ jsxDEV("header", { className: "flexium-banner", style: { backgroundImage: image ? `url("${image}")` : void 0 }, children: [
    /* @__PURE__ */ jsxDEV("h2", { className: "flexium-banner__title", children: title || str(strings, "catalog_bannertitle") }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/Banner.tsx",
      lineNumber: 41,
      columnNumber: 13
    }, this),
    text && /* @__PURE__ */ jsxDEV("p", { className: "flexium-banner__text", children: text }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/Banner.tsx",
      lineNumber: 42,
      columnNumber: 22
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/Banner.tsx",
    lineNumber: 40,
    columnNumber: 9
  }, this);
}
__name(Banner, "Banner");
export {
  Banner as default
};
//# sourceMappingURL=Banner.dev.js.map
