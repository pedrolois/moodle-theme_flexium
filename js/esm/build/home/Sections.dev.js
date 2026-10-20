var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
/**
 * The sections of the home page: how each section type looks with its settings.
 *
 * @module     theme_flexium/home/Sections
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useEffect, useRef, useState } from "react";
import { getSectionCourses } from "./repository";
const str = /* @__PURE__ */ __name((strings, key, a = "") => (strings[key] ?? key).replace("{$a}", String(a)), "str");
const text = /* @__PURE__ */ __name((settings, key) => typeof settings[key] === "string" ? settings[key] : "", "text");
const num = /* @__PURE__ */ __name((settings, key, fallback) => Number(settings[key]) || fallback, "num");
const items = /* @__PURE__ */ __name((settings) => Array.isArray(settings.items) ? settings.items : [], "items");
function Heading({ settings, centred = false }) {
  const title = text(settings, "title");
  const subtitle = text(settings, "subtitle");
  if (!title && !subtitle) {
    return null;
  }
  return /* @__PURE__ */ jsxDEV("div", { className: `flexium-home__heading${centred ? " text-center" : ""}`, children: [
    title && /* @__PURE__ */ jsxDEV("h2", { className: "flexium-home__title", children: title }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 67,
      columnNumber: 23
    }, this),
    subtitle && /* @__PURE__ */ jsxDEV("p", { className: "flexium-home__subtitle", children: subtitle }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 68,
      columnNumber: 26
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
    lineNumber: 66,
    columnNumber: 9
  }, this);
}
__name(Heading, "Heading");
function Hero({ settings, context }) {
  const image = context.palette[text(settings, "style")] ?? "";
  const align = text(settings, "align") || "left";
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      className: `flexium-hero flexium-hero--${text(settings, "height") || "lg"} flexium-hero--${align}`,
      style: { backgroundImage: image ? `url("${image}")` : void 0 },
      children: /* @__PURE__ */ jsxDEV("div", { className: "flexium-hero__content", children: [
        /* @__PURE__ */ jsxDEV("h2", { className: "flexium-hero__title", children: text(settings, "title") || context.sitename }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
          lineNumber: 83,
          columnNumber: 17
        }, this),
        text(settings, "text") && /* @__PURE__ */ jsxDEV("p", { className: "flexium-hero__text", children: text(settings, "text") }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
          lineNumber: 84,
          columnNumber: 44
        }, this),
        settings.search === true && /* @__PURE__ */ jsxDEV("form", { className: "flexium-hero__search", action: context.catalogurl, method: "get", role: "search", children: [
          /* @__PURE__ */ jsxDEV("i", { className: "fa fa-magnifying-glass", "aria-hidden": "true" }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
            lineNumber: 87,
            columnNumber: 25
          }, this),
          /* @__PURE__ */ jsxDEV(
            "input",
            {
              type: "search",
              name: "q",
              className: "form-control form-control-lg",
              placeholder: str(context.strings, "home_searchplaceholder"),
              "aria-label": str(context.strings, "home_search")
            },
            void 0,
            false,
            {
              fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
              lineNumber: 88,
              columnNumber: 25
            },
            this
          ),
          /* @__PURE__ */ jsxDEV("button", { type: "submit", className: "btn btn-primary btn-lg", children: str(context.strings, "home_search") }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
            lineNumber: 91,
            columnNumber: 25
          }, this)
        ] }, void 0, true, {
          fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
          lineNumber: 86,
          columnNumber: 21
        }, this),
        (text(settings, "buttontext") || text(settings, "button2text")) && /* @__PURE__ */ jsxDEV("div", { className: "flexium-hero__buttons", children: [
          text(settings, "buttontext") && /* @__PURE__ */ jsxDEV("a", { className: "btn btn-light btn-lg", href: text(settings, "buttonurl") || context.catalogurl, children: text(settings, "buttontext") }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
            lineNumber: 97,
            columnNumber: 29
          }, this),
          text(settings, "button2text") && /* @__PURE__ */ jsxDEV("a", { className: "btn btn-outline-light btn-lg", href: text(settings, "button2url") || "#", children: text(settings, "button2text") }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
            lineNumber: 102,
            columnNumber: 29
          }, this)
        ] }, void 0, true, {
          fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
          lineNumber: 95,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 82,
        columnNumber: 13
      }, this)
    },
    void 0,
    false,
    {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 80,
      columnNumber: 9
    },
    this
  );
}
__name(Hero, "Hero");
function CourseTile({ course }) {
  return /* @__PURE__ */ jsxDEV("article", { className: "flexium-hometile", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-hometile__image", style: { backgroundImage: `url("${course.image}")` } }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 119,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-hometile__body", children: [
      course.categoryname && /* @__PURE__ */ jsxDEV("p", { className: "flexium-hometile__category", children: course.categoryname }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 121,
        columnNumber: 41
      }, this),
      /* @__PURE__ */ jsxDEV("h3", { className: "flexium-hometile__title", children: /* @__PURE__ */ jsxDEV("a", { href: course.url, className: "flexium-hometile__link", children: course.fullname }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 123,
        columnNumber: 21
      }, this) }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 122,
        columnNumber: 17
      }, this),
      course.summary && /* @__PURE__ */ jsxDEV("p", { className: "flexium-hometile__summary", children: course.summary }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 125,
        columnNumber: 36
      }, this),
      course.progress >= 0 && /* @__PURE__ */ jsxDEV(
        "div",
        {
          className: "progress flexium-hometile__progress",
          role: "progressbar",
          "aria-valuenow": course.progress,
          "aria-valuemin": 0,
          "aria-valuemax": 100,
          children: /* @__PURE__ */ jsxDEV("div", { className: "progress-bar", style: { width: `${course.progress}%` } }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
            lineNumber: 129,
            columnNumber: 25
          }, this)
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
          lineNumber: 127,
          columnNumber: 21
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 120,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
    lineNumber: 118,
    columnNumber: 9
  }, this);
}
__name(CourseTile, "CourseTile");
function Courses({ settings, context }) {
  const source = text(settings, "source") || "latest";
  const categoryid = num(settings, "categoryid", 0);
  const count = num(settings, "count", 8);
  const [courses, setCourses] = useState(null);
  const track = useRef(null);
  const [paused, setPaused] = useState(false);
  const carousel = text(settings, "layout") !== "grid";
  useEffect(() => {
    let current = true;
    setCourses(null);
    getSectionCourses(source, categoryid, count).then((result) => current && setCourses(result)).catch(() => current && setCourses([]));
    return () => {
      current = false;
    };
  }, [source, categoryid, count]);
  const scroll = /* @__PURE__ */ __name((direction) => {
    const element = track.current;
    if (!element) {
      return;
    }
    const atend = element.scrollLeft + element.clientWidth >= element.scrollWidth - 4;
    if (direction > 0 && atend) {
      element.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      element.scrollBy({ left: direction * element.clientWidth * 0.8, behavior: "smooth" });
    }
  }, "scroll");
  useEffect(() => {
    if (!carousel || settings.autoplay !== true || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return void 0;
    }
    const timer = window.setInterval(() => scroll(1), 5e3);
    return () => window.clearInterval(timer);
  }, [carousel, settings.autoplay, paused]);
  if (["mycourses", "favourites"].includes(source) && !context.loggedin) {
    return null;
  }
  const columns = num(settings, "columns", 4);
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      className: "flexium-home__courses",
      onMouseEnter: () => setPaused(true),
      onMouseLeave: () => setPaused(false),
      onFocus: () => setPaused(true),
      onBlur: () => setPaused(false),
      children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flexium-home__row", children: [
          /* @__PURE__ */ jsxDEV(Heading, { settings }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
            lineNumber: 193,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flexium-home__rowtools", children: [
            carousel && courses && courses.length > 0 && /* @__PURE__ */ jsxDEV(Fragment, { children: [
              /* @__PURE__ */ jsxDEV(
                "button",
                {
                  type: "button",
                  className: "flexium-home__arrow",
                  onClick: () => scroll(-1),
                  "aria-label": str(context.strings, "home_previous"),
                  children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-chevron-left", "aria-hidden": "true" }, void 0, false, {
                    fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
                    lineNumber: 199,
                    columnNumber: 33
                  }, this)
                },
                void 0,
                false,
                {
                  fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
                  lineNumber: 197,
                  columnNumber: 29
                },
                this
              ),
              /* @__PURE__ */ jsxDEV(
                "button",
                {
                  type: "button",
                  className: "flexium-home__arrow",
                  onClick: () => scroll(1),
                  "aria-label": str(context.strings, "home_next"),
                  children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-chevron-right", "aria-hidden": "true" }, void 0, false, {
                    fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
                    lineNumber: 203,
                    columnNumber: 33
                  }, this)
                },
                void 0,
                false,
                {
                  fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
                  lineNumber: 201,
                  columnNumber: 29
                },
                this
              )
            ] }, void 0, true, {
              fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
              lineNumber: 196,
              columnNumber: 25
            }, this),
            /* @__PURE__ */ jsxDEV("a", { className: "flexium-home__viewall", href: context.catalogurl, children: str(context.strings, "home_viewall") }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
              lineNumber: 207,
              columnNumber: 21
            }, this)
          ] }, void 0, true, {
            fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
            lineNumber: 194,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
          lineNumber: 192,
          columnNumber: 13
        }, this),
        !courses && /* @__PURE__ */ jsxDEV("p", { className: "flexium-home__muted", children: str(context.strings, "catalog_loading") }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
          lineNumber: 210,
          columnNumber: 26
        }, this),
        courses && courses.length === 0 && /* @__PURE__ */ jsxDEV("p", { className: "flexium-home__muted", children: str(context.strings, "home_nocourses") }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
          lineNumber: 211,
          columnNumber: 49
        }, this),
        courses && courses.length > 0 && /* @__PURE__ */ jsxDEV(
          "ul",
          {
            ref: track,
            className: carousel ? "flexium-home__carousel" : "flexium-home__grid",
            style: { "--flexium-columns": columns },
            children: courses.map((course) => /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(CourseTile, { course }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
              lineNumber: 215,
              columnNumber: 64
            }, this) }, course.id, false, {
              fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
              lineNumber: 215,
              columnNumber: 44
            }, this))
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
            lineNumber: 213,
            columnNumber: 17
          },
          this
        )
      ]
    },
    void 0,
    true,
    {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 190,
      columnNumber: 9
    },
    this
  );
}
__name(Courses, "Courses");
function Categories({ settings, context }) {
  const categories = (context.data?.categories ?? []).slice(0, num(settings, "count", 8));
  const chips = text(settings, "style") === "chips";
  return /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV(Heading, { settings }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 230,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("ul", { className: chips ? "flexium-home__chips" : "flexium-home__categories", children: categories.map((category, index) => /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(
      "a",
      {
        href: category.url,
        className: chips ? "flexium-home__chip" : "flexium-home__category",
        style: chips ? void 0 : { backgroundImage: `url("${context.palette[String(index % 6 + 1)]}")` },
        children: [
          /* @__PURE__ */ jsxDEV("span", { className: "flexium-home__categoryname", children: category.name }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
            lineNumber: 236,
            columnNumber: 29
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "flexium-home__categorycount", children: str(context.strings, "home_coursecount", category.coursecount) }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
            lineNumber: 237,
            columnNumber: 29
          }, this)
        ]
      },
      void 0,
      true,
      {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 234,
        columnNumber: 25
      },
      this
    ) }, category.id, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 233,
      columnNumber: 21
    }, this)) }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 231,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
    lineNumber: 229,
    columnNumber: 9
  }, this);
}
__name(Categories, "Categories");
const STAT_ICONS = {
  courses: "fa-solid fa-book-open",
  users: "fa-solid fa-user-graduate",
  categories: "fa-solid fa-layer-group",
  completions: "fa-solid fa-award"
};
function Stats({ settings, context }) {
  const keys = Array.isArray(settings.items) ? settings.items : [];
  const format = new Intl.NumberFormat(document.documentElement.lang || void 0);
  return /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV(Heading, { settings, centred: true }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 262,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("ul", { className: `flexium-home__stats flexium-home__stats--${text(settings, "style") || "cards"}`, children: keys.map((key) => /* @__PURE__ */ jsxDEV("li", { className: "flexium-home__stat", children: [
      /* @__PURE__ */ jsxDEV("i", { className: `${STAT_ICONS[key] ?? "fa fa-circle"} flexium-home__staticon`, "aria-hidden": "true" }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 266,
        columnNumber: 25
      }, this),
      /* @__PURE__ */ jsxDEV("span", { className: "flexium-home__statvalue", children: format.format(context.data?.stats[key] ?? 0) }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 267,
        columnNumber: 25
      }, this),
      /* @__PURE__ */ jsxDEV("span", { className: "flexium-home__statlabel", children: str(context.strings, `home_stat_${key}`) }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 268,
        columnNumber: 25
      }, this)
    ] }, key, true, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 265,
      columnNumber: 21
    }, this)) }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 263,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
    lineNumber: 261,
    columnNumber: 9
  }, this);
}
__name(Stats, "Stats");
function Features({ settings }) {
  return /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV(Heading, { settings, centred: true }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 282,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV(
      "ul",
      {
        className: "flexium-home__features",
        style: { "--flexium-columns": num(settings, "columns", 3) },
        children: items(settings).map((item, index) => /* @__PURE__ */ jsxDEV("li", { className: "flexium-home__feature", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "flexium-home__featureicon", children: /* @__PURE__ */ jsxDEV("i", { className: item.icon || "fa fa-star", "aria-hidden": "true" }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
            lineNumber: 288,
            columnNumber: 29
          }, this) }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
            lineNumber: 287,
            columnNumber: 25
          }, this),
          /* @__PURE__ */ jsxDEV("h3", { className: "flexium-home__featuretitle", children: item.title }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
            lineNumber: 290,
            columnNumber: 25
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "flexium-home__featuretext", children: item.text }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
            lineNumber: 291,
            columnNumber: 25
          }, this)
        ] }, index, true, {
          fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
          lineNumber: 286,
          columnNumber: 21
        }, this))
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 283,
        columnNumber: 13
      },
      this
    )
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
    lineNumber: 281,
    columnNumber: 9
  }, this);
}
__name(Features, "Features");
function Steps({ settings }) {
  return /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV(Heading, { settings, centred: true }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 305,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("ol", { className: "flexium-home__steps", children: items(settings).map((item, index) => /* @__PURE__ */ jsxDEV("li", { className: "flexium-home__step", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "flexium-home__stepnumber", "aria-hidden": "true", children: index + 1 }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 309,
        columnNumber: 25
      }, this),
      /* @__PURE__ */ jsxDEV("h3", { className: "flexium-home__featuretitle", children: item.title }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 310,
        columnNumber: 25
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "flexium-home__featuretext", children: item.text }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 311,
        columnNumber: 25
      }, this)
    ] }, index, true, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 308,
      columnNumber: 21
    }, this)) }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 306,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
    lineNumber: 304,
    columnNumber: 9
  }, this);
}
__name(Steps, "Steps");
function Cta({ settings, context }) {
  const image = context.palette[text(settings, "style")] ?? "";
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-home__cta", style: { backgroundImage: image ? `url("${image}")` : void 0 }, children: [
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("h2", { className: "flexium-home__ctatitle", children: text(settings, "title") }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 327,
        columnNumber: 17
      }, this),
      text(settings, "text") && /* @__PURE__ */ jsxDEV("p", { className: "flexium-home__ctatext", children: text(settings, "text") }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 328,
        columnNumber: 44
      }, this)
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 326,
      columnNumber: 13
    }, this),
    text(settings, "buttontext") && /* @__PURE__ */ jsxDEV("a", { className: "btn btn-light btn-lg", href: text(settings, "buttonurl") || context.catalogurl, children: text(settings, "buttontext") }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 331,
      columnNumber: 17
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
    lineNumber: 325,
    columnNumber: 9
  }, this);
}
__name(Cta, "Cta");
function Testimonials({ settings }) {
  return /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV(Heading, { settings, centred: true }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 345,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("ul", { className: "flexium-home__quotes", children: items(settings).map((item, index) => /* @__PURE__ */ jsxDEV("li", { className: "flexium-home__quote", children: [
      /* @__PURE__ */ jsxDEV("i", { className: "fa fa-quote-left flexium-home__quoteicon", "aria-hidden": "true" }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 349,
        columnNumber: 25
      }, this),
      /* @__PURE__ */ jsxDEV("blockquote", { className: "flexium-home__quotetext", children: item.quote }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 350,
        columnNumber: 25
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "flexium-home__quotename", children: [
        /* @__PURE__ */ jsxDEV("span", { className: "flexium-home__avatar", "aria-hidden": "true", children: (item.name || "?").charAt(0) }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
          lineNumber: 352,
          columnNumber: 29
        }, this),
        /* @__PURE__ */ jsxDEV("span", { children: [
          /* @__PURE__ */ jsxDEV("strong", { children: item.name }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
            lineNumber: 354,
            columnNumber: 33
          }, this),
          item.role && /* @__PURE__ */ jsxDEV("span", { className: "d-block flexium-home__muted", children: item.role }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
            lineNumber: 355,
            columnNumber: 47
          }, this)
        ] }, void 0, true, {
          fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
          lineNumber: 353,
          columnNumber: 29
        }, this)
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 351,
        columnNumber: 25
      }, this)
    ] }, index, true, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 348,
      columnNumber: 21
    }, this)) }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 346,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
    lineNumber: 344,
    columnNumber: 9
  }, this);
}
__name(Testimonials, "Testimonials");
function Faq({ settings }) {
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-home__narrow", children: [
    /* @__PURE__ */ jsxDEV(Heading, { settings, centred: true }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 371,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-home__faq", children: items(settings).map((item, index) => /* @__PURE__ */ jsxDEV("details", { className: "flexium-home__faqitem", children: [
      /* @__PURE__ */ jsxDEV("summary", { children: item.question }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 375,
        columnNumber: 25
      }, this),
      /* @__PURE__ */ jsxDEV("p", { children: item.answer }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 376,
        columnNumber: 25
      }, this)
    ] }, index, true, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 374,
      columnNumber: 21
    }, this)) }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 372,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
    lineNumber: 370,
    columnNumber: 9
  }, this);
}
__name(Faq, "Faq");
function Logos({ settings }) {
  return /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV(Heading, { settings, centred: true }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 390,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("ul", { className: "flexium-home__logos", children: items(settings).map((item, index) => /* @__PURE__ */ jsxDEV("li", { children: item.url ? /* @__PURE__ */ jsxDEV("a", { href: item.url, className: "flexium-home__logo", children: item.name }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 394,
      columnNumber: 37
    }, this) : /* @__PURE__ */ jsxDEV("span", { className: "flexium-home__logo", children: item.name }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 395,
      columnNumber: 31
    }, this) }, index, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 393,
      columnNumber: 21
    }, this)) }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 391,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
    lineNumber: 389,
    columnNumber: 9
  }, this);
}
__name(Logos, "Logos");
function News({ settings, context }) {
  const news = (context.data?.news ?? []).slice(0, num(settings, "count", 3));
  return /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV(Heading, { settings }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 410,
      columnNumber: 13
    }, this),
    news.length === 0 && /* @__PURE__ */ jsxDEV("p", { className: "flexium-home__muted", children: str(context.strings, "home_nonews") }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 411,
      columnNumber: 35
    }, this),
    /* @__PURE__ */ jsxDEV("ul", { className: "flexium-home__news", children: news.map((item) => /* @__PURE__ */ jsxDEV("li", { className: "flexium-home__newsitem", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "flexium-home__muted", children: item.date }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 415,
        columnNumber: 25
      }, this),
      /* @__PURE__ */ jsxDEV("a", { href: item.url, children: item.title }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 416,
        columnNumber: 25
      }, this)
    ] }, item.url, true, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 414,
      columnNumber: 21
    }, this)) }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 412,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
    lineNumber: 409,
    columnNumber: 9
  }, this);
}
__name(News, "News");
function Text({ settings }) {
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-home__narrow", children: [
    /* @__PURE__ */ jsxDEV(Heading, { settings }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 430,
      columnNumber: 13
    }, this),
    text(settings, "html").split(/\n{2,}/).map((paragraph, index) => /* @__PURE__ */ jsxDEV("p", { children: paragraph }, index, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 431,
      columnNumber: 79
    }, this))
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
    lineNumber: 429,
    columnNumber: 9
  }, this);
}
__name(Text, "Text");
function SiteContent({ html }) {
  const holder = useRef(null);
  useEffect(() => {
    const section = document.querySelector(".flexium-sitesection");
    const original = section?.parentElement;
    if (!section || !holder.current) {
      return void 0;
    }
    holder.current.appendChild(section);
    section.hidden = false;
    return () => {
      section.hidden = true;
      original?.appendChild(section);
    };
  }, []);
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-home__sitecontent", children: [
    /* @__PURE__ */ jsxDEV("div", { ref: holder }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 458,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { dangerouslySetInnerHTML: { __html: html } }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
      lineNumber: 459,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
    lineNumber: 457,
    columnNumber: 9
  }, this);
}
__name(SiteContent, "SiteContent");
function SectionView({ section, context }) {
  const settings = section.settings;
  switch (section.type) {
    case "hero":
      return /* @__PURE__ */ jsxDEV(Hero, { settings, context }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 470,
        columnNumber: 29
      }, this);
    case "courses":
      return /* @__PURE__ */ jsxDEV(Courses, { settings, context }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 471,
        columnNumber: 32
      }, this);
    case "categories":
      return /* @__PURE__ */ jsxDEV(Categories, { settings, context }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 472,
        columnNumber: 35
      }, this);
    case "stats":
      return /* @__PURE__ */ jsxDEV(Stats, { settings, context }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 473,
        columnNumber: 30
      }, this);
    case "features":
      return /* @__PURE__ */ jsxDEV(Features, { settings }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 474,
        columnNumber: 33
      }, this);
    case "steps":
      return /* @__PURE__ */ jsxDEV(Steps, { settings }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 475,
        columnNumber: 30
      }, this);
    case "cta":
      return /* @__PURE__ */ jsxDEV(Cta, { settings, context }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 476,
        columnNumber: 28
      }, this);
    case "testimonials":
      return /* @__PURE__ */ jsxDEV(Testimonials, { settings }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 477,
        columnNumber: 37
      }, this);
    case "faq":
      return /* @__PURE__ */ jsxDEV(Faq, { settings }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 478,
        columnNumber: 28
      }, this);
    case "logos":
      return /* @__PURE__ */ jsxDEV(Logos, { settings }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 479,
        columnNumber: 30
      }, this);
    case "news":
      return /* @__PURE__ */ jsxDEV(News, { settings, context }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 480,
        columnNumber: 29
      }, this);
    case "text":
      return /* @__PURE__ */ jsxDEV(Text, { settings }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 481,
        columnNumber: 29
      }, this);
    // Moodle's own site home content, rendered by Moodle.
    case "sitecontent":
      return /* @__PURE__ */ jsxDEV(SiteContent, { html: context.sitecontent }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 484,
        columnNumber: 20
      }, this);
    case "spacer":
      return /* @__PURE__ */ jsxDEV("div", { className: `flexium-home__spacer flexium-home__spacer--${text(settings, "size") || "md"}` }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/home/Sections.tsx",
        lineNumber: 486,
        columnNumber: 20
      }, this);
    default:
      return null;
  }
}
__name(SectionView, "SectionView");
export {
  SectionView as default,
  str
};
//# sourceMappingURL=Sections.dev.js.map
