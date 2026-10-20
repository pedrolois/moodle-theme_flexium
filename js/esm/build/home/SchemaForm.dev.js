var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { jsxDEV } from "react/jsx-dev-runtime";
/**
 * Settings form of a home page section, generated from its fields (\theme_flexium\local\home\fields).
 *
 * @module     theme_flexium/home/SchemaForm
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useId, useState } from "react";
const str = /* @__PURE__ */ __name((strings, key, a = "") => (strings[key] ?? key).replace("{$a}", String(a)), "str");
const swap = /* @__PURE__ */ __name((list, a, b) => {
  const copy = [...list];
  [copy[a], copy[b]] = [copy[b], copy[a]];
  return copy;
}, "swap");
function ItemsControl({ field, value, onChange, context }) {
  const list = Array.isArray(value) ? value : [];
  const [open, setOpen] = useState(null);
  const set = /* @__PURE__ */ __name((next) => onChange(next), "set");
  const titleof = /* @__PURE__ */ __name((item, index) => String(item.title ?? item.question ?? item.name ?? item.quote ?? "").slice(0, 60) || `#${index + 1}`, "titleof");
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-homeform__items", children: [
    list.map((item, index) => /* @__PURE__ */ jsxDEV("div", { className: `flexium-homeform__item${open === index ? " is-open" : ""}`, children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flexium-homeform__itembar", children: [
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            className: "flexium-homeform__itemtoggle",
            "aria-expanded": open === index,
            onClick: () => setOpen(open === index ? null : index),
            children: titleof(item, index)
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
            lineNumber: 72,
            columnNumber: 25
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            className: "flexium-widget__btn",
            disabled: index === 0,
            "aria-label": str(context.strings, "home_moveup"),
            onClick: () => set(swap(list, index, index - 1)),
            children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-arrow-up", "aria-hidden": "true" }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
              lineNumber: 79,
              columnNumber: 29
            }, this)
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
            lineNumber: 76,
            columnNumber: 25
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            className: "flexium-widget__btn",
            disabled: index === list.length - 1,
            "aria-label": str(context.strings, "home_movedown"),
            onClick: () => set(swap(list, index, index + 1)),
            children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-arrow-down", "aria-hidden": "true" }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
              lineNumber: 84,
              columnNumber: 29
            }, this)
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
            lineNumber: 81,
            columnNumber: 25
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            className: "flexium-widget__btn flexium-widget__btn--remove",
            "aria-label": str(context.strings, "home_removeitem"),
            onClick: () => set(list.filter((_, position) => position !== index)),
            children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-xmark", "aria-hidden": "true" }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
              lineNumber: 89,
              columnNumber: 29
            }, this)
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
            lineNumber: 86,
            columnNumber: 25
          },
          this
        )
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
        lineNumber: 71,
        columnNumber: 21
      }, this),
      open === index && /* @__PURE__ */ jsxDEV("div", { className: "flexium-homeform__itembody", children: field.fields.map((subfield) => /* @__PURE__ */ jsxDEV(
        FieldControl,
        {
          field: subfield,
          value: item[subfield.key],
          context,
          onChange: (next) => set(list.map((entry, position) => position === index ? { ...entry, [subfield.key]: next } : entry))
        },
        subfield.key,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
          lineNumber: 95,
          columnNumber: 33
        },
        this
      )) }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
        lineNumber: 93,
        columnNumber: 25
      }, this)
    ] }, index, true, {
      fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
      lineNumber: 70,
      columnNumber: 17
    }, this)),
    /* @__PURE__ */ jsxDEV("button", { type: "button", className: "btn btn-sm btn-outline-primary", onClick: () => {
      const blank = {};
      field.fields.forEach((subfield) => {
        blank[subfield.key] = subfield.type === "icon" ? Object.values(context.icons)[0] : "";
      });
      set([...list, blank]);
      setOpen(list.length);
    }, children: [
      /* @__PURE__ */ jsxDEV("i", { className: "fa fa-plus me-1", "aria-hidden": "true" }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
        lineNumber: 111,
        columnNumber: 17
      }, this),
      str(context.strings, "home_additem")
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
      lineNumber: 103,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
    lineNumber: 68,
    columnNumber: 9
  }, this);
}
__name(ItemsControl, "ItemsControl");
function FieldControl({ field, value, onChange, context }) {
  const id = useId();
  const label = /* @__PURE__ */ jsxDEV("label", { htmlFor: id, className: "flexium-feature__label", children: field.label }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
    lineNumber: 122,
    columnNumber: 19
  }, this);
  const textvalue = typeof value === "string" || typeof value === "number" ? String(value) : "";
  switch (field.type) {
    case "bool":
      return /* @__PURE__ */ jsxDEV("div", { className: "form-check form-switch flexium-homeform__field", "data-field": field.key, children: [
        /* @__PURE__ */ jsxDEV(
          "input",
          {
            id,
            type: "checkbox",
            role: "switch",
            className: "form-check-input",
            checked: value === true,
            onChange: (event) => onChange(event.target.checked)
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
            lineNumber: 129,
            columnNumber: 21
          },
          this
        ),
        /* @__PURE__ */ jsxDEV("label", { htmlFor: id, className: "form-check-label flexium-feature__label", children: field.label }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
          lineNumber: 131,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
        lineNumber: 128,
        columnNumber: 17
      }, this);
    case "textarea":
      return /* @__PURE__ */ jsxDEV("div", { className: "flexium-homeform__field", "data-field": field.key, children: [
        label,
        /* @__PURE__ */ jsxDEV(
          "textarea",
          {
            id,
            className: "form-control form-control-sm",
            rows: 3,
            value: textvalue,
            onChange: (event) => onChange(event.target.value)
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
            lineNumber: 138,
            columnNumber: 21
          },
          this
        )
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
        lineNumber: 136,
        columnNumber: 17
      }, this);
    case "select":
      return /* @__PURE__ */ jsxDEV("div", { className: "flexium-homeform__field", "data-field": field.key, children: [
        label,
        /* @__PURE__ */ jsxDEV(
          "select",
          {
            id,
            className: "form-select form-select-sm",
            value: textvalue,
            onChange: (event) => onChange(event.target.value),
            children: field.choices.map((choice) => /* @__PURE__ */ jsxDEV("option", { value: choice.key, children: choice.label }, choice.key, false, {
              fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
              lineNumber: 148,
              columnNumber: 54
            }, this))
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
            lineNumber: 146,
            columnNumber: 21
          },
          this
        )
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
        lineNumber: 144,
        columnNumber: 17
      }, this);
    case "category":
      return /* @__PURE__ */ jsxDEV("div", { className: "flexium-homeform__field", "data-field": field.key, children: [
        label,
        /* @__PURE__ */ jsxDEV(
          "select",
          {
            id,
            className: "form-select form-select-sm",
            value: textvalue,
            onChange: (event) => onChange(Number(event.target.value)),
            children: [
              /* @__PURE__ */ jsxDEV("option", { value: "0", children: "-" }, void 0, false, {
                fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
                lineNumber: 158,
                columnNumber: 25
              }, this),
              (context.data?.categories ?? []).map((category) => /* @__PURE__ */ jsxDEV("option", { value: category.id, children: category.name }, category.id, false, {
                fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
                lineNumber: 160,
                columnNumber: 29
              }, this))
            ]
          },
          void 0,
          true,
          {
            fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
            lineNumber: 156,
            columnNumber: 21
          },
          this
        )
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
        lineNumber: 154,
        columnNumber: 17
      }, this);
    case "palette":
      return /* @__PURE__ */ jsxDEV("div", { className: "flexium-homeform__field", "data-field": field.key, children: [
        /* @__PURE__ */ jsxDEV("span", { className: "flexium-feature__label", children: field.label }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
          lineNumber: 168,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flexium-feature__swatches", role: "radiogroup", "aria-label": field.label, children: Object.entries(context.palette).map(([key, url]) => /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            role: "radio",
            "aria-checked": textvalue === key,
            "aria-label": key,
            className: `flexium-feature__swatch${textvalue === key ? " is-active" : ""}`,
            style: { backgroundImage: `url("${url}")` },
            onClick: () => onChange(key)
          },
          key,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
            lineNumber: 171,
            columnNumber: 29
          },
          this
        )) }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
          lineNumber: 169,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
        lineNumber: 167,
        columnNumber: 17
      }, this);
    case "icon":
      return /* @__PURE__ */ jsxDEV("div", { className: "flexium-homeform__field", "data-field": field.key, children: [
        /* @__PURE__ */ jsxDEV("span", { className: "flexium-feature__label", children: field.label }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
          lineNumber: 181,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flexium-homeform__icons", role: "radiogroup", "aria-label": field.label, children: Object.entries(context.icons).map(([key, classes]) => /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            role: "radio",
            "aria-checked": textvalue === classes,
            "aria-label": key,
            className: `flexium-homeform__icon${textvalue === classes ? " is-active" : ""}`,
            onClick: () => onChange(classes),
            children: /* @__PURE__ */ jsxDEV("i", { className: classes, "aria-hidden": "true" }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
              lineNumber: 187,
              columnNumber: 33
            }, this)
          },
          key,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
            lineNumber: 184,
            columnNumber: 29
          },
          this
        )) }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
          lineNumber: 182,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
        lineNumber: 180,
        columnNumber: 17
      }, this);
    case "checklist": {
      const chosen = Array.isArray(value) ? value : [];
      return /* @__PURE__ */ jsxDEV("fieldset", { className: "flexium-homeform__field", "data-field": field.key, children: [
        /* @__PURE__ */ jsxDEV("legend", { className: "flexium-feature__label", children: field.label }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
          lineNumber: 197,
          columnNumber: 21
        }, this),
        field.choices.map((choice) => /* @__PURE__ */ jsxDEV("div", { className: "form-check", children: [
          /* @__PURE__ */ jsxDEV(
            "input",
            {
              id: `${id}-${choice.key}`,
              type: "checkbox",
              className: "form-check-input",
              checked: chosen.includes(choice.key),
              onChange: (event) => onChange(event.target.checked ? field.choices.map((item) => item.key).filter((key) => key === choice.key || chosen.includes(key)) : chosen.filter((key) => key !== choice.key))
            },
            void 0,
            false,
            {
              fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
              lineNumber: 200,
              columnNumber: 29
            },
            this
          ),
          /* @__PURE__ */ jsxDEV("label", { htmlFor: `${id}-${choice.key}`, className: "form-check-label", children: choice.label }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
            lineNumber: 205,
            columnNumber: 29
          }, this)
        ] }, choice.key, true, {
          fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
          lineNumber: 199,
          columnNumber: 25
        }, this))
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
        lineNumber: 196,
        columnNumber: 17
      }, this);
    }
    case "items":
      return /* @__PURE__ */ jsxDEV("div", { className: "flexium-homeform__field", "data-field": field.key, children: [
        /* @__PURE__ */ jsxDEV("span", { className: "flexium-feature__label", children: field.label }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
          lineNumber: 214,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV(ItemsControl, { field, value, onChange, context }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
          lineNumber: 215,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
        lineNumber: 213,
        columnNumber: 17
      }, this);
    default:
      return /* @__PURE__ */ jsxDEV("div", { className: "flexium-homeform__field", "data-field": field.key, children: [
        label,
        /* @__PURE__ */ jsxDEV(
          "input",
          {
            id,
            type: field.type === "url" ? "url" : "text",
            className: "form-control form-control-sm",
            value: textvalue,
            onChange: (event) => onChange(event.target.value)
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
            lineNumber: 222,
            columnNumber: 21
          },
          this
        )
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
        lineNumber: 220,
        columnNumber: 17
      }, this);
  }
}
__name(FieldControl, "FieldControl");
function SchemaForm({ fields, settings, onChange, strings, palette, icons, data }) {
  const context = { strings, palette, icons, data };
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-homeform", children: fields.map((field) => /* @__PURE__ */ jsxDEV(
    FieldControl,
    {
      field,
      value: settings[field.key],
      context,
      onChange: (value) => onChange({ ...settings, [field.key]: value })
    },
    field.key,
    false,
    {
      fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
      lineNumber: 240,
      columnNumber: 17
    },
    this
  )) }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/home/SchemaForm.tsx",
    lineNumber: 238,
    columnNumber: 9
  }, this);
}
__name(SchemaForm, "SchemaForm");
export {
  SchemaForm as default
};
//# sourceMappingURL=SchemaForm.dev.js.map
