var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { jsxDEV } from "react/jsx-dev-runtime";
/**
 * Widget style list editor: drag (or use the arrow buttons) to reorder, remove with ×, add from a menu.
 *
 * Used by the catalogue editor (edit mode, site administrators) for the filters, card badges and card footer.
 *
 * @module     theme_flexium/catalog/WidgetList
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useId, useState } from "react";
import { str } from "./utils";
const DRAG_TYPE = "application/x-flexium-widget";
function WidgetList({ title, value, choices, onChange, renderExtra, strings }) {
  const addid = useId();
  const [dragging, setDragging] = useState(null);
  const [dropindex, setDropindex] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const [adding, setAdding] = useState("");
  const bykey = new Map(choices.map((choice) => [choice.key, choice]));
  const labelof = /* @__PURE__ */ __name((key) => bykey.get(key)?.label ?? key, "labelof");
  const available = choices.filter((choice) => !value.includes(choice.key));
  const move = /* @__PURE__ */ __name((from, to) => {
    if (from === to || from + 1 === to || to < 0 || to > value.length) {
      return;
    }
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to > from ? to - 1 : to, 0, item);
    onChange(next);
    setAnnouncement(str(strings, "filtereditor_moved", labelof(item)));
  }, "move");
  const over = /* @__PURE__ */ __name((event, index) => {
    if (!dragging || !event.dataTransfer.types.includes(DRAG_TYPE)) {
      return;
    }
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    setDropindex(event.clientY > rect.top + rect.height / 2 ? index + 1 : index);
  }, "over");
  const drop = /* @__PURE__ */ __name((event) => {
    event.preventDefault();
    const key = event.dataTransfer.getData(DRAG_TYPE);
    const from = value.indexOf(key);
    if (from >= 0 && dropindex !== null) {
      move(from, dropindex);
    }
    setDragging(null);
    setDropindex(null);
  }, "drop");
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-widgets", children: [
    /* @__PURE__ */ jsxDEV(
      "ol",
      {
        className: "flexium-widgets__list",
        "aria-label": title,
        onDrop: drop,
        onDragOver: (event) => dragging && event.preventDefault(),
        children: [
          value.length === 0 && /* @__PURE__ */ jsxDEV("li", { className: "flexium-widgets__empty", children: str(strings, "editor_empty") }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
            lineNumber: 95,
            columnNumber: 40
          }, this),
          value.map((key, index) => {
            const label = labelof(key);
            const classes = ["flexium-widget"];
            if (dragging === key) {
              classes.push("flexium-widget--dragging");
            }
            if (dropindex === index) {
              classes.push("flexium-widget--dropbefore");
            } else if (dropindex === index + 1 && index === value.length - 1) {
              classes.push("flexium-widget--dropafter");
            }
            return /* @__PURE__ */ jsxDEV(
              "li",
              {
                className: classes.join(" "),
                draggable: true,
                onDragStart: (event) => {
                  event.dataTransfer.setData(DRAG_TYPE, key);
                  event.dataTransfer.effectAllowed = "move";
                  setDragging(key);
                },
                onDragEnd: () => {
                  setDragging(null);
                  setDropindex(null);
                },
                onDragOver: (event) => over(event, index),
                children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "flexium-widget__bar", children: [
                    /* @__PURE__ */ jsxDEV(
                      "span",
                      {
                        className: "flexium-widget__handle",
                        title: str(strings, "filtereditor_drag", label),
                        "aria-hidden": "true",
                        children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-grip-vertical" }, void 0, false, {
                          fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
                          lineNumber: 126,
                          columnNumber: 37
                        }, this)
                      },
                      void 0,
                      false,
                      {
                        fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
                        lineNumber: 124,
                        columnNumber: 33
                      },
                      this
                    ),
                    /* @__PURE__ */ jsxDEV("span", { className: "flexium-widget__label", children: [
                      label,
                      bykey.get(key)?.kind && /* @__PURE__ */ jsxDEV("span", { className: "flexium-widget__kind", children: bykey.get(key)?.kind }, void 0, false, {
                        fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
                        lineNumber: 131,
                        columnNumber: 41
                      }, this)
                    ] }, void 0, true, {
                      fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
                      lineNumber: 128,
                      columnNumber: 33
                    }, this),
                    /* @__PURE__ */ jsxDEV("span", { className: "flexium-widget__actions", children: [
                      /* @__PURE__ */ jsxDEV(
                        "button",
                        {
                          type: "button",
                          className: "flexium-widget__btn",
                          disabled: index === 0,
                          onClick: () => move(index, index - 1),
                          "aria-label": str(strings, "filtereditor_moveup", label),
                          children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-arrow-up", "aria-hidden": "true" }, void 0, false, {
                            fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
                            lineNumber: 138,
                            columnNumber: 41
                          }, this)
                        },
                        void 0,
                        false,
                        {
                          fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
                          lineNumber: 135,
                          columnNumber: 37
                        },
                        this
                      ),
                      /* @__PURE__ */ jsxDEV(
                        "button",
                        {
                          type: "button",
                          className: "flexium-widget__btn",
                          disabled: index === value.length - 1,
                          onClick: () => move(index, index + 2),
                          "aria-label": str(strings, "filtereditor_movedown", label),
                          children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-arrow-down", "aria-hidden": "true" }, void 0, false, {
                            fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
                            lineNumber: 143,
                            columnNumber: 41
                          }, this)
                        },
                        void 0,
                        false,
                        {
                          fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
                          lineNumber: 140,
                          columnNumber: 37
                        },
                        this
                      ),
                      /* @__PURE__ */ jsxDEV(
                        "button",
                        {
                          type: "button",
                          className: "flexium-widget__btn flexium-widget__btn--remove",
                          onClick: () => onChange(value.filter((item) => item !== key)),
                          "aria-label": str(strings, "filtereditor_remove", label),
                          children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-xmark", "aria-hidden": "true" }, void 0, false, {
                            fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
                            lineNumber: 148,
                            columnNumber: 41
                          }, this)
                        },
                        void 0,
                        false,
                        {
                          fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
                          lineNumber: 145,
                          columnNumber: 37
                        },
                        this
                      )
                    ] }, void 0, true, {
                      fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
                      lineNumber: 134,
                      columnNumber: 33
                    }, this)
                  ] }, void 0, true, {
                    fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
                    lineNumber: 123,
                    columnNumber: 29
                  }, this),
                  renderExtra && /* @__PURE__ */ jsxDEV("div", { className: "flexium-widget__extra", children: renderExtra(key) }, void 0, false, {
                    fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
                    lineNumber: 152,
                    columnNumber: 45
                  }, this)
                ]
              },
              key,
              true,
              {
                fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
                lineNumber: 108,
                columnNumber: 25
              },
              this
            );
          })
        ]
      },
      void 0,
      true,
      {
        fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
        lineNumber: 93,
        columnNumber: 13
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-widgets__add", children: [
      /* @__PURE__ */ jsxDEV("label", { htmlFor: addid, className: "visually-hidden", children: str(strings, "editor_add") }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
        lineNumber: 159,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV(
        "select",
        {
          id: addid,
          className: "form-select form-select-sm",
          value: adding,
          disabled: available.length === 0,
          onChange: (event) => setAdding(event.target.value),
          children: [
            /* @__PURE__ */ jsxDEV("option", { value: "", children: available.length ? str(strings, "editor_add") : str(strings, "editor_nothingtoadd") }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
              lineNumber: 162,
              columnNumber: 21
            }, this),
            available.map((choice) => /* @__PURE__ */ jsxDEV("option", { value: choice.key, children: choice.label }, choice.key, false, {
              fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
              lineNumber: 165,
              columnNumber: 46
            }, this))
          ]
        },
        void 0,
        true,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
          lineNumber: 160,
          columnNumber: 17
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          className: "btn btn-sm btn-outline-primary",
          disabled: !adding,
          "aria-label": str(strings, "editor_add"),
          onClick: () => {
            onChange([...value, adding]);
            setAdding("");
          },
          children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-plus", "aria-hidden": "true" }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
            lineNumber: 173,
            columnNumber: 21
          }, this)
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
          lineNumber: 167,
          columnNumber: 17
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
      lineNumber: 158,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "visually-hidden", "aria-live": "polite", children: announcement }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
      lineNumber: 177,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/WidgetList.tsx",
    lineNumber: 92,
    columnNumber: 9
  }, this);
}
__name(WidgetList, "WidgetList");
export {
  WidgetList as default
};
//# sourceMappingURL=WidgetList.dev.js.map
