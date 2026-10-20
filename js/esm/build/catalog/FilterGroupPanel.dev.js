var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { jsxDEV } from "react/jsx-dev-runtime";
/**
 * One collapsible filter group of the catalogue sidebar: a checkbox list or the category tree.
 *
 * Optional features: course counts, options without courses, a search box in long groups, a clear button and
 * remembering whether the group is open. Arrow keys move between the options.
 *
 * @module     theme_flexium/catalog/FilterGroupPanel
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useEffect, useId, useRef, useState } from "react";
import CategoryTree from "@moodle/lms/theme_flexium/catalog/CategoryTree";
import OptionCheckbox from "@moodle/lms/theme_flexium/catalog/OptionCheckbox";
import { normalise, str } from "./utils";
const COLLAPSED_OPTIONS = 8;
const SEARCH_FROM = 8;
const moveFocus = /* @__PURE__ */ __name((event) => {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) || !(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") {
    return;
  }
  const boxes = Array.from(event.currentTarget.querySelectorAll('input[type="checkbox"]:not(:disabled)'));
  const index = boxes.indexOf(event.target);
  const next = {
    ArrowDown: Math.min(boxes.length - 1, index + 1),
    ArrowUp: Math.max(0, index - 1),
    Home: 0,
    End: boxes.length - 1
  }[event.key] ?? index;
  event.preventDefault();
  boxes[next]?.focus();
}, "moveFocus");
function FilterGroupPanel({
  group,
  onToggle,
  onClear,
  strings,
  bulk,
  features,
  savedopen,
  onOpenChange,
  onOpenState
}) {
  const bodyid = useId();
  const [open, setOpen] = useState(savedopen ?? group.expanded);
  const [showall, setShowall] = useState(false);
  const [filter, setFilter] = useState("");
  const selectedcount = group.options.filter((option) => option.selected).length;
  const firstbulk = useRef(bulk);
  useEffect(() => {
    if (selectedcount > 0) {
      setOpen(true);
    }
  }, [selectedcount]);
  useEffect(() => {
    if (bulk && bulk !== firstbulk.current) {
      setOpen(bulk.open);
    }
  }, [bulk]);
  useEffect(() => {
    onOpenState(group.source, open);
  }, [open]);
  const toggleOpen = /* @__PURE__ */ __name(() => {
    setOpen(!open);
    onOpenChange(group.source, !open);
  }, "toggleOpen");
  const shown = features.showemptyoptions ? group.options : group.options.filter((option) => option.count > 0 || option.selected);
  const needle = normalise(filter.trim());
  const matching = needle ? shown.filter((option) => normalise(option.label).includes(needle)) : shown;
  const options = group.type === "list" && !showall && !needle ? matching.slice(0, COLLAPSED_OPTIONS) : matching;
  const searchable = features.groupsearch && shown.length > SEARCH_FROM;
  return /* @__PURE__ */ jsxDEV("section", { className: "flexium-filtergroup", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-filtergroup__header", children: [
      /* @__PURE__ */ jsxDEV("h3", { className: "flexium-filtergroup__heading", children: /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          className: "flexium-filtergroup__toggle",
          "aria-expanded": open,
          "aria-controls": bodyid,
          onClick: toggleOpen,
          children: [
            /* @__PURE__ */ jsxDEV("span", { className: "flexium-filtergroup__label", children: group.label }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/catalog/FilterGroupPanel.tsx",
              lineNumber: 129,
              columnNumber: 25
            }, this),
            selectedcount > 0 && /* @__PURE__ */ jsxDEV("span", { className: "flexium-filtergroup__count", children: selectedcount }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/catalog/FilterGroupPanel.tsx",
              lineNumber: 131,
              columnNumber: 29
            }, this),
            /* @__PURE__ */ jsxDEV(
              "i",
              {
                className: `fa fa-chevron-${open ? "up" : "down"} flexium-filtergroup__chevron`,
                "aria-hidden": "true"
              },
              void 0,
              false,
              {
                fileName: "public/theme/flexium/js/esm/src/catalog/FilterGroupPanel.tsx",
                lineNumber: 133,
                columnNumber: 25
              },
              this
            )
          ]
        },
        void 0,
        true,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/FilterGroupPanel.tsx",
          lineNumber: 122,
          columnNumber: 21
        },
        this
      ) }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/FilterGroupPanel.tsx",
        lineNumber: 121,
        columnNumber: 17
      }, this),
      features.groupclear && selectedcount > 0 && /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          className: "flexium-filtergroup__clear",
          "aria-label": str(strings, "catalog_clearoptions", group.label),
          title: str(
            strings,
            "catalog_clearoptions",
            group.label
          ),
          onClick: () => onClear(group.source),
          children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-eraser", "aria-hidden": "true" }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/FilterGroupPanel.tsx",
            lineNumber: 141,
            columnNumber: 25
          }, this)
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/FilterGroupPanel.tsx",
          lineNumber: 138,
          columnNumber: 21
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/FilterGroupPanel.tsx",
      lineNumber: 120,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { id: bodyid, className: "flexium-filtergroup__body", hidden: !open, onKeyDown: moveFocus, children: [
      searchable && /* @__PURE__ */ jsxDEV("div", { className: "flexium-filtergroup__search", children: [
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-magnifying-glass", "aria-hidden": "true" }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/FilterGroupPanel.tsx",
          lineNumber: 148,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ jsxDEV(
          "input",
          {
            type: "search",
            className: "form-control form-control-sm",
            value: filter,
            placeholder: str(strings, "catalog_filteroptions", group.label),
            "aria-label": str(strings, "catalog_filteroptions", group.label),
            onChange: (event) => setFilter(event.target.value)
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/catalog/FilterGroupPanel.tsx",
            lineNumber: 149,
            columnNumber: 25
          },
          this
        )
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/FilterGroupPanel.tsx",
        lineNumber: 147,
        columnNumber: 21
      }, this),
      matching.length === 0 && /* @__PURE__ */ jsxDEV("p", { className: "flexium-filtergroup__empty", children: str(strings, "catalog_nooptions") }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/FilterGroupPanel.tsx",
        lineNumber: 156,
        columnNumber: 21
      }, this),
      group.type === "tree" ? /* @__PURE__ */ jsxDEV(
        CategoryTree,
        {
          options: shown,
          onToggle: (value) => onToggle(group.source, value),
          strings,
          bulk,
          showcount: features.optioncounts,
          filter: searchable ? filter : ""
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/FilterGroupPanel.tsx",
          lineNumber: 159,
          columnNumber: 21
        },
        this
      ) : /* @__PURE__ */ jsxDEV("ul", { className: "flexium-optionlist", children: options.map((option) => /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(
        OptionCheckbox,
        {
          option,
          onToggle: (value) => onToggle(group.source, value),
          showcount: features.optioncounts
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/FilterGroupPanel.tsx",
          lineNumber: 171,
          columnNumber: 33
        },
        this
      ) }, option.value, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/FilterGroupPanel.tsx",
        lineNumber: 170,
        columnNumber: 29
      }, this)) }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/FilterGroupPanel.tsx",
        lineNumber: 168,
        columnNumber: 21
      }, this),
      group.type === "list" && !needle && matching.length > COLLAPSED_OPTIONS && /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          className: "btn btn-link btn-sm flexium-filtergroup__more",
          onClick: () => setShowall(!showall),
          children: showall ? str(strings, "catalog_showless") : str(strings, "catalog_showmore", matching.length)
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/FilterGroupPanel.tsx",
          lineNumber: 178,
          columnNumber: 21
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/FilterGroupPanel.tsx",
      lineNumber: 145,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/FilterGroupPanel.tsx",
    lineNumber: 119,
    columnNumber: 9
  }, this);
}
__name(FilterGroupPanel, "FilterGroupPanel");
export {
  FilterGroupPanel as default
};
//# sourceMappingURL=FilterGroupPanel.dev.js.map
