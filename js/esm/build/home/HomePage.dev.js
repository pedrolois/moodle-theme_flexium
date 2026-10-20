var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
/**
 * Flexium home page: a list of sections (hero, course carousels, categories, figures...).
 *
 * Site administrators with edit mode on build it in place: a magic wand on each section opens its settings in a side
 * panel (the rest of the page is shaded), arrows move sections, + adds new ones, and ten templates give a start.
 *
 * Mounted by theme_flexium\output\core\course_renderer::frontpage().
 *
 * @module     theme_flexium/home/HomePage
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useEffect, useId, useState } from "react";
import { Spotlight } from "@moodle/lms/theme_flexium/catalog/EditZones";
import { warnOnLeave } from "@moodle/lms/theme_flexium/catalog/useCatalogEditor";
import SchemaForm from "@moodle/lms/theme_flexium/home/SchemaForm";
import SectionView, { str } from "@moodle/lms/theme_flexium/home/Sections";
import { getHomeData, saveHomePage } from "./repository";
const blockClass = /* @__PURE__ */ __name((type) => `flexium-hometemplate__block flexium-hometemplate__block--${type}`, "blockClass");
const blockStyle = /* @__PURE__ */ __name((type, image) => type === "hero" || type === "cta" ? { backgroundImage: `url("${image}")` } : void 0, "blockStyle");
const newId = /* @__PURE__ */ __name(() => `s${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`, "newId");
const defaultSettings = /* @__PURE__ */ __name((editor, type) => {
  for (const template of editor.templates) {
    const section = template.sections.find((item) => item.type === type);
    if (section) {
      return JSON.parse(JSON.stringify(section.settings));
    }
  }
  const settings = {};
  const blank = /* @__PURE__ */ __name((key) => key === "title" ? str(editor.strings, `home_type_${type}`) : "", "blank");
  (editor.schema[type] ?? []).forEach((field) => {
    if (field.type === "bool") {
      settings[field.key] = false;
    } else if (field.type === "items" || field.type === "checklist") {
      settings[field.key] = [];
    } else {
      settings[field.key] = field.choices[0]?.key ?? blank(field.key);
    }
  });
  return settings;
}, "defaultSettings");
function EditHint({ strings }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem("theme_flexium_homehint") === "hidden";
    } catch {
      return false;
    }
  });
  const toggle = /* @__PURE__ */ __name((next) => {
    try {
      window.localStorage.setItem("theme_flexium_homehint", next ? "hidden" : "");
    } catch {
    }
    setCollapsed(next);
  }, "toggle");
  if (collapsed) {
    return /* @__PURE__ */ jsxDEV("button", { type: "button", className: "flexium-edithint__pill", onClick: () => toggle(false), children: [
      /* @__PURE__ */ jsxDEV("i", { className: "fa fa-wand-magic-sparkles me-2", "aria-hidden": "true" }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
        lineNumber: 112,
        columnNumber: 17
      }, this),
      str(strings, "home_edithint_title")
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
      lineNumber: 111,
      columnNumber: 13
    }, this);
  }
  return /* @__PURE__ */ jsxDEV("div", { className: "alert alert-info flexium-edithint", role: "note", children: [
    /* @__PURE__ */ jsxDEV("i", { className: "fa fa-wand-magic-sparkles flexium-edithint__icon", "aria-hidden": "true" }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
      lineNumber: 118,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("strong", { children: str(strings, "home_edithint_title") }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
        lineNumber: 120,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "mb-0", children: str(strings, "home_edithint") }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
        lineNumber: 121,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
      lineNumber: 119,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV(
      "button",
      {
        type: "button",
        className: "btn-close",
        "aria-label": str(strings, "catalog_close") || "Close",
        onClick: () => toggle(true)
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
        lineNumber: 123,
        columnNumber: 13
      },
      this
    )
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
    lineNumber: 117,
    columnNumber: 9
  }, this);
}
__name(EditHint, "EditHint");
function SectionFrame({
  section,
  index,
  count,
  active,
  strings,
  onSettings,
  onMove,
  onDuplicate,
  onDelete,
  children
}) {
  const name = str(strings, `home_type_${section.type}`);
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      className: `flexium-homeframe flexium-editzone${active ? " flexium-editzone--active" : ""}`,
      "data-section": section.type,
      children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flexium-homeframe__bar", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "flexium-homeframe__name", children: name }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
            lineNumber: 152,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              type: "button",
              className: "flexium-homeframe__btn flexium-homeframe__btn--wand",
              "data-action": "settings",
              "aria-expanded": active,
              title: str(strings, "editor_wand", name),
              "aria-label": str(strings, "editor_wand", name),
              onClick: onSettings,
              children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-wand-magic-sparkles", "aria-hidden": "true" }, void 0, false, {
                fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
                lineNumber: 156,
                columnNumber: 21
              }, this)
            },
            void 0,
            false,
            {
              fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
              lineNumber: 153,
              columnNumber: 17
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              type: "button",
              className: "flexium-homeframe__btn",
              "data-action": "moveup",
              disabled: index === 0,
              onClick: () => onMove(-1),
              title: str(strings, "home_moveup"),
              "aria-label": str(strings, "home_moveup"),
              children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-arrow-up", "aria-hidden": "true" }, void 0, false, {
                fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
                lineNumber: 161,
                columnNumber: 21
              }, this)
            },
            void 0,
            false,
            {
              fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
              lineNumber: 158,
              columnNumber: 17
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              type: "button",
              className: "flexium-homeframe__btn",
              "data-action": "movedown",
              disabled: index === count - 1,
              onClick: () => onMove(1),
              title: str(strings, "home_movedown"),
              "aria-label": str(strings, "home_movedown"),
              children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-arrow-down", "aria-hidden": "true" }, void 0, false, {
                fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
                lineNumber: 165,
                columnNumber: 21
              }, this)
            },
            void 0,
            false,
            {
              fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
              lineNumber: 163,
              columnNumber: 17
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              type: "button",
              className: "flexium-homeframe__btn",
              "data-action": "duplicate",
              onClick: onDuplicate,
              title: str(strings, "home_duplicate"),
              "aria-label": str(strings, "home_duplicate"),
              children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-clone", "aria-hidden": "true" }, void 0, false, {
                fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
                lineNumber: 169,
                columnNumber: 21
              }, this)
            },
            void 0,
            false,
            {
              fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
              lineNumber: 167,
              columnNumber: 17
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              type: "button",
              className: "flexium-homeframe__btn flexium-homeframe__btn--delete",
              "data-action": "delete",
              onClick: onDelete,
              title: str(strings, "home_delete"),
              "aria-label": str(strings, "home_delete"),
              children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-trash-can", "aria-hidden": "true" }, void 0, false, {
                fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
                lineNumber: 174,
                columnNumber: 21
              }, this)
            },
            void 0,
            false,
            {
              fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
              lineNumber: 171,
              columnNumber: 17
            },
            this
          )
        ] }, void 0, true, {
          fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
          lineNumber: 151,
          columnNumber: 13
        }, this),
        children
      ]
    },
    void 0,
    true,
    {
      fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
      lineNumber: 149,
      columnNumber: 9
    },
    this
  );
}
__name(SectionFrame, "SectionFrame");
function Inserter({ strings, onClick, active }) {
  return /* @__PURE__ */ jsxDEV("div", { className: `flexium-homeinserter${active ? " is-active" : ""}`, children: /* @__PURE__ */ jsxDEV(
    "button",
    {
      type: "button",
      className: "flexium-homeinserter__btn",
      "data-action": "add",
      onClick,
      title: str(strings, "home_addsection"),
      "aria-label": str(strings, "home_addsection"),
      children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-plus", "aria-hidden": "true" }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
        lineNumber: 190,
        columnNumber: 17
      }, this)
    },
    void 0,
    false,
    {
      fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
      lineNumber: 188,
      columnNumber: 13
    },
    this
  ) }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
    lineNumber: 187,
    columnNumber: 9
  }, this);
}
__name(Inserter, "Inserter");
function EditBar({ strings, dirty, status, onTemplates, onSave, onReset }) {
  return /* @__PURE__ */ jsxDEV("section", { className: "flexium-editor flexium-homeeditor", children: /* @__PURE__ */ jsxDEV("div", { className: "flexium-editor__header", children: [
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("h2", { className: "flexium-editor__title", children: [
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-pen-to-square me-2", "aria-hidden": "true" }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
          lineNumber: 214,
          columnNumber: 25
        }, this),
        str(strings, "home_editor_title")
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
        lineNumber: 213,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "flexium-editor__help", children: str(strings, "home_editor_help") }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
        lineNumber: 216,
        columnNumber: 21
      }, this)
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
      lineNumber: 212,
      columnNumber: 17
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-editor__actions", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "flexium-editor__status", role: "status", children: [
        status === "saving" && str(strings, "editor_saving"),
        status === "saved" && !dirty && str(strings, "editor_saved"),
        status === "error" && str(strings, "editor_error"),
        status !== "saving" && dirty && str(strings, "editor_unsaved")
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
        lineNumber: 219,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("button", { type: "button", className: "btn btn-outline-primary", "data-action": "templates", onClick: onTemplates, children: [
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-swatchbook me-2", "aria-hidden": "true" }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
          lineNumber: 226,
          columnNumber: 25
        }, this),
        str(strings, "home_templates")
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
        lineNumber: 225,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          className: "btn btn-outline-secondary",
          "data-action": "discard",
          disabled: !dirty || status === "saving",
          onClick: onReset,
          children: str(strings, "editor_reset")
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
          lineNumber: 228,
          columnNumber: 21
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          className: "btn btn-primary",
          "data-action": "save",
          disabled: !dirty || status === "saving",
          onClick: onSave,
          children: str(strings, "editor_save")
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
          lineNumber: 230,
          columnNumber: 21
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
      lineNumber: 218,
      columnNumber: 17
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
    lineNumber: 211,
    columnNumber: 13
  }, this) }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
    lineNumber: 210,
    columnNumber: 9
  }, this);
}
__name(EditBar, "EditBar");
function SidePanel({ panel, page, editor, palette, data, onClose, onSettings, onAdd, onTemplate }) {
  const id = useId();
  const strings = editor.strings;
  useEffect(() => {
    const onKey = /* @__PURE__ */ __name((event) => event.key === "Escape" && onClose(), "onKey");
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (!panel) {
    return null;
  }
  const section = panel.kind === "section" ? page.sections.find((item) => item.id === panel.id) : void 0;
  let title = str(strings, "home_templates");
  if (panel.kind === "add") {
    title = str(strings, "home_addsection");
  } else if (section) {
    title = str(strings, `home_type_${section.type}`);
  }
  return /* @__PURE__ */ jsxDEV("aside", { className: "flexium-editpanel", "aria-labelledby": `${id}-title`, children: [
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-editpanel__header", children: [
      /* @__PURE__ */ jsxDEV("h2", { id: `${id}-title`, className: "flexium-editpanel__title", children: [
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-wand-magic-sparkles me-2", "aria-hidden": "true" }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
          lineNumber: 278,
          columnNumber: 21
        }, this),
        title
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
        lineNumber: 277,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          className: "btn-close",
          "aria-label": str(strings, "editor_closepanel"),
          onClick: onClose
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
          lineNumber: 280,
          columnNumber: 17
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
      lineNumber: 276,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-editpanel__body", children: [
      section && /* @__PURE__ */ jsxDEV(Fragment, { children: [
        /* @__PURE__ */ jsxDEV("p", { className: "flexium-feature__help mb-3", children: str(strings, `home_type_${section.type}_desc`) }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
          lineNumber: 286,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ jsxDEV(
          SchemaForm,
          {
            fields: editor.schema[section.type] ?? [],
            settings: section.settings,
            strings,
            palette,
            icons: editor.icons,
            data,
            onChange: (settings) => onSettings(section.id, settings)
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
            lineNumber: 287,
            columnNumber: 25
          },
          this
        )
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
        lineNumber: 285,
        columnNumber: 21
      }, this),
      panel.kind === "add" && /* @__PURE__ */ jsxDEV(Fragment, { children: [
        /* @__PURE__ */ jsxDEV("p", { className: "flexium-feature__help mb-3", children: str(strings, "home_addsection_help") }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
          lineNumber: 294,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ jsxDEV("ul", { className: "flexium-homepicker", children: editor.types.map((type) => /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            className: "flexium-homepicker__item",
            "data-type": type,
            onClick: () => onAdd(panel.index, type),
            children: [
              /* @__PURE__ */ jsxDEV("strong", { children: str(strings, `home_type_${type}`) }, void 0, false, {
                fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
                lineNumber: 300,
                columnNumber: 41
              }, this),
              /* @__PURE__ */ jsxDEV("span", { children: str(strings, `home_type_${type}_desc`) }, void 0, false, {
                fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
                lineNumber: 301,
                columnNumber: 41
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
            lineNumber: 298,
            columnNumber: 37
          },
          this
        ) }, type, false, {
          fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
          lineNumber: 297,
          columnNumber: 33
        }, this)) }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
          lineNumber: 295,
          columnNumber: 25
        }, this)
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
        lineNumber: 293,
        columnNumber: 21
      }, this),
      panel.kind === "templates" && /* @__PURE__ */ jsxDEV(Fragment, { children: [
        /* @__PURE__ */ jsxDEV("p", { className: "flexium-feature__help mb-3", children: str(strings, "home_templates_help") }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
          lineNumber: 310,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ jsxDEV("ul", { className: "flexium-hometemplates", children: editor.templates.map((template) => /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV("button", { type: "button", className: `flexium-hometemplate${page.template === template.key ? " is-current" : ""}`, onClick: () => onTemplate(template.key), children: [
          /* @__PURE__ */ jsxDEV("span", { className: "flexium-hometemplate__preview", "aria-hidden": "true", children: template.sections.map((item) => /* @__PURE__ */ jsxDEV(
            "span",
            {
              className: blockClass(item.type),
              style: blockStyle(item.type, palette[template.palette])
            },
            item.id,
            false,
            {
              fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
              lineNumber: 319,
              columnNumber: 49
            },
            this
          )) }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
            lineNumber: 317,
            columnNumber: 41
          }, this),
          /* @__PURE__ */ jsxDEV("strong", { children: [
            template.name,
            page.template === template.key && /* @__PURE__ */ jsxDEV("span", { className: "badge text-bg-primary ms-2", children: str(strings, "home_current") }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
              lineNumber: 326,
              columnNumber: 49
            }, this)
          ] }, void 0, true, {
            fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
            lineNumber: 323,
            columnNumber: 41
          }, this),
          /* @__PURE__ */ jsxDEV("span", { children: template.description }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
            lineNumber: 329,
            columnNumber: 41
          }, this)
        ] }, void 0, true, {
          fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
          lineNumber: 314,
          columnNumber: 37
        }, this) }, template.key, false, {
          fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
          lineNumber: 313,
          columnNumber: 33
        }, this)) }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
          lineNumber: 311,
          columnNumber: 25
        }, this)
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
        lineNumber: 309,
        columnNumber: 21
      }, this)
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
      lineNumber: 283,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
    lineNumber: 275,
    columnNumber: 9
  }, this);
}
__name(SidePanel, "SidePanel");
function HomePage({
  page: savedpage,
  sitecontent,
  sitename,
  palette,
  catalogurl,
  loggedin,
  strings,
  editor,
  canedit
}) {
  const [saved, setSaved] = useState(savedpage);
  const [page, setPage] = useState(savedpage);
  const [data, setData] = useState(null);
  const [panel, setPanel] = useState(null);
  const [status, setStatus] = useState("idle");
  const dirty = JSON.stringify(page) !== JSON.stringify(saved);
  const allstrings = editor ? { ...strings, ...editor.strings } : strings;
  useEffect(() => warnOnLeave(dirty, editor?.strings.editor_leaveunsaved ?? ""), [dirty, editor]);
  useEffect(() => {
    getHomeData().then(setData).catch(() => setData({ categories: [], stats: {}, news: [] }));
  }, []);
  const setSections = /* @__PURE__ */ __name((sections) => setPage({ ...page, sections }), "setSections");
  const move = /* @__PURE__ */ __name((index, direction) => {
    const sections = [...page.sections];
    [sections[index], sections[index + direction]] = [sections[index + direction], sections[index]];
    setSections(sections);
  }, "move");
  const duplicate = /* @__PURE__ */ __name((index) => {
    const copy = { ...page.sections[index], id: newId(), settings: JSON.parse(JSON.stringify(page.sections[index].settings)) };
    setSections([...page.sections.slice(0, index + 1), copy, ...page.sections.slice(index + 1)]);
  }, "duplicate");
  const remove = /* @__PURE__ */ __name((index) => {
    if (window.confirm(str(allstrings, "home_delete_confirm"))) {
      setSections(page.sections.filter((_, position) => position !== index));
      setPanel(null);
    }
  }, "remove");
  const add = /* @__PURE__ */ __name((index, type) => {
    if (!editor) {
      return;
    }
    const section = { id: newId(), type, settings: defaultSettings(editor, type) };
    setSections([...page.sections.slice(0, index), section, ...page.sections.slice(index)]);
    setPanel({ kind: "section", id: section.id });
  }, "add");
  const useTemplate = /* @__PURE__ */ __name((key) => {
    const template = editor?.templates.find((item) => item.key === key);
    if (template && window.confirm(str(allstrings, "home_usetemplate_confirm", template.name))) {
      setPage({ template: key, sections: JSON.parse(JSON.stringify(template.sections)) });
    }
  }, "useTemplate");
  const save = /* @__PURE__ */ __name(() => {
    setStatus("saving");
    saveHomePage(page).then((result) => {
      setSaved(result);
      setPage(result);
      setStatus("saved");
      return result;
    }).catch(() => setStatus("error"));
  }, "save");
  const context = { data, strings: allstrings, palette, catalogurl, loggedin, sitecontent, sitename };
  const activeid = panel?.kind === "section" ? panel.id : "";
  return /* @__PURE__ */ jsxDEV("div", { className: `flexium-home${panel ? " flexium-catalog--editing" : ""}`, children: [
    canedit && /* @__PURE__ */ jsxDEV(EditHint, { strings }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
      lineNumber: 406,
      columnNumber: 25
    }, this),
    editor && /* @__PURE__ */ jsxDEV(
      EditBar,
      {
        strings: allstrings,
        dirty,
        status,
        onTemplates: () => setPanel({ kind: "templates" }),
        onSave: save,
        onReset: () => {
          setPage(saved);
          setStatus("idle");
        }
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
        lineNumber: 408,
        columnNumber: 17
      },
      this
    ),
    editor && page.sections.length === 0 && /* @__PURE__ */ jsxDEV("p", { className: "flexium-home__muted", children: str(allstrings, "home_empty") }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
      lineNumber: 414,
      columnNumber: 54
    }, this),
    page.sections.map((section, index) => /* @__PURE__ */ jsxDEV("div", { className: "flexium-home__section", children: [
      editor && /* @__PURE__ */ jsxDEV(
        Inserter,
        {
          strings: allstrings,
          onClick: () => setPanel({ kind: "add", index }),
          active: panel?.kind === "add" && panel.index === index
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
          lineNumber: 418,
          columnNumber: 25
        },
        this
      ),
      editor ? /* @__PURE__ */ jsxDEV(
        SectionFrame,
        {
          section,
          index,
          count: page.sections.length,
          active: activeid === section.id,
          strings: allstrings,
          onSettings: () => setPanel(activeid === section.id ? null : { kind: "section", id: section.id }),
          onMove: (direction) => move(index, direction),
          onDuplicate: () => duplicate(index),
          onDelete: () => remove(index),
          children: /* @__PURE__ */ jsxDEV(SectionView, { section, context }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
            lineNumber: 427,
            columnNumber: 29
          }, this)
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
          lineNumber: 422,
          columnNumber: 25
        },
        this
      ) : /* @__PURE__ */ jsxDEV(SectionView, { section, context }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
        lineNumber: 429,
        columnNumber: 25
      }, this)
    ] }, section.id, true, {
      fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
      lineNumber: 416,
      columnNumber: 17
    }, this)),
    editor && /* @__PURE__ */ jsxDEV(
      Inserter,
      {
        strings: allstrings,
        onClick: () => setPanel({ kind: "add", index: page.sections.length }),
        active: panel?.kind === "add" && panel.index === page.sections.length
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
        lineNumber: 433,
        columnNumber: 17
      },
      this
    ),
    editor && /* @__PURE__ */ jsxDEV(Fragment, { children: [
      activeid && /* @__PURE__ */ jsxDEV(Spotlight, { zone: activeid }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
        lineNumber: 438,
        columnNumber: 34
      }, this),
      /* @__PURE__ */ jsxDEV(
        SidePanel,
        {
          panel,
          page,
          editor,
          palette,
          data,
          onClose: () => setPanel(null),
          onAdd: add,
          onTemplate: useTemplate,
          onSettings: (id, settings) => setSections(page.sections.map((item) => item.id === id ? { ...item, settings } : item))
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
          lineNumber: 439,
          columnNumber: 21
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
      lineNumber: 437,
      columnNumber: 17
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/home/HomePage.tsx",
    lineNumber: 405,
    columnNumber: 9
  }, this);
}
__name(HomePage, "HomePage");
export {
  HomePage as default
};
//# sourceMappingURL=HomePage.dev.js.map
