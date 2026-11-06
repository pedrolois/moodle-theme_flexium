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
 * Results footer, centred: "Showing 13–24 of 45 courses", pagination and the courses per page selector.
 *
 * The selector is shown to visitors when the site allows it; in edit mode (site administrators) it sets the
 * default for everyone, together with the "Let visitors change it" option.
 *
 * @module     theme_flexium/catalog/CatalogFooter
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useId } from "react";
import { Pagination } from "@moodlehq/design-system";
import { formatNumber, str } from "./utils";
function CatalogFooter({
  total,
  page,
  perpage,
  perpageoptions,
  showperpage,
  onPageChange,
  onPerpageChange,
  strings,
  editoptions,
  onEditOptions,
  editorstrings
}) {
  const id = useId();
  const pages = Math.max(1, Math.ceil(total / perpage));
  const from = total ? page * perpage + 1 : 0;
  const to = Math.min(total, (page + 1) * perpage);
  const showing = str(strings, "catalog_showing").replace("{from}", formatNumber(from)).replace("{to}", formatNumber(to)).replace("{total}", formatNumber(total));
  return /* @__PURE__ */ jsxDEV("footer", { className: "flexium-catalogfooter", children: [
    total > 0 && /* @__PURE__ */ jsxDEV("p", { className: "flexium-catalogfooter__showing", children: showing }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CatalogFooter.tsx",
      lineNumber: 66,
      columnNumber: 27
    }, this),
    pages > 1 && // First and last page buttons around the design system pagination.
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-catalogfooter__pager", children: [
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          className: "flexium-catalogfooter__edge",
          disabled: page === 0,
          "aria-label": str(strings, "catalog_firstpage"),
          title: str(strings, "catalog_firstpage"),
          onClick: () => onPageChange(0),
          children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-angles-left", "aria-hidden": "true" }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/CatalogFooter.tsx",
            lineNumber: 74,
            columnNumber: 25
          }, this)
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/CatalogFooter.tsx",
          lineNumber: 71,
          columnNumber: 21
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        Pagination,
        {
          className: "flexium-catalogfooter__pagination",
          totalPages: pages,
          currentPage: page + 1,
          onPageChange: (next) => onPageChange(next - 1),
          previousPageLabel: str(strings, "catalog_previous"),
          nextPageLabel: str(strings, "catalog_next"),
          pageLabelFormatter: (number) => str(strings, "catalog_page", number)
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/CatalogFooter.tsx",
          lineNumber: 76,
          columnNumber: 21
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          className: "flexium-catalogfooter__edge",
          disabled: page === pages - 1,
          "aria-label": str(strings, "catalog_lastpage"),
          title: str(strings, "catalog_lastpage"),
          onClick: () => onPageChange(pages - 1),
          children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-angles-right", "aria-hidden": "true" }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/CatalogFooter.tsx",
            lineNumber: 88,
            columnNumber: 25
          }, this)
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/CatalogFooter.tsx",
          lineNumber: 85,
          columnNumber: 21
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CatalogFooter.tsx",
      lineNumber: 70,
      columnNumber: 17
    }, this),
    editoptions && onEditOptions && editorstrings ? /* @__PURE__ */ jsxDEV("div", { className: "flexium-catalogfooter__perpage flexium-catalogfooter__perpage--editing", children: [
      /* @__PURE__ */ jsxDEV("label", { htmlFor: `${id}-perpage`, children: str(editorstrings, "editor_perpage") }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/CatalogFooter.tsx",
        lineNumber: 95,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV(
        "select",
        {
          id: `${id}-perpage`,
          className: "form-select form-select-sm",
          value: editoptions.perpage,
          onChange: (event) => onEditOptions({ ...editoptions, perpage: Number(event.target.value) }),
          children: perpageoptions.map((option) => /* @__PURE__ */ jsxDEV("option", { value: option, children: option }, option, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/CatalogFooter.tsx",
            lineNumber: 98,
            columnNumber: 55
          }, this))
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/CatalogFooter.tsx",
          lineNumber: 96,
          columnNumber: 21
        },
        this
      ),
      /* @__PURE__ */ jsxDEV("div", { className: "form-check form-switch m-0", children: [
        /* @__PURE__ */ jsxDEV(
          "input",
          {
            id: `${id}-userperpage`,
            type: "checkbox",
            role: "switch",
            className: "form-check-input",
            checked: editoptions.userperpage,
            onChange: (event) => onEditOptions({ ...editoptions, userperpage: event.target.checked })
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/catalog/CatalogFooter.tsx",
            lineNumber: 101,
            columnNumber: 25
          },
          this
        ),
        /* @__PURE__ */ jsxDEV("label", { htmlFor: `${id}-userperpage`, className: "form-check-label", children: str(editorstrings, "editor_userperpage") }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/CatalogFooter.tsx",
          lineNumber: 104,
          columnNumber: 25
        }, this)
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/CatalogFooter.tsx",
        lineNumber: 100,
        columnNumber: 21
      }, this)
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CatalogFooter.tsx",
      lineNumber: 94,
      columnNumber: 17
    }, this) : showperpage && total > 0 && /* @__PURE__ */ jsxDEV("div", { className: "flexium-catalogfooter__perpage", children: [
      /* @__PURE__ */ jsxDEV("label", { htmlFor: `${id}-perpage`, children: str(strings, "catalog_perpage") }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/CatalogFooter.tsx",
        lineNumber: 111,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV(
        "select",
        {
          id: `${id}-perpage`,
          className: "form-select form-select-sm",
          value: perpage,
          onChange: (event) => onPerpageChange(Number(event.target.value)),
          children: perpageoptions.map((option) => /* @__PURE__ */ jsxDEV("option", { value: option, children: option }, option, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/CatalogFooter.tsx",
            lineNumber: 114,
            columnNumber: 55
          }, this))
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/CatalogFooter.tsx",
          lineNumber: 112,
          columnNumber: 21
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CatalogFooter.tsx",
      lineNumber: 110,
      columnNumber: 17
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/CatalogFooter.tsx",
    lineNumber: 65,
    columnNumber: 9
  }, this);
}
__name(CatalogFooter, "CatalogFooter");
export {
  CatalogFooter as default
};
//# sourceMappingURL=CatalogFooter.dev.js.map
