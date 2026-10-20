var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { jsxDEV } from "react/jsx-dev-runtime";
/**
 * Control of one optional catalogue feature (switch, select with colour swatches, ordered list or text), generated
 * from the server definition. Used by the side panel of the in-place editor (EditZones).
 *
 * @module     theme_flexium/catalog/FeatureControl
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useId, useState } from "react";
import WidgetList from "@moodle/lms/theme_flexium/catalog/WidgetList";
import { uploadDefaultImage } from "./repository";
import { str } from "./utils";
function ImageUploader({ upload, onUploaded, strings }) {
  const id = useId();
  const [status, setStatus] = useState(
    { state: "idle" }
  );
  if (!upload) {
    return /* @__PURE__ */ jsxDEV("p", { className: "flexium-feature__help", children: str(strings, "image_noupload") }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
      lineNumber: 58,
      columnNumber: 16
    }, this);
  }
  const choose = /* @__PURE__ */ __name((file) => {
    if (!file) {
      return;
    }
    setStatus({ state: "uploading" });
    uploadDefaultImage(file, upload).then((url) => {
      setStatus({ state: "done" });
      onUploaded(url);
      return url;
    }).catch((error) => setStatus({ state: "error", message: error.message }));
  }, "choose");
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-feature__upload", children: [
    /* @__PURE__ */ jsxDEV("label", { htmlFor: id, className: `btn btn-sm btn-outline-primary${status.state === "uploading" ? " disabled" : ""}`, children: [
      /* @__PURE__ */ jsxDEV("i", { className: "fa fa-upload me-1", "aria-hidden": "true" }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
        lineNumber: 78,
        columnNumber: 17
      }, this),
      str(strings, status.state === "uploading" ? "image_uploading" : "image_upload")
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
      lineNumber: 77,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV(
      "input",
      {
        id,
        type: "file",
        className: "visually-hidden",
        accept: "image/*",
        disabled: status.state === "uploading",
        onChange: (event) => {
          choose(event.target.files?.[0]);
          event.target.value = "";
        }
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
        lineNumber: 81,
        columnNumber: 13
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("span", { role: "status", className: "flexium-feature__uploadstatus", children: [
      status.state === "done" && str(strings, "image_uploaded"),
      status.state === "error" && str(strings, "image_uploaderror", status.message ?? "")
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
      lineNumber: 87,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
    lineNumber: 76,
    columnNumber: 9
  }, this);
}
__name(ImageUploader, "ImageUploader");
function FeatureControl({
  definition,
  value,
  onChange,
  palette,
  strings,
  upload,
  onUploaded
}) {
  const id = useId();
  const help = /* @__PURE__ */ jsxDEV("p", { id: `${id}-help`, className: "flexium-feature__help", children: definition.help }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
    lineNumber: 98,
    columnNumber: 18
  }, this);
  if (definition.type === "bool") {
    return /* @__PURE__ */ jsxDEV("div", { className: "flexium-feature", "data-feature": definition.key, children: [
      /* @__PURE__ */ jsxDEV("div", { className: "form-check form-switch", children: [
        /* @__PURE__ */ jsxDEV(
          "input",
          {
            id,
            type: "checkbox",
            role: "switch",
            className: "form-check-input",
            checked: value === "1",
            "aria-describedby": `${id}-help`,
            onChange: (event) => onChange(event.target.checked ? "1" : "0")
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
            lineNumber: 104,
            columnNumber: 21
          },
          this
        ),
        /* @__PURE__ */ jsxDEV("label", { htmlFor: id, className: "form-check-label flexium-feature__label", children: definition.label }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
          lineNumber: 106,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
        lineNumber: 103,
        columnNumber: 17
      }, this),
      help
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
      lineNumber: 102,
      columnNumber: 13
    }, this);
  }
  if (definition.type === "list") {
    return /* @__PURE__ */ jsxDEV("div", { className: "flexium-feature flexium-feature--wide", "data-feature": definition.key, children: [
      /* @__PURE__ */ jsxDEV("p", { className: "flexium-feature__label mb-1", children: definition.label }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
        lineNumber: 116,
        columnNumber: 17
      }, this),
      help,
      /* @__PURE__ */ jsxDEV(
        WidgetList,
        {
          title: definition.label,
          value: value === "" ? [] : value.split(","),
          choices: definition.choices,
          onChange: (keys) => onChange(keys.join(",")),
          strings
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
          lineNumber: 118,
          columnNumber: 17
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
      lineNumber: 115,
      columnNumber: 13
    }, this);
  }
  if (definition.type === "select") {
    const swatches = ["bannerstyle", "defaultimage"].includes(definition.key);
    return /* @__PURE__ */ jsxDEV("div", { className: "flexium-feature", "data-feature": definition.key, children: [
      /* @__PURE__ */ jsxDEV("label", { htmlFor: id, className: "flexium-feature__label", children: definition.label }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
        lineNumber: 129,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV(
        "select",
        {
          id,
          className: "form-select form-select-sm",
          value,
          "aria-describedby": `${id}-help`,
          onChange: (event) => onChange(event.target.value),
          children: definition.choices.map((choice) => /* @__PURE__ */ jsxDEV("option", { value: choice.key, children: choice.label }, choice.key, false, {
            fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
            lineNumber: 132,
            columnNumber: 55
          }, this))
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
          lineNumber: 130,
          columnNumber: 17
        },
        this
      ),
      swatches && // Colour choices: clickable previews of the six headers.
      /* @__PURE__ */ jsxDEV("div", { className: "flexium-feature__swatches", children: definition.choices.filter((choice) => palette[choice.key]).map((choice) => /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          className: `flexium-feature__swatch${value === choice.key ? " is-active" : ""}`,
          style: { backgroundImage: `url("${palette[choice.key]}")` },
          "aria-label": choice.label,
          "aria-pressed": value === choice.key,
          onClick: () => onChange(choice.key)
        },
        choice.key,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
          lineNumber: 138,
          columnNumber: 29
        },
        this
      )) }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
        lineNumber: 136,
        columnNumber: 21
      }, this),
      definition.key === "defaultimage" && onUploaded && /* @__PURE__ */ jsxDEV(ImageUploader, { upload: upload ?? null, onUploaded, strings }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
        lineNumber: 147,
        columnNumber: 21
      }, this),
      help
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
      lineNumber: 128,
      columnNumber: 13
    }, this);
  }
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-feature", "data-feature": definition.key, children: [
    /* @__PURE__ */ jsxDEV("label", { htmlFor: id, className: "flexium-feature__label", children: definition.label }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
      lineNumber: 156,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV(
      "input",
      {
        id,
        type: "text",
        className: "form-control form-control-sm",
        value,
        maxLength: 255,
        "aria-describedby": `${id}-help`,
        onChange: (event) => onChange(event.target.value)
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
        lineNumber: 157,
        columnNumber: 13
      },
      this
    ),
    help
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
    lineNumber: 155,
    columnNumber: 9
  }, this);
}
__name(FeatureControl, "FeatureControl");
export {
  FeatureControl as default
};
//# sourceMappingURL=FeatureControl.dev.js.map
