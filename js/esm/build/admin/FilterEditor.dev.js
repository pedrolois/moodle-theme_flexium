var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { jsxDEV } from "react/jsx-dev-runtime";
/**
 * Admin editor of the catalogue filter layout: drag and drop (or arrow buttons) to reorder,
 * add and remove filter groups, and choose which start expanded.
 *
 * Rendered by theme_flexium\admin\setting_catalogfilters. Every change is written as JSON to the
 * setting's hidden input, which the admin settings form saves.
 *
 * @module     theme_flexium/admin/FilterEditor
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useEffect, useState } from "react";
const DRAG_TYPE = "application/x-flexium-filter";
function FilterEditor({ inputid, layout: initiallayout, sources, strings }) {
  const [layout, setLayout] = useState(initiallayout);
  const [dragging, setDragging] = useState(null);
  const [dropindex, setDropindex] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const str = /* @__PURE__ */ __name((key, a = "") => (strings[key] ?? key).replace("{$a}", a), "str");
  const bysource = new Map(sources.map((source) => [source.source, source]));
  const labelof = /* @__PURE__ */ __name((key) => bysource.get(key)?.label ?? key, "labelof");
  const shown = new Set(layout.map((item) => item.source));
  const available = sources.filter((source) => !shown.has(source.source));
  useEffect(() => {
    const input = document.getElementById(inputid);
    if (input && input.value !== JSON.stringify(layout)) {
      input.value = JSON.stringify(layout);
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }, [layout, inputid]);
  const move = /* @__PURE__ */ __name((from, to) => {
    if (from === to || to < 0 || to > layout.length) {
      return;
    }
    const next = [...layout];
    const [item] = next.splice(from, 1);
    next.splice(to > from ? to - 1 : to, 0, item);
    setLayout(next);
    setAnnouncement(str("filtereditor_moved", labelof(item.source)));
  }, "move");
  const add = /* @__PURE__ */ __name((source, index = layout.length) => {
    const next = [...layout];
    next.splice(index, 0, { source, expanded: false });
    setLayout(next);
  }, "add");
  const remove = /* @__PURE__ */ __name((source) => setLayout(layout.filter((item) => item.source !== source)), "remove");
  const setExpanded = /* @__PURE__ */ __name((source, expanded) => setLayout(layout.map((item) => item.source === source ? { ...item, expanded } : item)), "setExpanded");
  const startDrag = /* @__PURE__ */ __name((event, source) => {
    event.dataTransfer.setData(DRAG_TYPE, source);
    event.dataTransfer.effectAllowed = "move";
    setDragging(source);
  }, "startDrag");
  const endDrag = /* @__PURE__ */ __name(() => {
    setDragging(null);
    setDropindex(null);
  }, "endDrag");
  const overShown = /* @__PURE__ */ __name((event, index) => {
    if (!event.dataTransfer.types.includes(DRAG_TYPE)) {
      return;
    }
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    setDropindex(event.clientY > rect.top + rect.height / 2 ? index + 1 : index);
  }, "overShown");
  const dropShown = /* @__PURE__ */ __name((event) => {
    event.preventDefault();
    const source = event.dataTransfer.getData(DRAG_TYPE);
    const target = dropindex ?? layout.length;
    const from = layout.findIndex((item) => item.source === source);
    if (from >= 0) {
      move(from, target);
    } else if (bysource.has(source)) {
      add(source, target);
    }
    endDrag();
  }, "dropShown");
  const dropAvailable = /* @__PURE__ */ __name((event) => {
    event.preventDefault();
    const source = event.dataTransfer.getData(DRAG_TYPE);
    if (shown.has(source)) {
      remove(source);
    }
    endDrag();
  }, "dropAvailable");
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-filtereditor", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-filtereditor__column", children: [
      /* @__PURE__ */ jsxDEV("h4", { className: "flexium-filtereditor__title", children: str("filtereditor_shown") }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
        lineNumber: 141,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV(
        "ol",
        {
          className: "flexium-filtereditor__list flexium-filtereditor__list--shown",
          onDragOver: (event) => {
            if (event.dataTransfer.types.includes(DRAG_TYPE) && layout.length === 0) {
              event.preventDefault();
              setDropindex(0);
            }
          },
          onDrop: dropShown,
          children: [
            layout.length === 0 && /* @__PURE__ */ jsxDEV("li", { className: "flexium-filtereditor__empty", children: str("filtereditor_empty") }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
              lineNumber: 152,
              columnNumber: 45
            }, this),
            layout.map((item, index) => {
              const label = labelof(item.source);
              const classes = ["flexium-filtereditor__item"];
              if (dragging === item.source) {
                classes.push("flexium-filtereditor__item--dragging");
              }
              if (dropindex === index) {
                classes.push("flexium-filtereditor__item--dropbefore");
              }
              if (dropindex === index + 1 && index === layout.length - 1) {
                classes.push("flexium-filtereditor__item--dropafter");
              }
              return /* @__PURE__ */ jsxDEV(
                "li",
                {
                  className: classes.join(" "),
                  draggable: true,
                  onDragStart: (event) => startDrag(event, item.source),
                  onDragEnd: endDrag,
                  onDragOver: (event) => overShown(event, index),
                  children: [
                    /* @__PURE__ */ jsxDEV(
                      "span",
                      {
                        className: "flexium-filtereditor__handle",
                        title: str("filtereditor_drag", label),
                        "aria-hidden": "true",
                        children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-grip-vertical" }, void 0, false, {
                          fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                          lineNumber: 176,
                          columnNumber: 37
                        }, this)
                      },
                      void 0,
                      false,
                      {
                        fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                        lineNumber: 174,
                        columnNumber: 33
                      },
                      this
                    ),
                    /* @__PURE__ */ jsxDEV("span", { className: "flexium-filtereditor__text", children: [
                      /* @__PURE__ */ jsxDEV("span", { className: "flexium-filtereditor__label", children: label }, void 0, false, {
                        fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                        lineNumber: 179,
                        columnNumber: 37
                      }, this),
                      /* @__PURE__ */ jsxDEV("span", { className: "flexium-filtereditor__kind", children: bysource.get(item.source)?.kind }, void 0, false, {
                        fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                        lineNumber: 180,
                        columnNumber: 37
                      }, this)
                    ] }, void 0, true, {
                      fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                      lineNumber: 178,
                      columnNumber: 33
                    }, this),
                    /* @__PURE__ */ jsxDEV("label", { className: "flexium-filtereditor__expanded", children: [
                      /* @__PURE__ */ jsxDEV(
                        "input",
                        {
                          type: "checkbox",
                          className: "form-check-input me-1",
                          checked: item.expanded,
                          onChange: (event) => setExpanded(item.source, event.target.checked)
                        },
                        void 0,
                        false,
                        {
                          fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                          lineNumber: 183,
                          columnNumber: 37
                        },
                        this
                      ),
                      str("filtereditor_expanded")
                    ] }, void 0, true, {
                      fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                      lineNumber: 182,
                      columnNumber: 33
                    }, this),
                    /* @__PURE__ */ jsxDEV("span", { className: "flexium-filtereditor__actions", children: [
                      /* @__PURE__ */ jsxDEV(
                        "button",
                        {
                          type: "button",
                          className: "btn btn-sm btn-outline-secondary",
                          disabled: index === 0,
                          onClick: () => move(index, index - 1),
                          "aria-label": str("filtereditor_moveup", label),
                          children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-arrow-up", "aria-hidden": "true" }, void 0, false, {
                            fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                            lineNumber: 191,
                            columnNumber: 41
                          }, this)
                        },
                        void 0,
                        false,
                        {
                          fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                          lineNumber: 188,
                          columnNumber: 37
                        },
                        this
                      ),
                      /* @__PURE__ */ jsxDEV(
                        "button",
                        {
                          type: "button",
                          className: "btn btn-sm btn-outline-secondary",
                          disabled: index === layout.length - 1,
                          onClick: () => move(index, index + 2),
                          "aria-label": str("filtereditor_movedown", label),
                          children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-arrow-down", "aria-hidden": "true" }, void 0, false, {
                            fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                            lineNumber: 196,
                            columnNumber: 41
                          }, this)
                        },
                        void 0,
                        false,
                        {
                          fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                          lineNumber: 193,
                          columnNumber: 37
                        },
                        this
                      ),
                      /* @__PURE__ */ jsxDEV(
                        "button",
                        {
                          type: "button",
                          className: "btn btn-sm btn-outline-danger",
                          onClick: () => remove(item.source),
                          "aria-label": str("filtereditor_remove", label),
                          children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-xmark", "aria-hidden": "true" }, void 0, false, {
                            fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                            lineNumber: 200,
                            columnNumber: 41
                          }, this)
                        },
                        void 0,
                        false,
                        {
                          fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                          lineNumber: 198,
                          columnNumber: 37
                        },
                        this
                      )
                    ] }, void 0, true, {
                      fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                      lineNumber: 187,
                      columnNumber: 33
                    }, this)
                  ]
                },
                item.source,
                true,
                {
                  fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                  lineNumber: 166,
                  columnNumber: 29
                },
                this
              );
            })
          ]
        },
        void 0,
        true,
        {
          fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
          lineNumber: 142,
          columnNumber: 17
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
      lineNumber: 140,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-filtereditor__column", children: [
      /* @__PURE__ */ jsxDEV("h4", { className: "flexium-filtereditor__title", children: str("filtereditor_available") }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
        lineNumber: 210,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV(
        "ul",
        {
          className: "flexium-filtereditor__list flexium-filtereditor__list--available",
          onDragOver: (event) => {
            if (event.dataTransfer.types.includes(DRAG_TYPE)) {
              event.preventDefault();
            }
          },
          onDrop: dropAvailable,
          children: [
            available.length === 0 && /* @__PURE__ */ jsxDEV("li", { className: "flexium-filtereditor__empty", children: str("filtereditor_noavailable") }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
              lineNumber: 221,
              columnNumber: 25
            }, this),
            available.map((source) => /* @__PURE__ */ jsxDEV(
              "li",
              {
                className: "flexium-filtereditor__item",
                draggable: true,
                onDragStart: (event) => startDrag(event, source.source),
                onDragEnd: endDrag,
                children: [
                  /* @__PURE__ */ jsxDEV("span", { className: "flexium-filtereditor__handle", "aria-hidden": "true", children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-grip-vertical" }, void 0, false, {
                    fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                    lineNumber: 227,
                    columnNumber: 33
                  }, this) }, void 0, false, {
                    fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                    lineNumber: 226,
                    columnNumber: 29
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { className: "flexium-filtereditor__text", children: [
                    /* @__PURE__ */ jsxDEV("span", { className: "flexium-filtereditor__label", children: source.label }, void 0, false, {
                      fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                      lineNumber: 230,
                      columnNumber: 33
                    }, this),
                    /* @__PURE__ */ jsxDEV("span", { className: "flexium-filtereditor__kind", children: source.kind }, void 0, false, {
                      fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                      lineNumber: 231,
                      columnNumber: 33
                    }, this)
                  ] }, void 0, true, {
                    fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                    lineNumber: 229,
                    columnNumber: 29
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { className: "flexium-filtereditor__actions", children: /* @__PURE__ */ jsxDEV(
                    "button",
                    {
                      type: "button",
                      className: "btn btn-sm btn-outline-primary",
                      onClick: () => add(source.source),
                      "aria-label": str("filtereditor_add", source.label),
                      children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-plus", "aria-hidden": "true" }, void 0, false, {
                        fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                        lineNumber: 236,
                        columnNumber: 37
                      }, this)
                    },
                    void 0,
                    false,
                    {
                      fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                      lineNumber: 234,
                      columnNumber: 33
                    },
                    this
                  ) }, void 0, false, {
                    fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                    lineNumber: 233,
                    columnNumber: 29
                  }, this)
                ]
              },
              source.source,
              true,
              {
                fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
                lineNumber: 224,
                columnNumber: 25
              },
              this
            ))
          ]
        },
        void 0,
        true,
        {
          fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
          lineNumber: 211,
          columnNumber: 17
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
      lineNumber: 209,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "visually-hidden", "aria-live": "polite", children: announcement }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
      lineNumber: 244,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/admin/FilterEditor.tsx",
    lineNumber: 139,
    columnNumber: 9
  }, this);
}
__name(FilterEditor, "FilterEditor");
export {
  FilterEditor as default
};
//# sourceMappingURL=FilterEditor.dev.js.map
