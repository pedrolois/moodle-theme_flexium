var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { jsxDEV } from "react/jsx-dev-runtime";
/**
 * Quick view of a course (feature "Quick view"): a modal dialog with the full summary, dates, teachers and custom
 * fields, loaded with theme_flexium_get_course_preview, and a button to the course.
 *
 * @module     theme_flexium/catalog/QuickView
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useEffect, useId, useRef, useState } from "react";
import { getCoursePreview } from "./repository";
import { str } from "./utils";
function QuickView({ course, onClose, strings, variant }) {
  const id = useId();
  const dialog = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!course) {
      dialog.current?.close();
      return void 0;
    }
    setPreview(null);
    setError(false);
    if (!dialog.current?.open) {
      dialog.current?.showModal();
    }
    let current = true;
    getCoursePreview(course.id).then((response) => {
      if (current) {
        setPreview(response);
      }
      return response;
    }).catch(() => current && setError(true));
    return () => {
      current = false;
    };
  }, [course]);
  const hastext = !!preview && (preview.summary.trim() !== "" || preview.sections.length > 0);
  return /* @__PURE__ */ jsxDEV(
    "dialog",
    {
      ref: dialog,
      className: `flexium-quickview flexium-quickview--${variant}`,
      "aria-labelledby": `${id}-title`,
      onClose,
      onClick: (event) => event.target === dialog.current && dialog.current?.close(),
      children: course && // Same layout as the enrolment page (templates/courseinfo.mustache): name label, image, summary + facts.
      /* @__PURE__ */ jsxDEV("div", { className: "flexium-quickview__content", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flexium-quickview__header", children: [
          /* @__PURE__ */ jsxDEV("h2", { id: `${id}-title`, className: "flexium-quickview__title", children: course.fullname }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
            lineNumber: 79,
            columnNumber: 25
          }, this),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              type: "button",
              className: "btn-close flexium-quickview__close",
              "aria-label": str(strings, "catalog_close"),
              onClick: () => dialog.current?.close()
            },
            void 0,
            false,
            {
              fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
              lineNumber: 80,
              columnNumber: 25
            },
            this
          )
        ] }, void 0, true, {
          fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
          lineNumber: 78,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flexium-quickview__body flexium-courseinfo", children: [
          (preview?.categoryname || course.categoryname) && /* @__PURE__ */ jsxDEV("p", { className: "flexium-courseinfo__name", children: preview?.categoryname || course.categoryname }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
            lineNumber: 85,
            columnNumber: 29
          }, this),
          /* @__PURE__ */ jsxDEV(
            "div",
            {
              className: "flexium-courseinfo__image",
              role: "img",
              "aria-label": course.fullname,
              style: { backgroundImage: `url("${preview?.image ?? course.image}")` }
            },
            void 0,
            false,
            {
              fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
              lineNumber: 87,
              columnNumber: 25
            },
            this
          ),
          !preview && !error && /* @__PURE__ */ jsxDEV("p", { className: "flexium-quickview__loading", children: [
            /* @__PURE__ */ jsxDEV("span", { className: "spinner-border spinner-border-sm me-2", "aria-hidden": "true" }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
              lineNumber: 91,
              columnNumber: 33
            }, this),
            str(strings, "catalog_loading")
          ] }, void 0, true, {
            fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
            lineNumber: 90,
            columnNumber: 29
          }, this),
          error && /* @__PURE__ */ jsxDEV("div", { className: "alert alert-danger", children: str(strings, "catalog_error") }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
            lineNumber: 95,
            columnNumber: 35
          }, this),
          preview && /* @__PURE__ */ jsxDEV("div", { className: "flexium-courseinfo__body" + (hastext ? "" : " flexium-courseinfo__body--nosummary"), children: [
            hastext && /* @__PURE__ */ jsxDEV("div", { className: "flexium-courseinfo__summary", children: [
              /* @__PURE__ */ jsxDEV("div", { dangerouslySetInnerHTML: { __html: preview.summary } }, void 0, false, {
                fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
                lineNumber: 102,
                columnNumber: 41
              }, this),
              preview.sections.map((section) => /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("h3", { className: "flexium-courseinfo__sectiontitle", children: section.label }, void 0, false, {
                  fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
                  lineNumber: 105,
                  columnNumber: 49
                }, this),
                /* @__PURE__ */ jsxDEV(
                  "div",
                  {
                    className: "flexium-courseinfo__section",
                    dangerouslySetInnerHTML: { __html: section.value }
                  },
                  void 0,
                  false,
                  {
                    fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
                    lineNumber: 106,
                    columnNumber: 49
                  },
                  this
                )
              ] }, section.key, true, {
                fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
                lineNumber: 104,
                columnNumber: 45
              }, this))
            ] }, void 0, true, {
              fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
              lineNumber: 101,
              columnNumber: 37
            }, this),
            preview.facts.length > 0 && /* @__PURE__ */ jsxDEV("ul", { className: "flexium-courseinfo__facts", children: preview.facts.map((fact) => /* @__PURE__ */ jsxDEV("li", { className: "flexium-courseinfo__fact", children: [
              /* @__PURE__ */ jsxDEV(
                "i",
                {
                  className: `${fact.icon} flexium-courseinfo__facticon`,
                  "aria-hidden": "true"
                },
                void 0,
                false,
                {
                  fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
                  lineNumber: 116,
                  columnNumber: 49
                },
                this
              ),
              /* @__PURE__ */ jsxDEV("span", { children: [
                /* @__PURE__ */ jsxDEV("strong", { children: fact.label }, void 0, false, {
                  fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
                  lineNumber: 119,
                  columnNumber: 53
                }, this),
                " ",
                /* @__PURE__ */ jsxDEV("span", { dangerouslySetInnerHTML: { __html: fact.value } }, void 0, false, {
                  fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
                  lineNumber: 120,
                  columnNumber: 53
                }, this)
              ] }, void 0, true, {
                fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
                lineNumber: 118,
                columnNumber: 49
              }, this)
            ] }, fact.key, true, {
              fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
              lineNumber: 115,
              columnNumber: 45
            }, this)) }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
              lineNumber: 113,
              columnNumber: 37
            }, this)
          ] }, void 0, true, {
            fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
            lineNumber: 97,
            columnNumber: 29
          }, this)
        ] }, void 0, true, {
          fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
          lineNumber: 83,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flexium-quickview__footer", children: [
          /* @__PURE__ */ jsxDEV("button", { type: "button", className: "btn btn-outline-secondary", onClick: () => dialog.current?.close(), children: str(strings, "catalog_close") }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
            lineNumber: 130,
            columnNumber: 25
          }, this),
          /* @__PURE__ */ jsxDEV("a", { href: course.url, className: "btn btn-primary", children: [
            str(strings, course.enrolled ? "catalog_gotocourse" : "catalog_viewcourse"),
            /* @__PURE__ */ jsxDEV("i", { className: "fa fa-arrow-right ms-2", "aria-hidden": "true" }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
              lineNumber: 135,
              columnNumber: 29
            }, this)
          ] }, void 0, true, {
            fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
            lineNumber: 133,
            columnNumber: 25
          }, this)
        ] }, void 0, true, {
          fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
          lineNumber: 129,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
        lineNumber: 77,
        columnNumber: 17
      }, this)
    },
    void 0,
    false,
    {
      fileName: "public/theme/flexium/js/esm/src/catalog/QuickView.tsx",
      lineNumber: 72,
      columnNumber: 9
    },
    this
  );
}
__name(QuickView, "QuickView");
export {
  QuickView as default
};
//# sourceMappingURL=QuickView.dev.js.map
