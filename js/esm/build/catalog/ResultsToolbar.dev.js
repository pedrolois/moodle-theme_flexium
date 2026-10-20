var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { jsxDEV } from "react/jsx-dev-runtime";
/**
 * Toolbar above the results: number of courses, share link, grid / list switch and sort order.
 *
 * @module     theme_flexium/catalog/ResultsToolbar
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useId, useState } from "react";
import { EditZone } from "@moodle/lms/theme_flexium/catalog/EditZones";
import { formatNumber, str } from "./utils";
const copyLink = /* @__PURE__ */ __name(async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    return true;
  } catch {
    window.prompt("", window.location.href);
    return false;
  }
}, "copyLink");
function ResultsToolbar({
  total,
  features,
  view,
  onViewChange,
  sort,
  sorts,
  onSortChange,
  strings
}) {
  const sortid = useId();
  const [copied, setCopied] = useState("");
  const share = /* @__PURE__ */ __name(async () => {
    if (await copyLink()) {
      setCopied(str(strings, "catalog_linkcopied"));
      window.setTimeout(() => setCopied(""), 3e3);
    }
  }, "share");
  let totaltext = "";
  if (total !== null) {
    totaltext = total === 1 ? str(strings, "catalog_result") : str(strings, "catalog_results", formatNumber(total));
  }
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-catalog__toolbar", children: [
    /* @__PURE__ */ jsxDEV("p", { className: "flexium-catalog__total", "aria-live": "polite", children: totaltext }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/ResultsToolbar.tsx",
      lineNumber: 75,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-catalog__tools", children: [
      features.sharelink && /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          className: "btn btn-outline-secondary btn-sm flexium-catalog__share",
          onClick: share,
          title: str(strings, "catalog_sharelink"),
          children: [
            /* @__PURE__ */ jsxDEV("i", { className: "fa fa-link", "aria-hidden": "true" }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/catalog/ResultsToolbar.tsx",
              lineNumber: 80,
              columnNumber: 25
            }, this),
            /* @__PURE__ */ jsxDEV("span", { className: "visually-hidden", children: str(strings, "catalog_sharelink") }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/catalog/ResultsToolbar.tsx",
              lineNumber: 81,
              columnNumber: 25
            }, this)
          ]
        },
        void 0,
        true,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/ResultsToolbar.tsx",
          lineNumber: 78,
          columnNumber: 21
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(EditZone, { zone: "views", className: "flexium-editzone--padded flexium-editzone--views", children: features.viewswitch && /* @__PURE__ */ jsxDEV(
        "div",
        {
          className: "btn-group btn-group-sm flexium-catalog__views",
          role: "group",
          "aria-label": str(strings, "catalog_view"),
          children: ["grid", "list"].map((key) => /* @__PURE__ */ jsxDEV(
            "button",
            {
              type: "button",
              "aria-pressed": view === key,
              className: `btn btn-outline-secondary${view === key ? " active" : ""}`,
              title: str(strings, `catalog_view${key}`),
              onClick: () => onViewChange(key),
              children: [
                /* @__PURE__ */ jsxDEV("i", { className: `fa ${key === "grid" ? "fa-table-cells-large" : "fa-list"}`, "aria-hidden": "true" }, void 0, false, {
                  fileName: "public/theme/flexium/js/esm/src/catalog/ResultsToolbar.tsx",
                  lineNumber: 92,
                  columnNumber: 33
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: "visually-hidden", children: str(strings, `catalog_view${key}`) }, void 0, false, {
                  fileName: "public/theme/flexium/js/esm/src/catalog/ResultsToolbar.tsx",
                  lineNumber: 93,
                  columnNumber: 33
                }, this)
              ]
            },
            key,
            true,
            {
              fileName: "public/theme/flexium/js/esm/src/catalog/ResultsToolbar.tsx",
              lineNumber: 89,
              columnNumber: 29
            },
            this
          ))
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/ResultsToolbar.tsx",
          lineNumber: 86,
          columnNumber: 21
        },
        this
      ) }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/ResultsToolbar.tsx",
        lineNumber: 84,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flexium-catalog__sort", children: [
        /* @__PURE__ */ jsxDEV("label", { htmlFor: sortid, className: "flexium-catalog__sortlabel", children: str(strings, "catalog_sortby") }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/ResultsToolbar.tsx",
          lineNumber: 100,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV("select", { id: sortid, className: "form-select", value: sort, onChange: (event) => onSortChange(event.target.value), children: sorts.map((option) => /* @__PURE__ */ jsxDEV("option", { value: option.value, children: option.label }, option.value, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/ResultsToolbar.tsx",
          lineNumber: 102,
          columnNumber: 46
        }, this)) }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/ResultsToolbar.tsx",
          lineNumber: 101,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/ResultsToolbar.tsx",
        lineNumber: 99,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/ResultsToolbar.tsx",
      lineNumber: 76,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "visually-hidden", role: "status", children: copied }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/ResultsToolbar.tsx",
      lineNumber: 106,
      columnNumber: 13
    }, this),
    copied && /* @__PURE__ */ jsxDEV("div", { className: "flexium-catalog__toast", "aria-hidden": "true", children: copied }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/ResultsToolbar.tsx",
      lineNumber: 107,
      columnNumber: 24
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/ResultsToolbar.tsx",
    lineNumber: 74,
    columnNumber: 9
  }, this);
}
__name(ResultsToolbar, "ResultsToolbar");
export {
  ResultsToolbar as default
};
//# sourceMappingURL=ResultsToolbar.dev.js.map
