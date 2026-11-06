var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { jsxDEV } from "react/jsx-dev-runtime";
/*
 * This file is part of Moodle - http://moodle.org/
 *
 * Moodle is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Moodle is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Moodle.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
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
      lineNumber: 62,
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
        lineNumber: 82,
        columnNumber: 17
      }, this),
      str(strings, status.state === "uploading" ? "image_uploading" : "image_upload")
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
      lineNumber: 81,
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
        lineNumber: 85,
        columnNumber: 13
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("span", { role: "status", className: "flexium-feature__uploadstatus", children: [
      status.state === "done" && str(strings, "image_uploaded"),
      status.state === "error" && str(strings, "image_uploaderror", status.message ?? "")
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
      lineNumber: 91,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
    lineNumber: 80,
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
    lineNumber: 102,
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
            lineNumber: 108,
            columnNumber: 21
          },
          this
        ),
        /* @__PURE__ */ jsxDEV("label", { htmlFor: id, className: "form-check-label flexium-feature__label", children: definition.label }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
          lineNumber: 110,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
        lineNumber: 107,
        columnNumber: 17
      }, this),
      help
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
      lineNumber: 106,
      columnNumber: 13
    }, this);
  }
  if (definition.type === "list") {
    return /* @__PURE__ */ jsxDEV("div", { className: "flexium-feature flexium-feature--wide", "data-feature": definition.key, children: [
      /* @__PURE__ */ jsxDEV("p", { className: "flexium-feature__label mb-1", children: definition.label }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
        lineNumber: 120,
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
          lineNumber: 122,
          columnNumber: 17
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
      lineNumber: 119,
      columnNumber: 13
    }, this);
  }
  if (definition.type === "select") {
    const swatches = ["bannerstyle", "defaultimage"].includes(definition.key);
    return /* @__PURE__ */ jsxDEV("div", { className: "flexium-feature", "data-feature": definition.key, children: [
      /* @__PURE__ */ jsxDEV("label", { htmlFor: id, className: "flexium-feature__label", children: definition.label }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
        lineNumber: 133,
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
            lineNumber: 136,
            columnNumber: 55
          }, this))
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
          lineNumber: 134,
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
          lineNumber: 142,
          columnNumber: 29
        },
        this
      )) }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
        lineNumber: 140,
        columnNumber: 21
      }, this),
      definition.key === "defaultimage" && onUploaded && /* @__PURE__ */ jsxDEV(ImageUploader, { upload: upload ?? null, onUploaded, strings }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
        lineNumber: 151,
        columnNumber: 21
      }, this),
      help
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
      lineNumber: 132,
      columnNumber: 13
    }, this);
  }
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-feature", "data-feature": definition.key, children: [
    /* @__PURE__ */ jsxDEV("label", { htmlFor: id, className: "flexium-feature__label", children: definition.label }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
      lineNumber: 160,
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
        lineNumber: 161,
        columnNumber: 13
      },
      this
    ),
    help
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/catalog/FeatureControl.tsx",
    lineNumber: 159,
    columnNumber: 9
  }, this);
}
__name(FeatureControl, "FeatureControl");
export {
  FeatureControl as default
};
//# sourceMappingURL=FeatureControl.dev.js.map
