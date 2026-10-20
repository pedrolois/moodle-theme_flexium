var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
/**
 * In-place editing of the catalogue (edit mode, site administrators): a magic wand on each part of the page that can
 * change (card image, texts, badges, footer, toolbar, filters, header). Clicking it highlights that part and opens a
 * side panel with its options, previewed at once.
 *
 * @module     theme_flexium/catalog/EditZones
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { createContext, useContext, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import FeatureControl from "@moodle/lms/theme_flexium/catalog/FeatureControl";
import { parseLabels } from "@moodle/lms/theme_flexium/catalog/QuickFilters";
import WidgetList from "@moodle/lms/theme_flexium/catalog/WidgetList";
import { str } from "./utils";
const ZONES = {
  image: { features: ["statusbadges", "defaultimage", "quickview", "quickviewstyle", "favourites", "progress"] },
  text: { features: [], card: ["showcategory", "showsummary"] },
  badges: { features: [], card: ["badges"] },
  footer: { features: [], card: ["footer"] },
  toolbar: { features: ["sharelink", "defaultsort", "skeletons"] },
  views: { features: ["viewswitch", "defaultview", "gridcolumns", "viewcards", "listparts", "listimage"] },
  filters: {
    features: [
      "quickfilters",
      "daterange",
      "expandall",
      "optioncounts",
      "showemptyoptions",
      "groupsearch",
      "groupclear",
      "rememberopen"
    ],
    options: ["filtersdraweropen"]
  },
  heading: { features: ["pageheading", "pageheadingtext"] },
  filtertoggle: { features: ["filtericon", "filtericoncolour", "filtericonsize", "filtericonposition"] },
  blocktoggle: { features: ["blockicon", "blockiconcolour", "blockiconsize", "blockiconposition"] },
  quickfilters: { features: ["quickfilters", "optioncounts"] },
  breadcrumbs: { features: [
    "bc_enabled",
    "bc_pages",
    "bc_source",
    "bc_home",
    "bc_maxitems",
    "bc_maxlength",
    "bc_hidelast",
    "bc_hidecategories",
    "bc_hidesections",
    "bc_separator",
    "bc_style",
    "bc_mobile"
  ] },
  banner: { features: ["banner", "bannertitle", "bannertext", "bannerstyle"] },
  coursepage: { features: ["coursepage"] }
};
const EditZonesContext = createContext(null);
const EditZonesProvider = EditZonesContext.Provider;
const useEditZones = /* @__PURE__ */ __name(() => useContext(EditZonesContext), "useEditZones");
function Wand({ zone, edit }) {
  const title = str(edit.editor.strings, `editzone_${zone}`);
  const active = edit.active === zone || edit.active === "all" && edit.focus === zone;
  return /* @__PURE__ */ jsxDEV(
    "button",
    {
      type: "button",
      className: "flexium-editzone__wand",
      "data-zone": zone,
      "aria-expanded": active,
      "aria-label": str(edit.editor.strings, "editor_wand", title),
      title: str(edit.editor.strings, "editor_wand", title),
      onClick: () => edit.setActive(active ? "" : zone),
      children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-wand-magic-sparkles", "aria-hidden": "true" }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
        lineNumber: 103,
        columnNumber: 13
      }, this)
    },
    void 0,
    false,
    {
      fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
      lineNumber: 100,
      columnNumber: 9
    },
    this
  );
}
__name(Wand, "Wand");
function ExternalZone({ zone, selector }) {
  const edit = useEditZones();
  const [element] = useState(() => document.querySelector(selector));
  const editing = !!edit;
  const active = editing && (edit.active === zone || edit.active === "all" && edit.focus === zone);
  useEffect(() => {
    if (!element || !editing) {
      return void 0;
    }
    element.classList.add("flexium-editzone", "flexium-editzone--padded");
    return () => element.classList.remove("flexium-editzone", "flexium-editzone--padded");
  }, [element, editing]);
  useEffect(() => {
    element?.classList.toggle("flexium-editzone--active", active);
  }, [element, active]);
  return edit && element ? createPortal(/* @__PURE__ */ jsxDEV(Wand, { zone, edit }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
    lineNumber: 130,
    columnNumber: 43
  }, this), element) : null;
}
__name(ExternalZone, "ExternalZone");
function EditZone({ zone, children, enabled = true, className = "" }) {
  const edit = useEditZones();
  if (!edit || !enabled) {
    return /* @__PURE__ */ jsxDEV(Fragment, { children }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
      lineNumber: 140,
      columnNumber: 16
    }, this);
  }
  const active = edit.active === zone || edit.active === "all" && edit.focus === zone;
  return /* @__PURE__ */ jsxDEV("div", { className: `flexium-editzone${active ? " flexium-editzone--active" : ""} ${className}`, children: [
    children,
    /* @__PURE__ */ jsxDEV(Wand, { zone, edit }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
      lineNumber: 146,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
    lineNumber: 144,
    columnNumber: 9
  }, this);
}
__name(EditZone, "EditZone");
function CardControl({ setting, edit }) {
  const id = useId();
  const strings = edit.editor.strings;
  const set = /* @__PURE__ */ __name((changes) => edit.onCardChange({ ...edit.card, ...changes }), "set");
  if (setting === "badges") {
    const colourof = /* @__PURE__ */ __name((source) => edit.card.badgecolours.find((item) => item.source === source)?.colour ?? "primary", "colourof");
    const setColour = /* @__PURE__ */ __name((source, colour) => set({ badgecolours: [
      ...edit.card.badgecolours.filter((item) => item.source !== source),
      { source, colour }
    ] }), "setColour");
    return /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flexium-feature flexium-feature--wide", "data-feature": "card-badges", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "flexium-feature__label mb-1", children: str(strings, "cardbadges") }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
          lineNumber: 169,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV(
          WidgetList,
          {
            title: str(strings, "cardbadges"),
            value: edit.card.badges,
            choices: edit.editor.badgechoices,
            onChange: (value) => set({ badges: value }),
            strings,
            renderExtra: (source) => (
              // Colour of this source's badges.
              /* @__PURE__ */ jsxDEV(
                "div",
                {
                  className: "flexium-colours",
                  role: "radiogroup",
                  "aria-label": str(strings, "cardbadgecolour", source),
                  children: edit.editor.badgecolours.map((colour) => /* @__PURE__ */ jsxDEV(
                    "button",
                    {
                      type: "button",
                      role: "radio",
                      "aria-checked": colourof(source) === colour,
                      className: `flexium-colours__swatch text-bg-${colour}` + (colourof(source) === colour ? " is-active" : ""),
                      title: colour,
                      "aria-label": colour,
                      onClick: () => setColour(source, colour)
                    },
                    colour,
                    false,
                    {
                      fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
                      lineNumber: 177,
                      columnNumber: 37
                    },
                    this
                  ))
                },
                void 0,
                false,
                {
                  fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
                  lineNumber: 174,
                  columnNumber: 29
                },
                this
              )
            )
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
            lineNumber: 170,
            columnNumber: 21
          },
          this
        )
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
        lineNumber: 168,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flexium-feature", "data-feature": "card-badgerows", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "form-check form-switch", children: [
          /* @__PURE__ */ jsxDEV(
            "input",
            {
              id,
              type: "checkbox",
              role: "switch",
              className: "form-check-input",
              checked: edit.card.badgerows,
              onChange: (event) => set({ badgerows: event.target.checked })
            },
            void 0,
            false,
            {
              fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
              lineNumber: 187,
              columnNumber: 25
            },
            this
          ),
          /* @__PURE__ */ jsxDEV("label", { htmlFor: id, className: "form-check-label flexium-feature__label", children: str(strings, "cardbadgerows") }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
            lineNumber: 189,
            columnNumber: 25
          }, this)
        ] }, void 0, true, {
          fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
          lineNumber: 186,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "flexium-feature__help", children: str(strings, "cardbadgerows_desc") }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
          lineNumber: 193,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
        lineNumber: 185,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
      lineNumber: 167,
      columnNumber: 13
    }, this);
  }
  if (setting === "footer") {
    return /* @__PURE__ */ jsxDEV("div", { className: "flexium-feature flexium-feature--wide", "data-feature": "card-footer", children: [
      /* @__PURE__ */ jsxDEV("p", { className: "flexium-feature__label mb-1", children: str(strings, "cardfooter") }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
        lineNumber: 201,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV(
        WidgetList,
        {
          title: str(strings, "cardfooter"),
          value: edit.card.footer,
          choices: edit.editor.footerchoices,
          onChange: (value) => set({ footer: value }),
          strings
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
          lineNumber: 202,
          columnNumber: 17
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
      lineNumber: 200,
      columnNumber: 13
    }, this);
  }
  if (setting !== "showcategory" && setting !== "showsummary") {
    return null;
  }
  const key = setting === "showcategory" ? "cardshowcategory" : "cardshowsummary";
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-feature", "data-feature": `card-${setting}`, children: /* @__PURE__ */ jsxDEV("div", { className: "form-check form-switch", children: [
    /* @__PURE__ */ jsxDEV(
      "input",
      {
        id,
        type: "checkbox",
        role: "switch",
        className: "form-check-input",
        checked: edit.card[setting],
        onChange: (event) => set({ [setting]: event.target.checked })
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
        lineNumber: 214,
        columnNumber: 17
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("label", { htmlFor: id, className: "form-check-label flexium-feature__label", children: str(strings, key) }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
      lineNumber: 216,
      columnNumber: 17
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
    lineNumber: 213,
    columnNumber: 13
  }, this) }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
    lineNumber: 212,
    columnNumber: 9
  }, this);
}
__name(CardControl, "CardControl");
function OptionControl({ edit }) {
  const id = useId();
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-feature", "data-feature": "option-filtersdraweropen", children: /* @__PURE__ */ jsxDEV("div", { className: "form-check form-switch", children: [
    /* @__PURE__ */ jsxDEV(
      "input",
      {
        id,
        type: "checkbox",
        role: "switch",
        className: "form-check-input",
        checked: edit.options.filtersdraweropen,
        onChange: (event) => edit.onOptionsChange({ ...edit.options, filtersdraweropen: event.target.checked })
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
        lineNumber: 233,
        columnNumber: 17
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("label", { htmlFor: id, className: "form-check-label flexium-feature__label", children: str(edit.editor.strings, "editor_filtersdraweropen") }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
      lineNumber: 236,
      columnNumber: 17
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
    lineNumber: 232,
    columnNumber: 13
  }, this) }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
    lineNumber: 231,
    columnNumber: 9
  }, this);
}
__name(OptionControl, "OptionControl");
function QuickLabels({ edit }) {
  const id = useId();
  const strings = edit.editor.strings;
  const keys = (edit.features.quickfilters ?? "").split(",").filter(Boolean);
  const labels = parseLabels(edit.features.quicklabels ?? "");
  if (!keys.length) {
    return null;
  }
  const set = /* @__PURE__ */ __name((key, name) => {
    const next = { ...labels, [key]: name };
    if (!name) {
      delete next[key];
    }
    edit.onFeatureChange("quicklabels", Object.keys(next).length ? JSON.stringify(next) : "");
  }, "set");
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-feature", "data-feature": "quicklabels", children: [
    /* @__PURE__ */ jsxDEV("p", { className: "flexium-feature__label mb-1", children: str(strings, "feature_quicklabels") }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
      lineNumber: 267,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("p", { className: "flexium-feature__help", children: str(strings, "feature_quicklabels_desc") }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
      lineNumber: 268,
      columnNumber: 13
    }, this),
    keys.map((key) => /* @__PURE__ */ jsxDEV("div", { className: "mt-2", children: [
      /* @__PURE__ */ jsxDEV("label", { htmlFor: `${id}-${key}`, className: "visually-hidden", children: str(strings, `quick_${key}`) }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
        lineNumber: 271,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV(
        "input",
        {
          id: `${id}-${key}`,
          type: "text",
          className: "form-control form-control-sm",
          maxLength: 40,
          "data-quick": key,
          value: labels[key] ?? "",
          placeholder: str(strings, `quick_${key}`),
          onChange: (event) => set(key, event.target.value)
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
          lineNumber: 272,
          columnNumber: 21
        },
        this
      )
    ] }, key, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
      lineNumber: 270,
      columnNumber: 17
    }, this))
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
    lineNumber: 266,
    columnNumber: 9
  }, this);
}
__name(QuickLabels, "QuickLabels");
function ZoneControls({ zone, edit }) {
  const definition = ZONES[zone];
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-editpanel__controls", children: [
    definition.card?.map((setting) => /* @__PURE__ */ jsxDEV(CardControl, { setting, edit }, setting, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
      lineNumber: 292,
      columnNumber: 46
    }, this)),
    definition.options?.map((option) => /* @__PURE__ */ jsxDEV(OptionControl, { edit }, option, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
      lineNumber: 293,
      columnNumber: 48
    }, this)),
    (zone === "filters" || zone === "quickfilters") && /* @__PURE__ */ jsxDEV(QuickLabels, { edit }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
      lineNumber: 294,
      columnNumber: 65
    }, this),
    definition.features.map((key) => {
      const feature = edit.editor.featuredefs.find((item) => item.key === key);
      return feature && /* @__PURE__ */ jsxDEV(
        FeatureControl,
        {
          definition: feature,
          value: edit.features[key] ?? "",
          onChange: (value) => edit.onFeatureChange(key, value),
          palette: edit.palette,
          strings: edit.editor.strings,
          upload: edit.editor.imageupload,
          onUploaded: edit.onImageUploaded
        },
        key,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
          lineNumber: 298,
          columnNumber: 21
        },
        this
      );
    })
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
    lineNumber: 291,
    columnNumber: 9
  }, this);
}
__name(ZoneControls, "ZoneControls");
function Spotlight({ zone }) {
  const [rect, setRect] = useState(null);
  useEffect(() => {
    const measure = /* @__PURE__ */ __name(() => {
      const element2 = document.querySelector(".flexium-editzone--active");
      setRect(element2 ? element2.getBoundingClientRect() : null);
    }, "measure");
    const element = document.querySelector(".flexium-editzone--active");
    element?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    measure();
    const timer = window.setInterval(measure, 250);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [zone]);
  if (!rect) {
    return null;
  }
  const margin = 6;
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-spotlight", "aria-hidden": "true", style: {
    top: rect.top - margin,
    left: rect.left - margin,
    width: rect.width + 2 * margin,
    height: rect.height + 2 * margin
  } }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
    lineNumber: 339,
    columnNumber: 9
  }, this);
}
__name(Spotlight, "Spotlight");
function Accordion({ edit }) {
  const id = useId();
  const strings = edit.editor.strings;
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-editpanel__accordion", children: Object.keys(ZONES).map((zone) => {
    const open = edit.focus === zone;
    return /* @__PURE__ */ jsxDEV("section", { className: `flexium-editpanel__section${open ? " is-open" : ""}`, "data-zone": zone, children: [
      /* @__PURE__ */ jsxDEV("h3", { className: "flexium-editpanel__sectionheading", children: /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          id: `${id}-${zone}`,
          "aria-expanded": open,
          "aria-controls": `${id}-${zone}-body`,
          className: "flexium-editpanel__sectiontoggle",
          onClick: () => edit.setFocus(open ? "" : zone),
          children: [
            str(strings, `editzone_${zone}`),
            /* @__PURE__ */ jsxDEV("i", { className: `fa fa-chevron-${open ? "up" : "down"}`, "aria-hidden": "true" }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
              lineNumber: 368,
              columnNumber: 33
            }, this)
          ]
        },
        void 0,
        true,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
          lineNumber: 365,
          columnNumber: 29
        },
        this
      ) }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
        lineNumber: 364,
        columnNumber: 25
      }, this),
      /* @__PURE__ */ jsxDEV(
        "div",
        {
          id: `${id}-${zone}-body`,
          className: "flexium-editpanel__sectionbody",
          hidden: !open,
          role: "region",
          "aria-labelledby": `${id}-${zone}`,
          children: open && /* @__PURE__ */ jsxDEV(ZoneControls, { zone, edit }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
            lineNumber: 373,
            columnNumber: 38
          }, this)
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
          lineNumber: 371,
          columnNumber: 25
        },
        this
      )
    ] }, zone, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
      lineNumber: 363,
      columnNumber: 21
    }, this);
  }) }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
    lineNumber: 359,
    columnNumber: 9
  }, this);
}
__name(Accordion, "Accordion");
function EditSidePanel() {
  const edit = useEditZones();
  const id = useId();
  const active = edit?.active ?? "";
  const close = edit?.setActive;
  useEffect(() => {
    if (!active || !close) {
      return void 0;
    }
    const onKey = /* @__PURE__ */ __name((event) => event.key === "Escape" && close(""), "onKey");
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, close]);
  if (!edit || !active) {
    return null;
  }
  const strings = edit.editor.strings;
  const highlighted = active === "all" ? edit.focus : active;
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    highlighted && /* @__PURE__ */ jsxDEV(Spotlight, { zone: highlighted }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
      lineNumber: 407,
      columnNumber: 25
    }, this),
    /* @__PURE__ */ jsxDEV("aside", { className: "flexium-editpanel", "aria-labelledby": `${id}-title`, children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flexium-editpanel__header", children: [
        /* @__PURE__ */ jsxDEV("h2", { id: `${id}-title`, className: "flexium-editpanel__title", children: [
          /* @__PURE__ */ jsxDEV("i", { className: "fa fa-wand-magic-sparkles me-2", "aria-hidden": "true" }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
            lineNumber: 411,
            columnNumber: 21
          }, this),
          str(strings, `editzone_${active}`)
        ] }, void 0, true, {
          fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
          lineNumber: 410,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            className: "btn-close",
            "aria-label": str(strings, "editor_closepanel"),
            onClick: () => edit.setActive("")
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
            lineNumber: 414,
            columnNumber: 17
          },
          this
        )
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
        lineNumber: 409,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flexium-editpanel__body", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "flexium-feature__help mb-3", children: str(strings, "editor_aftersave") }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
          lineNumber: 418,
          columnNumber: 17
        }, this),
        active === "all" ? /* @__PURE__ */ jsxDEV(Accordion, { edit }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
          lineNumber: 419,
          columnNumber: 37
        }, this) : /* @__PURE__ */ jsxDEV(ZoneControls, { zone: active, edit }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
          lineNumber: 419,
          columnNumber: 65
        }, this)
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
        lineNumber: 417,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
      lineNumber: 408,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/EditZones.tsx",
    lineNumber: 406,
    columnNumber: 9
  }, this);
}
__name(EditSidePanel, "EditSidePanel");
export {
  EditSidePanel,
  EditZone,
  EditZonesProvider,
  ExternalZone,
  Spotlight,
  ZONES,
  useEditZones
};
//# sourceMappingURL=EditZones.dev.js.map
