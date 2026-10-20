var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
/**
 * Page margins wand (edit mode, site administrators): left and right space around the page content, for the whole
 * site or only the home page / catalogue, with a live preview. Mounted on every page by core_renderer::margins_wand().
 *
 * @module     theme_flexium/margins/MarginsWand
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useEffect, useId, useState } from "react";
import { fetchOne } from "@moodle/lms/core/ajax";
const SCOPES = { site: "", home: "#page-site-index", catalog: ".flexium-catalogpage" };
const SIDES = ["left", "right"];
const PARTS = { footer: ".flexium-footer", navbar: ".navbar.fixed-top" };
const EMPTY = { left: null, right: null, footer: false, navbar: false };
const marginsCss = /* @__PURE__ */ __name((margins) => {
  const rules = Object.entries(SCOPES).map(([scope, body]) => {
    const sides = margins[scope] ?? EMPTY;
    const declarations = SIDES.filter((side) => sides[side] !== null).map((side) => `padding-${side}: min(${sides[side]}px, 12vw);`).join(" ");
    if (!declarations) {
      return "";
    }
    const selectors = [
      `body${body} #page-wrapper #page .main-inner`,
      ...Object.keys(PARTS).filter((part) => sides[part]).map((part) => `body${body} #page-wrapper ${PARTS[part]}`)
    ];
    return `${selectors.join(", ")} { ${declarations} }`;
  }).join("\n");
  return `@media (min-width: 768px) {
${rules}
}`;
}, "marginsCss");
function MarginsWand({ margins, pagescope, max, strings }) {
  const id = useId();
  const str = /* @__PURE__ */ __name((key, a = "") => (strings[key] ?? key).replace("{$a}", a), "str");
  const [saved, setSaved] = useState(margins);
  const [draft, setDraft] = useState(margins);
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState(pagescope || "site");
  const [linked, setLinked] = useState(true);
  const [status, setStatus] = useState("idle");
  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);
  const sides = draft[scope] ?? EMPTY;
  const overridden = scope === "site" && pagescope !== "" && SIDES.some((side) => draft[pagescope]?.[side] !== null && draft[pagescope]?.[side] !== void 0);
  useEffect(() => {
    if (!open && !dirty) {
      return void 0;
    }
    const style = document.createElement("style");
    style.id = "flexium-margins-preview";
    style.textContent = marginsCss(draft);
    document.body.appendChild(style);
    document.body.classList.toggle("flexium-margins-editing", open);
    return () => {
      style.remove();
      document.body.classList.remove("flexium-margins-editing");
    };
  }, [draft, open, dirty]);
  const setPart = /* @__PURE__ */ __name((part, value) => {
    setDraft({ ...draft, [scope]: { ...sides, [part]: value } });
    setStatus("idle");
  }, "setPart");
  const setSide = /* @__PURE__ */ __name((side, value) => {
    const next = { ...sides, [side]: value };
    if (linked) {
      next.left = value;
      next.right = value;
    }
    setDraft({ ...draft, [scope]: next });
    setStatus("idle");
  }, "setSide");
  const save = /* @__PURE__ */ __name(() => {
    setStatus("saving");
    fetchOne({
      methodname: "theme_flexium_save_page_margins",
      args: { margins: Object.entries(draft).map(([key, value]) => ({
        scope: key,
        left: value.left ?? -1,
        right: value.right ?? -1,
        footer: value.footer,
        navbar: value.navbar
      })) }
    }).then((result) => {
      const next = {};
      result.forEach((item) => {
        next[item.scope] = {
          left: item.left < 0 ? null : item.left,
          right: item.right < 0 ? null : item.right,
          footer: item.footer,
          navbar: item.navbar
        };
      });
      setSaved(next);
      setDraft(next);
      setStatus("saved");
      return next;
    }).catch(() => setStatus("error"));
  }, "save");
  const scopes = ["site", ...pagescope ? [pagescope] : []];
  const wand = /* @__PURE__ */ jsxDEV(
    "button",
    {
      type: "button",
      className: "btn btn-primary flexium-marginswand",
      "aria-expanded": open,
      "aria-controls": `${id}-panel`,
      onClick: () => setOpen(!open),
      children: [
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-wand-magic-sparkles me-2", "aria-hidden": "true" }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
          lineNumber: 152,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-left-right me-2", "aria-hidden": "true" }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
          lineNumber: 153,
          columnNumber: 13
        }, this),
        str("margins_title")
      ]
    },
    void 0,
    true,
    {
      fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
      lineNumber: 150,
      columnNumber: 9
    },
    this
  );
  const panel = open && /* @__PURE__ */ jsxDEV("section", { id: `${id}-panel`, className: "flexium-marginspanel", "aria-labelledby": `${id}-title`, children: [
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-marginspanel__header", children: [
      /* @__PURE__ */ jsxDEV("h2", { id: `${id}-title`, className: "h6 m-0", children: [
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-left-right me-2", "aria-hidden": "true" }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
          lineNumber: 162,
          columnNumber: 21
        }, this),
        str("margins_title")
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
        lineNumber: 161,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          className: "btn-close",
          "aria-label": str("editor_closepanel"),
          onClick: () => setOpen(false)
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
          lineNumber: 164,
          columnNumber: 17
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
      lineNumber: 160,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("p", { className: "flexium-marginspanel__help", children: str("margins_help") }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
      lineNumber: 167,
      columnNumber: 13
    }, this),
    scopes.length > 1 && /* @__PURE__ */ jsxDEV("fieldset", { className: "flexium-marginspanel__scopes", children: [
      /* @__PURE__ */ jsxDEV("legend", { className: "flexium-marginspanel__label", children: str("margins_scope") }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
        lineNumber: 171,
        columnNumber: 21
      }, this),
      scopes.map((key) => /* @__PURE__ */ jsxDEV("div", { className: "form-check form-check-inline", children: [
        /* @__PURE__ */ jsxDEV(
          "input",
          {
            id: `${id}-scope-${key}`,
            type: "radio",
            className: "form-check-input",
            name: `${id}-scope`,
            checked: scope === key,
            onChange: () => setScope(key)
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
            lineNumber: 174,
            columnNumber: 29
          },
          this
        ),
        /* @__PURE__ */ jsxDEV("label", { htmlFor: `${id}-scope-${key}`, className: "form-check-label", children: str(`margins_scope_${key}`) }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
          lineNumber: 176,
          columnNumber: 29
        }, this)
      ] }, key, true, {
        fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
        lineNumber: 173,
        columnNumber: 25
      }, this))
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
      lineNumber: 170,
      columnNumber: 17
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "form-check form-switch mb-2", children: [
      /* @__PURE__ */ jsxDEV(
        "input",
        {
          id: `${id}-link`,
          type: "checkbox",
          role: "switch",
          className: "form-check-input",
          checked: linked,
          onChange: (event) => setLinked(event.target.checked)
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
          lineNumber: 185,
          columnNumber: 17
        },
        this
      ),
      /* @__PURE__ */ jsxDEV("label", { htmlFor: `${id}-link`, className: "form-check-label", children: str("margins_link") }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
        lineNumber: 187,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
      lineNumber: 184,
      columnNumber: 13
    }, this),
    SIDES.map((side) => /* @__PURE__ */ jsxDEV("div", { className: "flexium-marginspanel__side", children: [
      /* @__PURE__ */ jsxDEV("label", { htmlFor: `${id}-${side}`, className: "flexium-marginspanel__label", children: [
        str(`margins_${side}`),
        /* @__PURE__ */ jsxDEV("span", { className: "flexium-marginspanel__value", children: sides[side] === null ? str("margins_default") : `${sides[side]} px` }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
          lineNumber: 194,
          columnNumber: 25
        }, this)
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
        lineNumber: 192,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flexium-marginspanel__row", children: [
        /* @__PURE__ */ jsxDEV(
          "input",
          {
            id: `${id}-${side}`,
            type: "range",
            className: "form-range",
            min: 0,
            max,
            step: 8,
            value: sides[side] ?? 0,
            disabled: linked && side === "right",
            onChange: (event) => setSide(side, Number(event.target.value))
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
            lineNumber: 199,
            columnNumber: 25
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            className: "btn btn-link btn-sm p-0",
            disabled: sides[side] === null,
            onClick: () => setSide(side, null),
            children: str("margins_default")
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
            lineNumber: 202,
            columnNumber: 25
          },
          this
        )
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
        lineNumber: 198,
        columnNumber: 21
      }, this)
    ] }, side, true, {
      fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
      lineNumber: 191,
      columnNumber: 17
    }, this)),
    /* @__PURE__ */ jsxDEV("fieldset", { className: "flexium-marginspanel__parts", children: [
      /* @__PURE__ */ jsxDEV("legend", { className: "flexium-marginspanel__label", children: str("margins_alsoapply") }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
        lineNumber: 209,
        columnNumber: 17
      }, this),
      Object.keys(PARTS).map((part) => /* @__PURE__ */ jsxDEV("div", { className: "form-check form-switch", children: [
        /* @__PURE__ */ jsxDEV(
          "input",
          {
            id: `${id}-${part}`,
            type: "checkbox",
            role: "switch",
            className: "form-check-input",
            checked: sides[part],
            onChange: (event) => setPart(part, event.target.checked)
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
            lineNumber: 212,
            columnNumber: 25
          },
          this
        ),
        /* @__PURE__ */ jsxDEV("label", { htmlFor: `${id}-${part}`, className: "form-check-label", children: str(`margins_${part}`) }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
          lineNumber: 214,
          columnNumber: 25
        }, this)
      ] }, part, true, {
        fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
        lineNumber: 211,
        columnNumber: 21
      }, this))
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
      lineNumber: 208,
      columnNumber: 13
    }, this),
    overridden && /* @__PURE__ */ jsxDEV("p", { className: "flexium-marginspanel__note", children: str("margins_override") }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
      lineNumber: 219,
      columnNumber: 28
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-marginspanel__actions", children: [
      /* @__PURE__ */ jsxDEV("span", { role: "status", className: "flexium-marginspanel__status", children: [
        status === "saving" && str("editor_saving"),
        status === "saved" && !dirty && str("editor_saved"),
        status === "error" && str("editor_error"),
        status !== "saving" && dirty && str("editor_unsaved")
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
        lineNumber: 222,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          className: "btn btn-sm btn-outline-secondary",
          disabled: !dirty || status === "saving",
          onClick: () => {
            setDraft(saved);
            setStatus("idle");
          },
          children: str("editor_reset")
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
          lineNumber: 228,
          columnNumber: 17
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          className: "btn btn-sm btn-primary",
          disabled: !dirty || status === "saving",
          onClick: save,
          children: str("editor_save")
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
          lineNumber: 233,
          columnNumber: 17
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
      lineNumber: 221,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
    lineNumber: 159,
    columnNumber: 9
  }, this);
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    wand,
    panel
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/margins/MarginsWand.tsx",
    lineNumber: 240,
    columnNumber: 9
  }, this);
}
__name(MarginsWand, "MarginsWand");
export {
  MarginsWand as default
};
//# sourceMappingURL=MarginsWand.dev.js.map
