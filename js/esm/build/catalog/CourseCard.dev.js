var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
/**
 * Course card of the catalogue grid (or row of the list view).
 *
 * Optional features: status badges on the image, progress bar, favourite star and quick view button.
 *
 * @module     theme_flexium/catalog/CourseCard
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { Badge } from "@moodlehq/design-system";
import { EditZone, useEditZones } from "@moodle/lms/theme_flexium/catalog/EditZones";
import { str } from "./utils";
function MetaItem({ item }) {
  if (item.key.startsWith("teacher") && item.people.length) {
    const photos = item.key !== "teachernames";
    const names = item.key !== "teacherphotos";
    return /* @__PURE__ */ jsxDEV("span", { className: "flexium-card__meta flexium-card__teachers", title: item.label, children: [
      /* @__PURE__ */ jsxDEV("span", { className: "visually-hidden", children: [
        item.label,
        ": "
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
        lineNumber: 57,
        columnNumber: 17
      }, this),
      photos && /* @__PURE__ */ jsxDEV("span", { className: "flexium-card__avatars", children: item.people.slice(0, 3).map((person) => /* @__PURE__ */ jsxDEV(
        "img",
        {
          src: person.image,
          alt: names ? "" : person.name,
          title: person.name,
          className: "flexium-card__avatar"
        },
        person.image + person.name,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
          lineNumber: 61,
          columnNumber: 29
        },
        this
      )) }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
        lineNumber: 59,
        columnNumber: 21
      }, this),
      !photos && /* @__PURE__ */ jsxDEV("i", { className: `${item.icon} me-1`, "aria-hidden": "true" }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
        lineNumber: 66,
        columnNumber: 29
      }, this),
      names && item.text
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
      lineNumber: 56,
      columnNumber: 13
    }, this);
  }
  return /* @__PURE__ */ jsxDEV("span", { className: "flexium-card__meta", title: item.label, children: [
    /* @__PURE__ */ jsxDEV("i", { className: `${item.icon} me-1`, "aria-hidden": "true" }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
      lineNumber: 73,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("span", { className: "visually-hidden", children: [
      item.label,
      ": "
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
      lineNumber: 74,
      columnNumber: 13
    }, this),
    item.text
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
    lineNumber: 72,
    columnNumber: 9
  }, this);
}
__name(MetaItem, "MetaItem");
const statusOf = /* @__PURE__ */ __name((course) => ({
  enrolled: ["fa-solid fa-user-check", course.enrolled],
  completed: ["fa-solid fa-circle-check", course.completed],
  "new": ["fa-solid fa-wand-magic-sparkles", course.isnew],
  startingsoon: ["fa-regular fa-calendar-plus", course.startingsoon],
  favourite: ["fa-solid fa-star", course.favourite]
}), "statusOf");
function CardImage({ course, strings, features, loggedin, onFavourite, onQuickView }) {
  const status = statusOf(course);
  const statuses = features.statusbadges.filter((key) => status[key]?.[1] && !(key === "enrolled" && course.completed && features.statusbadges.includes("completed"))).slice(0, 2);
  const favourites = features.favourites && loggedin;
  const quickview = features.quickview && course.quickview;
  const favouritelabel = str(strings, course.favourite ? "catalog_unfavourite" : "catalog_favourite", course.fullname);
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-card__image", style: { backgroundImage: `url("${course.image}")` }, children: (statuses.length > 0 || !course.visible) && /* @__PURE__ */ jsxDEV("ul", { className: "flexium-card__status", children: [
      !course.visible && /* @__PURE__ */ jsxDEV("li", { className: "flexium-card__statusbadge flexium-card__statusbadge--hidden", children: [
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-eye-slash me-1", "aria-hidden": "true" }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
          lineNumber: 116,
          columnNumber: 33
        }, this),
        str(strings, "catalog_hidden")
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
        lineNumber: 115,
        columnNumber: 29
      }, this),
      statuses.map((key) => /* @__PURE__ */ jsxDEV("li", { className: `flexium-card__statusbadge flexium-card__statusbadge--${key}`, children: [
        /* @__PURE__ */ jsxDEV("i", { className: `${status[key][0]} me-1`, "aria-hidden": "true" }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
          lineNumber: 122,
          columnNumber: 33
        }, this),
        str(strings, `status_${key}`)
      ] }, key, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
        lineNumber: 121,
        columnNumber: 29
      }, this))
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
      lineNumber: 113,
      columnNumber: 21
    }, this) }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
      lineNumber: 111,
      columnNumber: 13
    }, this),
    (favourites || quickview) && // Above the card link (see .flexium-card__link::after), so they stay clickable.
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-card__actions", children: [
      quickview && /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          className: "flexium-card__action",
          "data-action": "quickview",
          "aria-label": str(strings, "catalog_quickview", course.fullname),
          title: str(strings, "catalog_quickview", course.fullname),
          onClick: () => onQuickView(course),
          children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-eye", "aria-hidden": "true" }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
            lineNumber: 136,
            columnNumber: 29
          }, this)
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
          lineNumber: 133,
          columnNumber: 25
        },
        this
      ),
      favourites && /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          "data-action": "favourite",
          className: `flexium-card__action${course.favourite ? " flexium-card__action--on" : ""}`,
          "aria-pressed": course.favourite,
          "aria-label": favouritelabel,
          title: favouritelabel,
          onClick: () => onFavourite(course),
          children: /* @__PURE__ */ jsxDEV("i", { className: `fa-${course.favourite ? "solid" : "regular"} fa-star`, "aria-hidden": "true" }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
            lineNumber: 144,
            columnNumber: 29
          }, this)
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
          lineNumber: 140,
          columnNumber: 25
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
      lineNumber: 131,
      columnNumber: 17
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
    lineNumber: 110,
    columnNumber: 9
  }, this);
}
__name(CardImage, "CardImage");
function CardBadges({ course, strings, features, wands, placeholder, badgestyle }) {
  const showprogress = features.progress && course.progress >= 0;
  const lists = badgestyle.rows ? [...new Set(course.badges.map((badge) => badge.source))].map((source) => course.badges.filter((badge) => badge.source === source)) : [course.badges];
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    (course.badges.length > 0 || placeholder) && /* @__PURE__ */ jsxDEV(EditZone, { zone: "badges", enabled: wands, className: "flexium-editzone--padded", children: course.badges.length > 0 ? /* @__PURE__ */ jsxDEV("div", { className: "flexium-card__badgegroups", children: lists.map((list) => /* @__PURE__ */ jsxDEV("ul", { className: "flexium-card__badges", children: list.map((badge) => /* @__PURE__ */ jsxDEV("li", { title: `${badge.origin}: ${badge.label}`, children: /* @__PURE__ */ jsxDEV(
      Badge,
      {
        label: badge.label,
        subtle: true,
        pill: true,
        variant: badgestyle.colours[badge.source] ?? "primary"
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
        lineNumber: 174,
        columnNumber: 45
      },
      this
    ) }, `${badge.source}-${badge.label}`, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
      lineNumber: 173,
      columnNumber: 41
    }, this)) }, list[0].source, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
      lineNumber: 171,
      columnNumber: 33
    }, this)) }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
      lineNumber: 169,
      columnNumber: 25
    }, this) : /* @__PURE__ */ jsxDEV("p", { className: "flexium-editzone__placeholder", children: placeholder }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
      lineNumber: 181,
      columnNumber: 25
    }, this) }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
      lineNumber: 167,
      columnNumber: 17
    }, this),
    showprogress && /* @__PURE__ */ jsxDEV("div", { className: "flexium-card__progress", children: [
      /* @__PURE__ */ jsxDEV(
        "div",
        {
          className: "progress",
          role: "progressbar",
          "aria-valuenow": course.progress,
          "aria-valuemin": 0,
          "aria-valuemax": 100,
          "aria-label": str(strings, "catalog_progress", course.progress),
          children: /* @__PURE__ */ jsxDEV("div", { className: "progress-bar", style: { width: `${course.progress}%` } }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
            lineNumber: 188,
            columnNumber: 25
          }, this)
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
          lineNumber: 186,
          columnNumber: 21
        },
        this
      ),
      /* @__PURE__ */ jsxDEV("span", { className: "flexium-card__progresstext", children: str(strings, "catalog_progress", course.progress) }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
        lineNumber: 190,
        columnNumber: 21
      }, this)
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
      lineNumber: 185,
      columnNumber: 17
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
    lineNumber: 165,
    columnNumber: 9
  }, this);
}
__name(CardBadges, "CardBadges");
function CourseCard({
  course,
  strings,
  features,
  loggedin,
  onFavourite,
  onQuickView,
  wands = false,
  badgestyle
}) {
  const edit = useEditZones();
  const placeholder = wands && edit ? str(edit.editor.strings, "editzone_nothing") : "";
  return /* @__PURE__ */ jsxDEV("article", { className: `flexium-card${course.visible ? "" : " flexium-card--hidden"}`, children: [
    /* @__PURE__ */ jsxDEV(EditZone, { zone: "image", enabled: wands, className: "flexium-editzone--image", children: /* @__PURE__ */ jsxDEV(
      CardImage,
      {
        course,
        strings,
        features,
        loggedin,
        onFavourite,
        onQuickView
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
        lineNumber: 206,
        columnNumber: 17
      },
      this
    ) }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
      lineNumber: 205,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-card__body", children: [
      /* @__PURE__ */ jsxDEV(EditZone, { zone: "text", enabled: wands, className: "flexium-editzone--padded", children: [
        course.categoryname && /* @__PURE__ */ jsxDEV("p", { className: "flexium-card__category", children: course.categoryname }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
          lineNumber: 211,
          columnNumber: 45
        }, this),
        /* @__PURE__ */ jsxDEV("h3", { className: "flexium-card__title", children: /* @__PURE__ */ jsxDEV(
          "a",
          {
            href: course.url,
            className: "flexium-card__link",
            onClick: edit ? (event) => event.preventDefault() : void 0,
            children: course.fullname
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
            lineNumber: 214,
            columnNumber: 25
          },
          this
        ) }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
          lineNumber: 212,
          columnNumber: 21
        }, this),
        course.summary && /* @__PURE__ */ jsxDEV("p", { className: "flexium-card__summary", children: course.summary }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
          lineNumber: 217,
          columnNumber: 40
        }, this)
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
        lineNumber: 210,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV(
        CardBadges,
        {
          course,
          strings,
          features,
          wands,
          placeholder,
          badgestyle
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
          lineNumber: 219,
          columnNumber: 17
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
      lineNumber: 209,
      columnNumber: 13
    }, this),
    (course.meta.length > 0 || placeholder) && // Items chosen in the theme settings (Course cards tab), formatted on the server.
    /* @__PURE__ */ jsxDEV(EditZone, { zone: "footer", enabled: wands, className: "flexium-editzone--padded", children: /* @__PURE__ */ jsxDEV("footer", { className: "flexium-card__footer", children: [
      course.meta.map((item) => /* @__PURE__ */ jsxDEV(MetaItem, { item }, item.key, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
        lineNumber: 226,
        columnNumber: 50
      }, this)),
      course.meta.length === 0 && /* @__PURE__ */ jsxDEV("span", { className: "flexium-editzone__placeholder", children: placeholder }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
        lineNumber: 227,
        columnNumber: 54
      }, this)
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
      lineNumber: 225,
      columnNumber: 21
    }, this) }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
      lineNumber: 224,
      columnNumber: 17
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/CourseCard.tsx",
    lineNumber: 204,
    columnNumber: 9
  }, this);
}
__name(CourseCard, "CourseCard");
export {
  CourseCard as default
};
//# sourceMappingURL=CourseCard.dev.js.map
