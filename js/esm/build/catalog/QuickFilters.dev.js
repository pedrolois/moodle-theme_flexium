var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { jsxDEV } from "react/jsx-dev-runtime";
/**
 * Quick filters (feature "Quick filters"): toggle buttons for frequent searches, in the order chosen by the admin.
 * "My courses" and "Favourites" are only offered to logged in users.
 *
 * @module     theme_flexium/catalog/QuickFilters
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { formatNumber, str } from "./utils";
const PERSONAL = ["mycourses", "favourites"];
const parseLabels = /* @__PURE__ */ __name((json) => {
  try {
    const parsed = JSON.parse(json || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}, "parseLabels");
function QuickFilters({
  keys,
  quick,
  selected,
  loggedin,
  icons,
  onToggle,
  showcount,
  strings,
  labels
}) {
  const names = parseLabels(labels);
  const shown = keys.filter((key) => loggedin || !PERSONAL.includes(key));
  if (!shown.length) {
    return null;
  }
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-quickfilters", role: "group", "aria-label": str(strings, "catalog_quickfilters"), children: shown.map((key) => {
    const active = selected.includes(key);
    const count = quick.find((item) => item.key === key)?.count;
    return /* @__PURE__ */ jsxDEV(
      "button",
      {
        type: "button",
        "aria-pressed": active,
        className: `flexium-quickfilter${active ? " flexium-quickfilter--active" : ""}`,
        disabled: !active && count === 0,
        onClick: () => onToggle(key),
        children: [
          /* @__PURE__ */ jsxDEV("i", { className: `${icons[key] ?? "fa fa-filter"} me-1`, "aria-hidden": "true" }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/QuickFilters.tsx",
            lineNumber: 76,
            columnNumber: 25
          }, this),
          names[key] || str(strings, `quick_${key}`),
          showcount && count !== void 0 && /* @__PURE__ */ jsxDEV("span", { className: "flexium-quickfilter__count", children: formatNumber(count) }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/QuickFilters.tsx",
            lineNumber: 79,
            columnNumber: 29
          }, this)
        ]
      },
      key,
      true,
      {
        fileName: "public/theme/flexium/js/esm/src/catalog/QuickFilters.tsx",
        lineNumber: 73,
        columnNumber: 21
      },
      this
    );
  }) }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/catalog/QuickFilters.tsx",
    lineNumber: 68,
    columnNumber: 9
  }, this);
}
__name(QuickFilters, "QuickFilters");
export {
  QuickFilters as default,
  parseLabels
};
//# sourceMappingURL=QuickFilters.dev.js.map
