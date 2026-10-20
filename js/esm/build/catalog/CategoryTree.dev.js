var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { jsxDEV } from "react/jsx-dev-runtime";
/**
 * Category and subcategory tree with checkboxes and subtree course counts.
 *
 * @module     theme_flexium/catalog/CategoryTree
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useEffect, useMemo, useState } from "react";
import OptionCheckbox from "@moodle/lms/theme_flexium/catalog/OptionCheckbox";
import { normalise, str } from "./utils";
const buildTree = /* @__PURE__ */ __name((options) => {
  const nodes = /* @__PURE__ */ new Map();
  options.forEach((option) => nodes.set(option.value, { option, children: [] }));
  const roots = [];
  nodes.forEach((node) => {
    const parent = node.option.parent ? nodes.get(node.option.parent) : void 0;
    (parent ? parent.children : roots).push(node);
  });
  return roots;
}, "buildTree");
const hasSelection = /* @__PURE__ */ __name((node) => node.option.selected || node.children.some(hasSelection), "hasSelection");
function CategoryTree({ options, onToggle, strings, bulk, showcount, filter }) {
  const roots = useMemo(() => buildTree(options), [options]);
  const [expanded, setExpanded] = useState({});
  useEffect(() => {
    if (bulk) {
      const all = {};
      options.forEach((option) => {
        if (option.parent) {
          all[option.parent] = bulk.open;
        }
      });
      setExpanded(all);
    }
  }, [bulk]);
  const renderNodes = /* @__PURE__ */ __name((nodes, level) => /* @__PURE__ */ jsxDEV("ul", { className: level === 0 ? "flexium-tree" : "flexium-tree__children", children: nodes.map((node) => {
    const value = node.option.value;
    const hasChildren = node.children.length > 0;
    const isOpen = expanded[value] ?? node.children.some(hasSelection);
    return /* @__PURE__ */ jsxDEV("li", { className: "flexium-tree__item", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flexium-tree__row", children: [
        hasChildren ? /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            className: "flexium-tree__toggle",
            "aria-expanded": isOpen,
            "aria-label": str(strings, isOpen ? "catalog_collapse" : "catalog_expand", node.option.label),
            onClick: () => setExpanded({ ...expanded, [value]: !isOpen }),
            children: /* @__PURE__ */ jsxDEV("i", { className: `fa fa-${isOpen ? "minus" : "plus"}`, "aria-hidden": "true" }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/catalog/CategoryTree.tsx",
              lineNumber: 105,
              columnNumber: 37
            }, this)
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/catalog/CategoryTree.tsx",
            lineNumber: 98,
            columnNumber: 33
          },
          this
        ) : /* @__PURE__ */ jsxDEV("span", { className: "flexium-tree__spacer", "aria-hidden": "true" }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/CategoryTree.tsx",
          lineNumber: 108,
          columnNumber: 33
        }, this),
        /* @__PURE__ */ jsxDEV(OptionCheckbox, { option: node.option, onToggle, showcount }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/CategoryTree.tsx",
          lineNumber: 110,
          columnNumber: 29
        }, this)
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/CategoryTree.tsx",
        lineNumber: 96,
        columnNumber: 25
      }, this),
      hasChildren && isOpen && renderNodes(node.children, level + 1)
    ] }, value, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CategoryTree.tsx",
      lineNumber: 95,
      columnNumber: 21
    }, this);
  }) }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/catalog/CategoryTree.tsx",
    lineNumber: 88,
    columnNumber: 9
  }, this), "renderNodes");
  const needle = normalise(filter.trim());
  if (needle) {
    const matches = options.filter((option) => normalise(option.label).includes(needle));
    return /* @__PURE__ */ jsxDEV("ul", { className: "flexium-optionlist", children: matches.map((option) => /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(OptionCheckbox, { option, onToggle, showcount }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CategoryTree.tsx",
      lineNumber: 126,
      columnNumber: 44
    }, this) }, option.value, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CategoryTree.tsx",
      lineNumber: 126,
      columnNumber: 21
    }, this)) }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CategoryTree.tsx",
      lineNumber: 124,
      columnNumber: 13
    }, this);
  }
  return roots.length ? renderNodes(roots, 0) : null;
}
__name(CategoryTree, "CategoryTree");
export {
  CategoryTree as default
};
//# sourceMappingURL=CategoryTree.dev.js.map
