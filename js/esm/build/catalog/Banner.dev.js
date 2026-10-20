var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { jsxDEV } from "react/jsx-dev-runtime";
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
      lineNumber: 37,
      columnNumber: 13
    }, this),
    text && /* @__PURE__ */ jsxDEV("p", { className: "flexium-banner__text", children: text }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/Banner.tsx",
      lineNumber: 38,
      columnNumber: 22
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/Banner.tsx",
    lineNumber: 36,
    columnNumber: 9
  }, this);
}
__name(Banner, "Banner");
export {
  Banner as default
};
//# sourceMappingURL=Banner.dev.js.map
