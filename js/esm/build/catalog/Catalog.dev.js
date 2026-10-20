var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
/**
 * Flexium course catalogue: filter sidebar, active filters, sorting and the course grid.
 *
 * Mounted by theme_flexium\output\core\course_renderer::course_category(). The query lives in the
 * page URL (search, filters, quick filters, dates, sort, page), so results can be shared and survive reloads.
 *
 * Every optional part (see \theme_flexium\local\catalog\features) can be switched on and off; in edit mode the
 * draft features are previewed at once.
 *
 * @module     theme_flexium/catalog/Catalog
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ActiveFilters from "@moodle/lms/theme_flexium/catalog/ActiveFilters";
import Banner from "@moodle/lms/theme_flexium/catalog/Banner";
import CatalogFooter from "@moodle/lms/theme_flexium/catalog/CatalogFooter";
import CourseCard from "@moodle/lms/theme_flexium/catalog/CourseCard";
import DateRange from "@moodle/lms/theme_flexium/catalog/DateRange";
import EditorPanel from "@moodle/lms/theme_flexium/catalog/EditorPanel";
import { EditSidePanel, EditZone, EditZonesProvider, ExternalZone, useEditZones } from "@moodle/lms/theme_flexium/catalog/EditZones";
import FilterGroupPanel from "@moodle/lms/theme_flexium/catalog/FilterGroupPanel";
import QuickFilters from "@moodle/lms/theme_flexium/catalog/QuickFilters";
import QuickView from "@moodle/lms/theme_flexium/catalog/QuickView";
import ResultsToolbar from "@moodle/lms/theme_flexium/catalog/ResultsToolbar";
import SearchBox from "@moodle/lms/theme_flexium/catalog/SearchBox";
import WidgetList from "@moodle/lms/theme_flexium/catalog/WidgetList";
import useCatalogEditor from "@moodle/lms/theme_flexium/catalog/useCatalogEditor";
import { getCatalog, setFavourite, setPreference } from "./repository";
import {
  decodeFeatures,
  readLocal,
  readQueryFromUrl,
  str,
  toggleValue,
  writeLocal,
  writeQueryToUrl
} from "./utils";
const PREF_GROUPS = "theme_flexium_catalog_groups";
const PREF_VIEW = "theme_flexium_catalog_view";
const SKELETON_CARDS = 6;
function FilterWidgets({ editor, layout, onChange }) {
  const itemof = /* @__PURE__ */ __name((source) => layout.find((item) => item.source === source), "itemof");
  const expanded = /* @__PURE__ */ __name((source) => itemof(source)?.expanded ?? false, "expanded");
  const update = /* @__PURE__ */ __name((source, changes) => onChange(layout.map((item) => item.source === source ? { ...item, ...changes } : item)), "update");
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-filterwidgets", children: [
    /* @__PURE__ */ jsxDEV(EditZone, { zone: "filters", children: /* @__PURE__ */ jsxDEV("h3", { className: "flexium-filterwidgets__title", children: str(editor.strings, "editor_filterstitle") }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
      lineNumber: 77,
      columnNumber: 17
    }, this) }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
      lineNumber: 76,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV(
      WidgetList,
      {
        title: str(editor.strings, "editor_filterstitle"),
        value: layout.map((item) => item.source),
        choices: editor.sources,
        onChange: (sources) => onChange(sources.map((source) => ({
          source,
          expanded: expanded(source),
          label: itemof(source)?.label ?? ""
        }))),
        renderExtra: (source) => /* @__PURE__ */ jsxDEV(Fragment, { children: [
          /* @__PURE__ */ jsxDEV(
            "input",
            {
              type: "text",
              className: "form-control form-control-sm flexium-widget__name",
              maxLength: 100,
              value: itemof(source)?.label ?? "",
              "aria-label": str(editor.strings, "filtereditor_name"),
              placeholder: editor.sources.find((choice) => choice.key === source)?.label ?? "",
              onChange: (event) => update(source, { label: event.target.value })
            },
            void 0,
            false,
            {
              fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
              lineNumber: 88,
              columnNumber: 25
            },
            this
          ),
          /* @__PURE__ */ jsxDEV("label", { className: "flexium-widget__check", children: [
            /* @__PURE__ */ jsxDEV(
              "input",
              {
                type: "checkbox",
                className: "form-check-input me-1",
                checked: expanded(source),
                onChange: (event) => update(source, { expanded: event.target.checked })
              },
              void 0,
              false,
              {
                fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
                lineNumber: 93,
                columnNumber: 29
              },
              this
            ),
            str(editor.strings, "filtereditor_expanded")
          ] }, void 0, true, {
            fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
            lineNumber: 92,
            columnNumber: 25
          }, this)
        ] }, void 0, true, {
          fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
          lineNumber: 86,
          columnNumber: 21
        }, this),
        strings: editor.strings
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
        lineNumber: 79,
        columnNumber: 13
      },
      this
    )
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
    lineNumber: 75,
    columnNumber: 9
  }, this);
}
__name(FilterWidgets, "FilterWidgets");
const gridClasses = /* @__PURE__ */ __name((features, view) => {
  const classes = ["flexium-catalog__grid", `flexium-catalog__grid--${view}`];
  if (view === "grid" && features.gridcolumns !== "auto") {
    classes.push(`flexium-catalog__grid--cols-${features.gridcolumns}`);
  }
  if (view === "list" && features.viewcards === "separate") {
    classes.push(`flexium-catalog__grid--image-${features.listimage}`);
    ["image", "category", "summary", "badges", "footer"].filter((part) => !features.listparts.includes(part)).forEach((part) => classes.push(`flexium-catalog__grid--no-${part}`));
  }
  return classes.join(" ");
}, "gridClasses");
function Results({
  data,
  loading,
  error,
  strings,
  features,
  view,
  loggedin,
  onFavourite,
  onQuickView,
  editing,
  badgestyle
}) {
  const gridclass = gridClasses(features, view);
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      className: `flexium-catalog__results${loading ? " flexium-catalog__results--loading" : ""}`,
      "aria-busy": loading,
      children: [
        !data && loading && (features.skeletons ? /* @__PURE__ */ jsxDEV("ul", { className: gridclass, "aria-hidden": "true", children: Array.from({ length: SKELETON_CARDS }, (_, index) => /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV("div", { className: "flexium-card flexium-card--skeleton", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flexium-card__image" }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
            lineNumber: 153,
            columnNumber: 33
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flexium-card__body", children: [
            /* @__PURE__ */ jsxDEV("span", { className: "flexium-skeleton flexium-skeleton--short" }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
              lineNumber: 155,
              columnNumber: 37
            }, this),
            /* @__PURE__ */ jsxDEV("span", { className: "flexium-skeleton flexium-skeleton--title" }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
              lineNumber: 156,
              columnNumber: 37
            }, this),
            /* @__PURE__ */ jsxDEV("span", { className: "flexium-skeleton" }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
              lineNumber: 157,
              columnNumber: 37
            }, this),
            /* @__PURE__ */ jsxDEV("span", { className: "flexium-skeleton" }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
              lineNumber: 158,
              columnNumber: 37
            }, this)
          ] }, void 0, true, {
            fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
            lineNumber: 154,
            columnNumber: 33
          }, this)
        ] }, void 0, true, {
          fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
          lineNumber: 152,
          columnNumber: 29
        }, this) }, index, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
          lineNumber: 151,
          columnNumber: 25
        }, this)) }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
          lineNumber: 149,
          columnNumber: 17
        }, this) : /* @__PURE__ */ jsxDEV("div", { className: "flexium-catalog__loading", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "spinner-border spinner-border-sm me-2", "aria-hidden": "true" }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
            lineNumber: 166,
            columnNumber: 21
          }, this),
          str(strings, "catalog_loading")
        ] }, void 0, true, {
          fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
          lineNumber: 165,
          columnNumber: 17
        }, this)),
        data && data.courses.length === 0 && !error && /* @__PURE__ */ jsxDEV("div", { className: "flexium-catalog__empty", children: [
          /* @__PURE__ */ jsxDEV("i", { className: "fa fa-magnifying-glass flexium-catalog__emptyicon", "aria-hidden": "true" }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
            lineNumber: 172,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDEV("h2", { className: "h4", children: str(strings, "catalog_noresults") }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
            lineNumber: 173,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: str(strings, "catalog_noresults_help") }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
            lineNumber: 174,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
          lineNumber: 171,
          columnNumber: 17
        }, this),
        data && data.courses.length > 0 && /* @__PURE__ */ jsxDEV("ul", { className: gridclass, children: data.courses.map((course, index) => /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(
          CourseCard,
          {
            course,
            strings,
            features,
            loggedin,
            onFavourite,
            onQuickView,
            wands: editing && index === 0,
            badgestyle
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
            lineNumber: 181,
            columnNumber: 29
          },
          this
        ) }, course.id, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
          lineNumber: 180,
          columnNumber: 25
        }, this)) }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
          lineNumber: 178,
          columnNumber: 17
        }, this)
      ]
    },
    void 0,
    true,
    {
      fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
      lineNumber: 146,
      columnNumber: 9
    },
    this
  );
}
__name(Results, "Results");
const resolvePerpage = /* @__PURE__ */ __name((options, userperpage, perpageoptions, chosen, defaultperpage) => {
  if (options) {
    return { allowuser: options.userperpage, perpage: options.perpage };
  }
  return { allowuser: userperpage, perpage: userperpage && perpageoptions.includes(chosen) ? chosen : defaultperpage };
}, "resolvePerpage");
const remember = /* @__PURE__ */ __name((name, value, loggedin) => {
  if (loggedin) {
    setPreference(name, value).catch(() => writeLocal(name, value));
  } else {
    writeLocal(name, value);
  }
}, "remember");
const remembered = /* @__PURE__ */ __name((name, saved, loggedin) => loggedin && saved || readLocal(name), "remembered");
const resolveView = /* @__PURE__ */ __name((features, chosen) => features.viewswitch && ["grid", "list"].includes(chosen) ? chosen : features.defaultview, "resolveView");
const parseGroups = /* @__PURE__ */ __name((json) => {
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}, "parseGroups");
const effectiveQuery = /* @__PURE__ */ __name((query, quickfilters, daterange) => ({
  ...query,
  quick: query.quick.filter((key) => quickfilters.includes(key)),
  startfrom: daterange ? query.startfrom : "",
  startto: daterange ? query.startto : ""
}), "effectiveQuery");
const countActive = /* @__PURE__ */ __name((query) => Object.values(query.selected).reduce((sum, values) => sum + values.length, 0) + query.quick.length + [query.search, query.startfrom, query.startto].filter(Boolean).length, "countActive");
function QuickFiltersZone({ features, data, selected, loggedin, quickicons, strings, onToggle }) {
  const editing = !!useEditZones();
  if (!features.quickfilters.length && !editing) {
    return null;
  }
  return /* @__PURE__ */ jsxDEV(EditZone, { zone: "quickfilters", className: "flexium-editzone--padded", children: features.quickfilters.length > 0 ? /* @__PURE__ */ jsxDEV(
    QuickFilters,
    {
      keys: features.quickfilters,
      quick: data?.quick ?? [],
      selected,
      loggedin,
      icons: quickicons,
      onToggle,
      showcount: features.optioncounts,
      strings,
      labels: features.quicklabels
    },
    void 0,
    false,
    {
      fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
      lineNumber: 317,
      columnNumber: 17
    },
    this
  ) : /* @__PURE__ */ jsxDEV("p", { className: "flexium-filtergroup__empty", children: str(strings, "catalog_noquickfilters") }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
    lineNumber: 320,
    columnNumber: 17
  }, this) }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
    lineNumber: 315,
    columnNumber: 9
  }, this);
}
__name(QuickFiltersZone, "QuickFiltersZone");
function CatalogFilters({
  query,
  effective,
  data,
  features,
  loggedin,
  quickicons,
  strings,
  bulk,
  onBulk,
  onUpdate,
  onToggle,
  groupsopen,
  onGroupOpen
}) {
  const [openstate, setOpenstate] = useState({});
  const setOpenState = /* @__PURE__ */ __name((source, open) => setOpenstate((current) => ({ ...current, [source]: open })), "setOpenState");
  const allopen = !!data?.groups.length && data.groups.every((group) => openstate[group.source]);
  const clearGroup = /* @__PURE__ */ __name((source) => {
    const selected = { ...query.selected };
    delete selected[source];
    onUpdate({ selected });
  }, "clearGroup");
  const toggleQuick = /* @__PURE__ */ __name((key) => onUpdate({
    quick: query.quick.includes(key) ? query.quick.filter((item) => item !== key) : [...query.quick, key]
  }), "toggleQuick");
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV(SearchBox, { value: query.search, onSearch: (search) => onUpdate({ search }), strings }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
      lineNumber: 346,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV(
      QuickFiltersZone,
      {
        features,
        data,
        selected: effective.quick,
        loggedin,
        quickicons,
        strings,
        onToggle: toggleQuick
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
        lineNumber: 347,
        columnNumber: 13
      },
      this
    ),
    features.daterange && /* @__PURE__ */ jsxDEV(
      DateRange,
      {
        from: query.startfrom,
        to: query.startto,
        strings,
        onChange: (startfrom, startto) => onUpdate({ startfrom, startto })
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
        lineNumber: 350,
        columnNumber: 17
      },
      this
    ),
    features.expandall && !!data?.groups.length && /* @__PURE__ */ jsxDEV("div", { className: "flexium-catalog__expandall", children: /* @__PURE__ */ jsxDEV("button", { type: "button", className: "btn btn-link btn-sm", onClick: () => onBulk({ open: !allopen }), children: [
      /* @__PURE__ */ jsxDEV("i", { className: `fa fa-angles-${allopen ? "up" : "down"} me-1`, "aria-hidden": "true" }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
        lineNumber: 356,
        columnNumber: 25
      }, this),
      str(strings, allopen ? "catalog_collapseall" : "catalog_expandall")
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
      lineNumber: 355,
      columnNumber: 21
    }, this) }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
      lineNumber: 354,
      columnNumber: 17
    }, this),
    data?.groups.map((group) => /* @__PURE__ */ jsxDEV(
      FilterGroupPanel,
      {
        group,
        onToggle,
        onClear: clearGroup,
        strings,
        bulk,
        features,
        onOpenChange: onGroupOpen,
        onOpenState: setOpenState,
        savedopen: features.rememberopen ? groupsopen[group.source] : void 0
      },
      group.source,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
        lineNumber: 362,
        columnNumber: 17
      },
      this
    ))
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
    lineNumber: 345,
    columnNumber: 9
  }, this);
}
__name(CatalogFilters, "CatalogFilters");
function EditHint({ strings }) {
  const [collapsed, setCollapsed] = useState(() => readLocal("edithint") === "hidden");
  const toggle = /* @__PURE__ */ __name((next) => {
    writeLocal("edithint", next ? "hidden" : "");
    setCollapsed(next);
  }, "toggle");
  if (collapsed) {
    return /* @__PURE__ */ jsxDEV("button", { type: "button", className: "flexium-edithint__pill", onClick: () => toggle(false), children: [
      /* @__PURE__ */ jsxDEV("i", { className: "fa fa-wand-magic-sparkles me-2", "aria-hidden": "true" }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
        lineNumber: 383,
        columnNumber: 17
      }, this),
      str(strings, "catalog_edithint_title")
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
      lineNumber: 382,
      columnNumber: 13
    }, this);
  }
  return /* @__PURE__ */ jsxDEV("div", { className: "alert alert-info flexium-edithint", role: "note", children: [
    /* @__PURE__ */ jsxDEV("i", { className: "fa fa-wand-magic-sparkles flexium-edithint__icon", "aria-hidden": "true" }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
      lineNumber: 390,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("strong", { children: str(strings, "catalog_edithint_title") }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
        lineNumber: 392,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "mb-0", children: str(strings, "catalog_edithint") }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
        lineNumber: 393,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
      lineNumber: 391,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV(
      "button",
      {
        type: "button",
        className: "btn-close",
        "aria-label": str(strings, "catalog_close"),
        onClick: () => toggle(true)
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
        lineNumber: 395,
        columnNumber: 13
      },
      this
    )
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
    lineNumber: 389,
    columnNumber: 9
  }, this);
}
__name(EditHint, "EditHint");
const usePreview = /* @__PURE__ */ __name((edit) => {
  const draft = edit.draft;
  const preview = draft && edit.dirty ? JSON.stringify({ features: draft.features, card: draft.card, layout: draft.layout }) : "";
  const [debounced, setDebounced] = useState(preview);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(preview), 350);
    return () => window.clearTimeout(timer);
  }, [preview]);
  return debounced;
}, "usePreview");
const badgeStyleOf = /* @__PURE__ */ __name((edit, saved) => edit.draft ? {
  colours: Object.fromEntries(edit.draft.card.badgecolours.map((item) => [item.source, item.colour])),
  rows: edit.draft.card.badgerows
} : saved, "badgeStyleOf");
const editZonesValue = /* @__PURE__ */ __name((editor, edit, onFeatureChange, palette, onImageUploaded, zones) => editor && edit.draft ? {
  editor,
  card: edit.draft.card,
  onCardChange: edit.setCard,
  options: edit.draft.options,
  onOptionsChange: edit.setOptions,
  features: edit.draft.features,
  onFeatureChange,
  palette,
  onImageUploaded,
  ...zones
} : null, "editZonesValue");
const POSITIONS = ["top", "upper", "middle", "lower", "bottom"];
const styleToggle = /* @__PURE__ */ __name((button, colour, size, position) => {
  button.style.setProperty("--flexium-toggle-bg", `var(--bs-${colour})`);
  button.classList.remove("flexium-filtertoggle--sm", "flexium-filtertoggle--md", "flexium-filtertoggle--lg");
  button.classList.add(`flexium-filtertoggle--${size}`);
  const holder = button.closest(".drawer-toggler");
  holder?.classList.remove(...POSITIONS.map((key) => `flexium-togglepos--${key}`));
  holder?.classList.add(`flexium-togglepos--${position}`);
}, "styleToggle");
function HeaderZones({ features, toggleicons, blockicons }) {
  useEffect(() => {
    const heading = document.querySelector("#page-header .page-context-header h1, #page-header h1");
    if (!heading) {
      return;
    }
    heading.dataset.flexiumText ??= heading.textContent ?? "";
    heading.textContent = features.pageheadingtext || heading.dataset.flexiumText;
    heading.closest(".page-context-header")?.classList.toggle("flexium-heading--off", !features.pageheading);
  }, [features.pageheading, features.pageheadingtext]);
  useEffect(() => {
    const button = document.querySelector(".drawer-left-toggle .flexium-filtertoggle");
    const icon = button?.querySelector("i");
    if (!button || !icon) {
      return;
    }
    icon.className = toggleicons[features.filtericon] ?? "fa-solid fa-filter";
    styleToggle(button, features.filtericoncolour, features.filtericonsize, features.filtericonposition);
  }, [features.filtericon, features.filtericoncolour, features.filtericonsize, features.filtericonposition, toggleicons]);
  useEffect(() => {
    const button = document.querySelector(".flexium-blocktoggle");
    const icon = button?.querySelector(".flexium-blocktoggle__icon");
    if (!button || !icon) {
      return;
    }
    const classes = blockicons[features.blockicon] ?? "";
    icon.className = `flexium-blocktoggle__icon ${classes}`;
    button.classList.toggle("flexium-blocktoggle--custom", classes !== "");
    button.classList.toggle("flexium-blocktoggle--plain", features.blockiconcolour === "default");
    styleToggle(button, features.blockiconcolour, features.blockiconsize, features.blockiconposition);
  }, [features.blockicon, features.blockiconcolour, features.blockiconsize, features.blockiconposition, blockicons]);
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV(ExternalZone, { zone: "heading", selector: "#page-header .page-context-header" }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
      lineNumber: 523,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV(ExternalZone, { zone: "filtertoggle", selector: ".drawer-left-toggle" }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
      lineNumber: 524,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV(ExternalZone, { zone: "blocktoggle", selector: ".drawer-right-toggle" }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
      lineNumber: 525,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV(ExternalZone, { zone: "breadcrumbs", selector: "#page-navbar .flexium-breadcrumbs" }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
      lineNumber: 526,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
    lineNumber: 522,
    columnNumber: 9
  }, this);
}
__name(HeaderZones, "HeaderZones");
function BannerZone({ features, palette, strings, editing }) {
  if (!features.banner && !editing) {
    return null;
  }
  return /* @__PURE__ */ jsxDEV(EditZone, { zone: "banner", className: "flexium-editzone--padded", children: features.banner ? /* @__PURE__ */ jsxDEV(
    Banner,
    {
      title: features.bannertitle,
      text: features.bannertext,
      image: palette[features.bannerstyle] ?? "",
      strings
    },
    void 0,
    false,
    {
      fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
      lineNumber: 548,
      columnNumber: 17
    },
    this
  ) : /* @__PURE__ */ jsxDEV("div", { className: "flexium-banner flexium-banner--off", children: str(strings, "catalog_bannertitle") }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
    lineNumber: 551,
    columnNumber: 17
  }, this) }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
    lineNumber: 546,
    columnNumber: 9
  }, this);
}
__name(BannerZone, "BannerZone");
function FiltersContainer({ drawer, activecount, strings, children }) {
  const [sidebaropen, setSidebaropen] = useState(false);
  if (drawer) {
    return createPortal(
      /* @__PURE__ */ jsxDEV("div", { className: "flexium-catalog__drawerfilters", role: "region", "aria-label": str(strings, "catalog_filters"), children }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
        lineNumber: 572,
        columnNumber: 13
      }, this),
      drawer
    );
  }
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV(
      "button",
      {
        type: "button",
        className: "btn btn-outline-secondary flexium-catalog__filtertoggle",
        "aria-expanded": sidebaropen,
        onClick: () => setSidebaropen(!sidebaropen),
        children: [
          /* @__PURE__ */ jsxDEV("i", { className: "fa fa-sliders me-2", "aria-hidden": "true" }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
            lineNumber: 582,
            columnNumber: 17
          }, this),
          str(strings, "catalog_togglefilters"),
          activecount > 0 && /* @__PURE__ */ jsxDEV("span", { className: "badge rounded-pill text-bg-primary ms-2", children: activecount }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
            lineNumber: 584,
            columnNumber: 37
          }, this)
        ]
      },
      void 0,
      true,
      {
        fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
        lineNumber: 580,
        columnNumber: 13
      },
      this
    ),
    /* @__PURE__ */ jsxDEV(
      "aside",
      {
        className: `flexium-catalog__sidebar${sidebaropen ? " flexium-catalog__sidebar--open" : ""}`,
        "aria-label": str(strings, "catalog_filters"),
        children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flexium-catalog__sidebarheader", children: [
            /* @__PURE__ */ jsxDEV("h2", { className: "flexium-catalog__sidebartitle", children: str(strings, "catalog_filters") }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
              lineNumber: 590,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                type: "button",
                className: "btn-close flexium-catalog__sidebarclose",
                "aria-label": str(strings, "catalog_closefilters"),
                onClick: () => setSidebaropen(false)
              },
              void 0,
              false,
              {
                fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
                lineNumber: 591,
                columnNumber: 21
              },
              this
            )
          ] }, void 0, true, {
            fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
            lineNumber: 589,
            columnNumber: 17
          }, this),
          children
        ]
      },
      void 0,
      true,
      {
        fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
        lineNumber: 587,
        columnNumber: 13
      },
      this
    )
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
    lineNumber: 579,
    columnNumber: 9
  }, this);
}
__name(FiltersContainer, "FiltersContainer");
function Catalog({
  perpage: defaultperpage,
  userperpage,
  perpageoptions,
  initialcategory,
  sorts,
  strings,
  editor,
  features: savedfeatures,
  loggedin,
  savedgroups,
  savedview,
  palette,
  quickicons,
  canedit,
  badgestyle,
  toggleicons,
  blockicons
}) {
  const [query, setQuery] = useState(() => readQueryFromUrl(initialcategory, savedfeatures.defaultsort));
  const [reload, setReload] = useState(0);
  const edit = useCatalogEditor(editor, () => setReload((count) => count + 1));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notice, setNotice] = useState("");
  const [bulk, setBulk] = useState(null);
  const [quickview, setQuickview] = useState(null);
  const [activezone, setActivezone] = useState("");
  const [palettestate, setPalettestate] = useState(palette);
  const [focuszone, setFocuszone] = useState("");
  const [drawer] = useState(() => document.getElementById("flexium-catalog-filters"));
  const requestid = useRef(0);
  const resultsref = useRef(null);
  const draftfeatures = edit.draft?.features;
  const features = useMemo(
    () => editor && draftfeatures ? decodeFeatures(draftfeatures, editor.featuredefs) : savedfeatures,
    [editor, draftfeatures, savedfeatures]
  );
  const [groupsopen, setGroupsopen] = useState(
    () => parseGroups(remembered(PREF_GROUPS, savedgroups, loggedin))
  );
  const [chosenview, setChosenview] = useState(() => remembered(PREF_VIEW, savedview, loggedin));
  const view = resolveView(features, chosenview);
  const options = edit.draft?.options;
  const { allowuser, perpage } = resolvePerpage(options, userperpage, perpageoptions, query.perpage, defaultperpage);
  const effective = useMemo(
    () => effectiveQuery(query, features.quickfilters, features.daterange),
    [query, features.quickfilters, features.daterange]
  );
  const debouncedpreview = usePreview(edit);
  useEffect(() => {
    writeQueryToUrl(query, savedfeatures.defaultsort);
    const current = ++requestid.current;
    setLoading(true);
    getCatalog(effective, perpage, debouncedpreview).then((response) => {
      if (current !== requestid.current) {
        return response;
      }
      setData(response);
      setError(false);
      if (response.autoselected.length) {
        setNotice(str(
          strings,
          "catalog_searchmatched",
          response.autoselected.map((option) => option.label).join(", ")
        ));
        const selected = {};
        response.selected.forEach((option) => (selected[option.source] ??= []).push(option.value));
        setQuery({ ...query, search: response.search, selected, page: 0 });
      }
      return response;
    }).catch(() => {
      if (current === requestid.current) {
        setError(true);
      }
    }).finally(() => {
      if (current === requestid.current) {
        setLoading(false);
      }
    });
  }, [effective, perpage, strings, reload, debouncedpreview]);
  const update = /* @__PURE__ */ __name((changes, keepnotice = false) => {
    if (!keepnotice) {
      setNotice("");
    }
    setQuery({ ...query, page: 0, ...changes });
  }, "update");
  const toggle = /* @__PURE__ */ __name((source, value) => update({ selected: toggleValue(query.selected, source, value) }), "toggle");
  const changePage = /* @__PURE__ */ __name((page2) => {
    setQuery({ ...query, page: page2 });
    resultsref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, "changePage");
  const changeView = /* @__PURE__ */ __name((next) => {
    setChosenview(next);
    remember(PREF_VIEW, next, loggedin);
  }, "changeView");
  const changeGroupOpen = /* @__PURE__ */ __name((source, open) => {
    if (!features.rememberopen) {
      return;
    }
    const next = { ...groupsopen, [source]: open };
    setGroupsopen(next);
    remember(PREF_GROUPS, JSON.stringify(next), loggedin);
  }, "changeGroupOpen");
  const toggleFavourite = /* @__PURE__ */ __name((course) => {
    const flip = /* @__PURE__ */ __name((favourite) => setData((current) => current && {
      ...current,
      courses: current.courses.map((item) => item.id === course.id ? { ...item, favourite } : item)
    }), "flip");
    flip(!course.favourite);
    setFavourite(course.id, !course.favourite).catch(() => flip(course.favourite));
  }, "toggleFavourite");
  const setFeature = /* @__PURE__ */ __name((key, value) => {
    edit.setFeature(key, value);
    if (key === "defaultsort") {
      update({ sort: value }, true);
    }
  }, "setFeature");
  const grouplabels = useMemo(() => {
    const labels = {};
    data?.groups.forEach((group) => {
      labels[group.source] = group.label;
    });
    return labels;
  }, [data]);
  const total = data?.total ?? 0;
  const activecount = countActive(effective);
  const draftlayout = edit.draft?.layout;
  const filters = editor && draftlayout ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV(
      QuickFiltersZone,
      {
        features,
        data,
        selected: effective.quick,
        loggedin,
        quickicons,
        strings,
        onToggle: (key) => update({
          quick: query.quick.includes(key) ? query.quick.filter((item) => item !== key) : [...query.quick, key]
        })
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
        lineNumber: 736,
        columnNumber: 13
      },
      this
    ),
    /* @__PURE__ */ jsxDEV(FilterWidgets, { editor, layout: draftlayout, onChange: edit.setLayout }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
      lineNumber: 740,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
    lineNumber: 735,
    columnNumber: 9
  }, this) : /* @__PURE__ */ jsxDEV(
    CatalogFilters,
    {
      query,
      effective,
      data,
      features,
      loggedin,
      quickicons,
      strings,
      bulk,
      onBulk: setBulk,
      onUpdate: update,
      onToggle: toggle,
      groupsopen,
      onGroupOpen: changeGroupOpen
    },
    void 0,
    false,
    {
      fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
      lineNumber: 743,
      columnNumber: 9
    },
    this
  );
  const imageUploaded = /* @__PURE__ */ __name((url) => {
    setPalettestate((current) => ({ ...current, custom: url }));
    setFeature("defaultimage", "custom");
    setReload((count) => count + 1);
  }, "imageUploaded");
  const editzones = editZonesValue(
    editor,
    edit,
    setFeature,
    palettestate,
    imageUploaded,
    { active: activezone, setActive: setActivezone, focus: focuszone, setFocus: setFocuszone }
  );
  const page = /* @__PURE__ */ jsxDEV("div", { className: `flexium-catalog${drawer ? " flexium-catalog--indrawer" : ""}` + (activezone ? " flexium-catalog--editing" : ""), children: [
    /* @__PURE__ */ jsxDEV(FiltersContainer, { drawer, activecount, strings, children: filters }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
      lineNumber: 761,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-catalog__main", ref: resultsref, children: [
      editzones ? /* @__PURE__ */ jsxDEV(
        EditorPanel,
        {
          editor: editzones.editor,
          dirty: edit.dirty,
          status: edit.status,
          onSave: edit.save,
          onReset: edit.reset,
          onAllSettings: () => setActivezone("all")
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
          lineNumber: 765,
          columnNumber: 21
        },
        this
      ) : canedit && /* @__PURE__ */ jsxDEV(EditHint, { strings }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
        lineNumber: 767,
        columnNumber: 32
      }, this),
      editzones && /* @__PURE__ */ jsxDEV(HeaderZones, { features, toggleicons, blockicons }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
        lineNumber: 769,
        columnNumber: 31
      }, this),
      /* @__PURE__ */ jsxDEV(BannerZone, { features, palette: palettestate, strings, editing: !!editzones }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
        lineNumber: 770,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV(
        ActiveFilters,
        {
          search: query.search,
          selected: data?.selected ?? [],
          grouplabels,
          onRemoveSearch: () => update({ search: "" }),
          onRemove: toggle,
          onClearAll: () => update({ search: "", selected: {}, quick: [], startfrom: "", startto: "" }),
          strings
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
          lineNumber: 772,
          columnNumber: 17
        },
        this
      ),
      notice && /* @__PURE__ */ jsxDEV("div", { className: "alert alert-info flexium-catalog__notice", role: "status", children: notice }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
        lineNumber: 783,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV(EditZone, { zone: "toolbar", className: "flexium-editzone--padded", children: /* @__PURE__ */ jsxDEV(
        ResultsToolbar,
        {
          total: data ? total : null,
          features,
          view,
          onViewChange: changeView,
          sort: query.sort,
          sorts,
          onSortChange: (sort) => update({ sort }, true),
          strings
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
          lineNumber: 787,
          columnNumber: 21
        },
        this
      ) }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
        lineNumber: 786,
        columnNumber: 17
      }, this),
      error && /* @__PURE__ */ jsxDEV("div", { className: "alert alert-danger", role: "alert", children: str(strings, "catalog_error") }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
        lineNumber: 791,
        columnNumber: 27
      }, this),
      /* @__PURE__ */ jsxDEV(
        Results,
        {
          data,
          loading,
          error,
          strings,
          features,
          view,
          loggedin,
          onFavourite: toggleFavourite,
          onQuickView: setQuickview,
          editing: !!editzones,
          badgestyle: badgeStyleOf(edit, badgestyle)
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
          lineNumber: 793,
          columnNumber: 17
        },
        this
      ),
      data && /* @__PURE__ */ jsxDEV(
        CatalogFooter,
        {
          total,
          page: data.page,
          perpage: data.perpage,
          perpageoptions,
          showperpage: allowuser,
          onPageChange: changePage,
          onPerpageChange: (next) => update({ perpage: next === defaultperpage ? 0 : next }, true),
          strings,
          editoptions: editor ? options : void 0,
          onEditOptions: editor ? edit.setOptions : void 0,
          editorstrings: editor?.strings
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
          lineNumber: 798,
          columnNumber: 21
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
      lineNumber: 763,
      columnNumber: 13
    }, this),
    features.quickview && /* @__PURE__ */ jsxDEV(
      QuickView,
      {
        course: quickview,
        onClose: () => setQuickview(null),
        strings,
        variant: features.quickviewstyle
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
        lineNumber: 814,
        columnNumber: 36
      },
      this
    ),
    /* @__PURE__ */ jsxDEV(EditSidePanel, {}, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
      lineNumber: 816,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
    lineNumber: 759,
    columnNumber: 9
  }, this);
  return editzones ? /* @__PURE__ */ jsxDEV(EditZonesProvider, { value: editzones, children: page }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/catalog/Catalog.tsx",
    lineNumber: 819,
    columnNumber: 24
  }, this) : page;
}
__name(Catalog, "Catalog");
export {
  Catalog as default
};
//# sourceMappingURL=Catalog.dev.js.map
