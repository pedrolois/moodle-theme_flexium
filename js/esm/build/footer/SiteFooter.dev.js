var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
/**
 * Flexium site footer: columns of blocks (logo, text, links, contact, social networks, legal links, support, user
 * tour reset, copyright) and a bottom bar.
 *
 * Site administrators with edit mode on build it in place: blocks are dragged between columns and the bottom bar (or
 * moved with the arrows), a magic wand on each block opens its settings, another one the footer's own look.
 *
 * Mounted by theme_flexium\output\core_renderer::flexium_footer().
 *
 * @module     theme_flexium/footer/SiteFooter
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useEffect, useId, useState } from "react";
import { fetchOne } from "@moodle/lms/core/ajax";
import { Spotlight } from "@moodle/lms/theme_flexium/catalog/EditZones";
import { warnOnLeave } from "@moodle/lms/theme_flexium/catalog/useCatalogEditor";
import BlockView, { isEmptyBlock, str } from "@moodle/lms/theme_flexium/footer/Blocks";
import SchemaForm from "@moodle/lms/theme_flexium/home/SchemaForm";
const DRAG_TYPE = "application/x-flexium-footer-block";
const MOVE_LABELS = { up: "home_moveup", down: "home_movedown", left: "footer_moveleft", right: "footer_moveright" };
const blankSettings = /* @__PURE__ */ __name((fields) => {
  const settings = {};
  fields.forEach((field) => {
    if (field.type === "bool") {
      settings[field.key] = false;
    } else if (field.type === "items") {
      settings[field.key] = [];
    } else if (field.type === "checklist") {
      settings[field.key] = field.choices.map((choice) => choice.key);
    } else {
      settings[field.key] = field.choices[0]?.key ?? "";
    }
  });
  return settings;
}, "blankSettings");
const newId = /* @__PURE__ */ __name((prefix) => `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`, "newId");
const blocksOf = /* @__PURE__ */ __name((layout, target) => target === "bottom" ? layout.bottom : layout.columns.find((column) => column.id === target)?.blocks ?? [], "blocksOf");
const withBlocks = /* @__PURE__ */ __name((layout, target, blocks) => target === "bottom" ? { ...layout, bottom: blocks } : { ...layout, columns: layout.columns.map((column) => column.id === target ? { ...column, blocks } : column) }, "withBlocks");
const locate = /* @__PURE__ */ __name((layout, id) => {
  for (const target of [...layout.columns.map((column) => column.id), "bottom"]) {
    const index = blocksOf(layout, target).findIndex((block) => block.id === id);
    if (index >= 0) {
      return { target, index };
    }
  }
  return null;
}, "locate");
const moveBlock = /* @__PURE__ */ __name((layout, id, target, index) => {
  const from = locate(layout, id);
  if (!from) {
    return layout;
  }
  const block = blocksOf(layout, from.target)[from.index];
  let next = withBlocks(layout, from.target, blocksOf(layout, from.target).filter((item) => item.id !== id));
  const position = from.target === target && from.index < index ? index - 1 : index;
  const blocks = [...blocksOf(next, target)];
  blocks.splice(Math.max(0, Math.min(position, blocks.length)), 0, block);
  next = withBlocks(next, target, blocks);
  return next;
}, "moveBlock");
const backgroundOf = /* @__PURE__ */ __name((style, palette) => {
  const background = String(style.background || "dark");
  return {
    className: `flexium-footer--${background === "light" ? "light" : "dark"} flexium-footer--bg-${background}`,
    style: background === "palette" ? { backgroundImage: `url("${palette[String(style.palette || "1")]}")` } : void 0
  };
}, "backgroundOf");
function BlockFrame({
  block,
  active,
  strings,
  dropbefore,
  onWand,
  onDelete,
  onMove,
  onDragStart,
  onDragEnd,
  onDragOver,
  children
}) {
  const name = str(strings, `footer_type_${block.type}`);
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      className: `flexium-footerblock flexium-editzone${active ? " flexium-editzone--active" : ""}` + (dropbefore ? " flexium-footerblock--dropbefore" : ""),
      draggable: true,
      onDragStart,
      onDragEnd,
      onDragOver,
      "data-block": block.type,
      children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flexium-footerblock__bar", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "flexium-footerblock__handle", title: str(strings, "footer_drag", name), "aria-hidden": "true", children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-grip-vertical" }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
            lineNumber: 190,
            columnNumber: 21
          }, this) }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
            lineNumber: 189,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "flexium-footerblock__name", title: name, children: name }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
            lineNumber: 192,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              type: "button",
              className: "flexium-homeframe__btn flexium-homeframe__btn--wand",
              "data-action": "settings",
              onClick: onWand,
              "aria-expanded": active,
              "aria-label": str(strings, "editor_wand", name),
              title: str(strings, "editor_wand", name),
              children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-wand-magic-sparkles", "aria-hidden": "true" }, void 0, false, {
                fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
                lineNumber: 196,
                columnNumber: 21
              }, this)
            },
            void 0,
            false,
            {
              fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
              lineNumber: 193,
              columnNumber: 17
            },
            this
          ),
          ["up", "down", "left", "right"].map((direction) => /* @__PURE__ */ jsxDEV(
            "button",
            {
              type: "button",
              className: "flexium-homeframe__btn",
              "data-action": `move${direction}`,
              onClick: () => onMove(direction),
              "aria-label": str(strings, MOVE_LABELS[direction]),
              title: str(strings, MOVE_LABELS[direction]),
              children: /* @__PURE__ */ jsxDEV("i", { className: `fa fa-arrow-${direction}`, "aria-hidden": "true" }, void 0, false, {
                fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
                lineNumber: 202,
                columnNumber: 25
              }, this)
            },
            direction,
            false,
            {
              fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
              lineNumber: 199,
              columnNumber: 21
            },
            this
          )),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              type: "button",
              className: "flexium-homeframe__btn flexium-homeframe__btn--delete",
              "data-action": "delete",
              onClick: onDelete,
              "aria-label": str(strings, "footer_deleteblock"),
              title: str(strings, "footer_deleteblock"),
              children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-trash-can", "aria-hidden": "true" }, void 0, false, {
                fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
                lineNumber: 208,
                columnNumber: 21
              }, this)
            },
            void 0,
            false,
            {
              fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
              lineNumber: 205,
              columnNumber: 17
            },
            this
          )
        ] }, void 0, true, {
          fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
          lineNumber: 188,
          columnNumber: 13
        }, this),
        children
      ]
    },
    void 0,
    true,
    {
      fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
      lineNumber: 185,
      columnNumber: 9
    },
    this
  );
}
__name(BlockFrame, "BlockFrame");
function FooterEditBar({ strings, status, dirty, canaddcolumn, onStyle, onAddColumn, onReset, onSave }) {
  const style = str(strings, "footer_style");
  return /* @__PURE__ */ jsxDEV("div", { className: "flexium-footer__editbar", children: [
    /* @__PURE__ */ jsxDEV("span", { className: "flexium-footer__edittitle", children: [
      /* @__PURE__ */ jsxDEV("i", { className: "fa fa-pen-to-square me-2", "aria-hidden": "true" }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
        lineNumber: 235,
        columnNumber: 17
      }, this),
      str(strings, "footer_editor_title")
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
      lineNumber: 234,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("span", { className: "flexium-footer__edithelp", children: str(strings, "footer_editor_help") }, void 0, false, {
      fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
      lineNumber: 237,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("span", { className: "flexium-editor__status", role: "status", children: [
      status === "saving" && str(strings, "editor_saving"),
      status === "saved" && !dirty && str(strings, "editor_saved"),
      status === "error" && str(strings, "editor_error"),
      status !== "saving" && dirty && str(strings, "editor_unsaved")
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
      lineNumber: 238,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV(
      "button",
      {
        type: "button",
        className: "flexium-homeframe__btn flexium-homeframe__btn--wand",
        "data-action": "style",
        onClick: onStyle,
        "aria-label": str(strings, "editor_wand", style),
        title: str(strings, "editor_wand", style),
        children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-wand-magic-sparkles", "aria-hidden": "true" }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
          lineNumber: 246,
          columnNumber: 17
        }, this)
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
        lineNumber: 244,
        columnNumber: 13
      },
      this
    ),
    /* @__PURE__ */ jsxDEV(
      "button",
      {
        type: "button",
        className: "btn btn-sm btn-outline-light",
        "data-action": "addcolumn",
        onClick: onAddColumn,
        disabled: !canaddcolumn,
        children: [
          /* @__PURE__ */ jsxDEV("i", { className: "fa fa-table-columns me-1", "aria-hidden": "true" }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
            lineNumber: 250,
            columnNumber: 17
          }, this),
          str(strings, "footer_addcolumn")
        ]
      },
      void 0,
      true,
      {
        fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
        lineNumber: 248,
        columnNumber: 13
      },
      this
    ),
    /* @__PURE__ */ jsxDEV(
      "button",
      {
        type: "button",
        className: "btn btn-sm btn-outline-light",
        "data-action": "discard",
        disabled: !dirty || status === "saving",
        onClick: onReset,
        children: str(strings, "editor_reset")
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
        lineNumber: 252,
        columnNumber: 13
      },
      this
    ),
    /* @__PURE__ */ jsxDEV(
      "button",
      {
        type: "button",
        className: "btn btn-sm btn-light",
        "data-action": "save",
        disabled: !dirty || status === "saving",
        onClick: onSave,
        children: str(strings, "editor_save")
      },
      void 0,
      false,
      {
        fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
        lineNumber: 254,
        columnNumber: 13
      },
      this
    )
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
    lineNumber: 233,
    columnNumber: 9
  }, this);
}
__name(FooterEditBar, "FooterEditBar");
function FooterPanel({ panel, layout, editor, strings, palette, onClose, onChange, onAdd }) {
  const id = useId();
  const panelblock = panel.kind === "block" ? locate(layout, panel.id) : null;
  const block = panelblock ? blocksOf(layout, panelblock.target)[panelblock.index] : null;
  let paneltitle = str(strings, "footer_style");
  if (panel.kind === "add") {
    paneltitle = str(strings, "footer_addblock");
  } else if (block) {
    paneltitle = str(strings, `footer_type_${block.type}`);
  }
  const setLayout = onChange;
  const setPanel = /* @__PURE__ */ __name((value) => value === null && onClose(), "setPanel");
  const add = onAdd;
  return /* @__PURE__ */ jsxDEV("aside", { className: "flexium-editpanel flexium-footerpanel", "aria-labelledby": `${id}-title`, children: [
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-editpanel__header", children: [
      /* @__PURE__ */ jsxDEV("h2", { id: `${id}-title`, className: "flexium-editpanel__title", children: [
        /* @__PURE__ */ jsxDEV("i", { className: "fa fa-wand-magic-sparkles me-2", "aria-hidden": "true" }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
          lineNumber: 291,
          columnNumber: 33
        }, this),
        paneltitle
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
        lineNumber: 290,
        columnNumber: 29
      }, this),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          className: "btn-close",
          "aria-label": str(strings, "editor_closepanel"),
          onClick: () => setPanel(null)
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
          lineNumber: 293,
          columnNumber: 29
        },
        this
      )
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
      lineNumber: 289,
      columnNumber: 25
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flexium-editpanel__body", children: [
      panel.kind === "style" && /* @__PURE__ */ jsxDEV(
        SchemaForm,
        {
          fields: editor.schema.style,
          settings: layout.style,
          strings,
          palette,
          icons: {},
          data: null,
          onChange: (style) => setLayout({ ...layout, style })
        },
        void 0,
        false,
        {
          fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
          lineNumber: 298,
          columnNumber: 33
        },
        this
      ),
      block && panelblock && /* @__PURE__ */ jsxDEV(Fragment, { children: [
        /* @__PURE__ */ jsxDEV("p", { className: "flexium-feature__help mb-3", children: str(strings, `footer_type_${block.type}_desc`) }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
          lineNumber: 303,
          columnNumber: 37
        }, this),
        /* @__PURE__ */ jsxDEV(
          SchemaForm,
          {
            fields: editor.schema.blocks[block.type] ?? [],
            settings: block.settings,
            strings,
            palette,
            icons: {},
            data: null,
            onChange: (settings) => setLayout(withBlocks(
              layout,
              panelblock.target,
              blocksOf(layout, panelblock.target).map((item) => item.id === block.id ? { ...item, settings } : item)
            ))
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
            lineNumber: 306,
            columnNumber: 37
          },
          this
        )
      ] }, void 0, true, {
        fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
        lineNumber: 302,
        columnNumber: 33
      }, this),
      panel.kind === "add" && /* @__PURE__ */ jsxDEV("ul", { className: "flexium-homepicker", children: editor.types.map((type) => /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          className: "flexium-homepicker__item",
          "data-type": type,
          onClick: () => add(panel.target, type),
          children: [
            /* @__PURE__ */ jsxDEV("strong", { children: str(strings, `footer_type_${type}`) }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
              lineNumber: 319,
              columnNumber: 49
            }, this),
            /* @__PURE__ */ jsxDEV("span", { children: str(strings, `footer_type_${type}_desc`) }, void 0, false, {
              fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
              lineNumber: 320,
              columnNumber: 49
            }, this)
          ]
        },
        void 0,
        true,
        {
          fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
          lineNumber: 317,
          columnNumber: 45
        },
        this
      ) }, type, false, {
        fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
        lineNumber: 316,
        columnNumber: 41
      }, this)) }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
        lineNumber: 314,
        columnNumber: 33
      }, this)
    ] }, void 0, true, {
      fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
      lineNumber: 296,
      columnNumber: 25
    }, this)
  ] }, void 0, true, {
    fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
    lineNumber: 288,
    columnNumber: 21
  }, this);
}
__name(FooterPanel, "FooterPanel");
function SiteFooter({ layout: savedlayout, data, networks, palette, strings, editor }) {
  const id = useId();
  const [saved, setSaved] = useState(savedlayout);
  const [layout, setLayout] = useState(savedlayout);
  const [panel, setPanel] = useState(null);
  const [status, setStatus] = useState("idle");
  const [dragging, setDragging] = useState(null);
  const [drop, setDrop] = useState(null);
  const dirty = JSON.stringify(layout) !== JSON.stringify(saved);
  const editing = !!editor;
  const context = { data, networks, strings, editing };
  useEffect(() => warnOnLeave(dirty, strings.editor_leaveunsaved ?? ""), [dirty, strings]);
  useEffect(() => {
    document.body.classList.toggle("flexium-nomoodlefooter", layout.style.moodlebutton === false);
  }, [layout.style.moodlebutton]);
  const background = backgroundOf(layout.style, palette);
  const activeid = panel?.kind === "block" ? panel.id : "";
  const move = /* @__PURE__ */ __name((blockid, direction) => {
    const from = locate(layout, blockid);
    if (!from) {
      return;
    }
    const targets = [...layout.columns.map((column) => column.id), "bottom"];
    const position = targets.indexOf(from.target);
    if (direction === "up" || direction === "down") {
      const index = from.index + (direction === "up" ? -1 : 2);
      setLayout(moveBlock(layout, blockid, from.target, Math.max(0, index)));
    } else {
      const target = targets[position + (direction === "left" ? -1 : 1)];
      if (target) {
        setLayout(moveBlock(layout, blockid, target, blocksOf(layout, target).length));
      }
    }
  }, "move");
  const remove = /* @__PURE__ */ __name((blockid) => {
    const from = locate(layout, blockid);
    if (from && window.confirm(str(strings, "footer_deleteblock_confirm"))) {
      setLayout(withBlocks(layout, from.target, blocksOf(layout, from.target).filter((block) => block.id !== blockid)));
      setPanel(null);
    }
  }, "remove");
  const add = /* @__PURE__ */ __name((target, type) => {
    const block = { id: newId("b"), type, settings: blankSettings(editor?.schema.blocks[type] ?? []) };
    setLayout(withBlocks(layout, target, [...blocksOf(layout, target), block]));
    setPanel({ kind: "block", id: block.id });
  }, "add");
  const save = /* @__PURE__ */ __name(() => {
    setStatus("saving");
    fetchOne({ methodname: "theme_flexium_save_footer", args: { footer: JSON.stringify(layout) } }).then((result) => {
      const next = JSON.parse(result);
      setSaved(next);
      setLayout(next);
      setStatus("saved");
      return next;
    }).catch(() => setStatus("error"));
  }, "save");
  const overBlock = /* @__PURE__ */ __name((event, target, index) => {
    if (!dragging || !event.dataTransfer.types.includes(DRAG_TYPE)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const after = target === "bottom" ? event.clientX > rect.left + rect.width / 2 : event.clientY > rect.top + rect.height / 2;
    setDrop({ target, index: after ? index + 1 : index });
  }, "overBlock");
  const overContainer = /* @__PURE__ */ __name((event, target) => {
    if (!dragging || !event.dataTransfer.types.includes(DRAG_TYPE)) {
      return;
    }
    event.preventDefault();
    if (!drop || drop.target !== target) {
      setDrop({ target, index: blocksOf(layout, target).length });
    }
  }, "overContainer");
  const dropHere = /* @__PURE__ */ __name((event) => {
    event.preventDefault();
    if (dragging && drop) {
      setLayout(moveBlock(layout, dragging, drop.target, drop.index));
    }
    setDragging(null);
    setDrop(null);
  }, "dropHere");
  const renderBlocks = /* @__PURE__ */ __name((target) => blocksOf(layout, target).map((block, index) => editing ? /* @__PURE__ */ jsxDEV(
    BlockFrame,
    {
      block,
      active: activeid === block.id,
      strings,
      dropbefore: drop?.target === target && drop.index === index && dragging !== block.id,
      onWand: () => setPanel(activeid === block.id ? null : { kind: "block", id: block.id }),
      onDelete: () => remove(block.id),
      onMove: (direction) => move(block.id, direction),
      onDragStart: (event) => {
        event.dataTransfer.setData(DRAG_TYPE, block.id);
        event.dataTransfer.effectAllowed = "move";
        setDragging(block.id);
      },
      onDragEnd: () => {
        setDragging(null);
        setDrop(null);
      },
      onDragOver: (event) => overBlock(event, target, index),
      children: /* @__PURE__ */ jsxDEV(BlockView, { block, context }, void 0, false, {
        fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
        lineNumber: 443,
        columnNumber: 13
      }, this)
    },
    block.id,
    false,
    {
      fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
      lineNumber: 429,
      columnNumber: 9
    },
    this
  ) : !isEmptyBlock(block) && /* @__PURE__ */ jsxDEV("div", { className: "flexium-footer__block", children: /* @__PURE__ */ jsxDEV(BlockView, { block, context }, void 0, false, {
    fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
    lineNumber: 446,
    columnNumber: 63
  }, this) }, block.id, false, {
    fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
    lineNumber: 446,
    columnNumber: 9
  }, this)), "renderBlocks");
  const container = /* @__PURE__ */ __name((target, className, extra) => /* @__PURE__ */ jsxDEV(
    "div",
    {
      className: `${className}${editing ? " flexium-footer__drop" : ""}` + (drop?.target === target && drop.index === blocksOf(layout, target).length ? " flexium-footer__drop--end" : ""),
      onDragOver: editing ? (event) => overContainer(event, target) : void 0,
      onDrop: editing ? dropHere : void 0,
      children: [
        extra,
        renderBlocks(target),
        editing && /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            className: "flexium-footer__add",
            "data-action": "addblock",
            onClick: () => setPanel({ kind: "add", target }),
            children: [
              /* @__PURE__ */ jsxDEV("i", { className: "fa fa-plus me-1", "aria-hidden": "true" }, void 0, false, {
                fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
                lineNumber: 458,
                columnNumber: 21
              }, this),
              str(strings, "footer_addblock")
            ]
          },
          void 0,
          true,
          {
            fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
            lineNumber: 456,
            columnNumber: 17
          },
          this
        )
      ]
    },
    void 0,
    true,
    {
      fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
      lineNumber: 450,
      columnNumber: 9
    },
    this
  ), "container");
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      className: `flexium-footer ${background.className} flexium-footer--${String(layout.style.align || "left")}${editing ? " flexium-footer--editing" : ""}`,
      style: background.style,
      children: [
        editing && /* @__PURE__ */ jsxDEV(
          FooterEditBar,
          {
            strings,
            status,
            dirty,
            canaddcolumn: layout.columns.length < 6,
            onStyle: () => setPanel(panel?.kind === "style" ? null : { kind: "style" }),
            onAddColumn: () => setLayout({ ...layout, columns: [...layout.columns, { id: newId("c"), blocks: [] }] }),
            onReset: () => setLayout(saved),
            onSave: save
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
            lineNumber: 469,
            columnNumber: 17
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "div",
          {
            className: "flexium-footer__columns",
            style: { "--flexium-footer-columns": Math.max(1, layout.columns.length) },
            children: layout.columns.map((column, index) => container(column.id, "flexium-footer__column", editing ? /* @__PURE__ */ jsxDEV("div", { className: "flexium-footer__columnbar", children: [
              /* @__PURE__ */ jsxDEV("span", { children: str(strings, "footer_column", index + 1) }, void 0, false, {
                fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
                lineNumber: 478,
                columnNumber: 25
              }, this),
              /* @__PURE__ */ jsxDEV(
                "button",
                {
                  type: "button",
                  className: "flexium-homeframe__btn",
                  disabled: index === 0,
                  "aria-label": str(strings, "footer_moveleft"),
                  onClick: () => {
                    const columns = [...layout.columns];
                    [columns[index - 1], columns[index]] = [columns[index], columns[index - 1]];
                    setLayout({ ...layout, columns });
                  },
                  children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-arrow-left", "aria-hidden": "true" }, void 0, false, {
                    fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
                    lineNumber: 485,
                    columnNumber: 29
                  }, this)
                },
                void 0,
                false,
                {
                  fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
                  lineNumber: 479,
                  columnNumber: 25
                },
                this
              ),
              /* @__PURE__ */ jsxDEV(
                "button",
                {
                  type: "button",
                  className: "flexium-homeframe__btn",
                  disabled: index === layout.columns.length - 1,
                  "aria-label": str(strings, "footer_moveright"),
                  onClick: () => {
                    const columns = [...layout.columns];
                    [columns[index + 1], columns[index]] = [columns[index], columns[index + 1]];
                    setLayout({ ...layout, columns });
                  },
                  children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-arrow-right", "aria-hidden": "true" }, void 0, false, {
                    fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
                    lineNumber: 493,
                    columnNumber: 29
                  }, this)
                },
                void 0,
                false,
                {
                  fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
                  lineNumber: 487,
                  columnNumber: 25
                },
                this
              ),
              /* @__PURE__ */ jsxDEV(
                "button",
                {
                  type: "button",
                  className: "flexium-homeframe__btn flexium-homeframe__btn--delete",
                  "aria-label": str(strings, "footer_removecolumn"),
                  onClick: () => {
                    if (window.confirm(str(strings, "footer_removecolumn_confirm"))) {
                      setLayout({ ...layout, columns: layout.columns.filter((item) => item.id !== column.id) });
                    }
                  },
                  children: /* @__PURE__ */ jsxDEV("i", { className: "fa fa-trash-can", "aria-hidden": "true" }, void 0, false, {
                    fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
                    lineNumber: 502,
                    columnNumber: 29
                  }, this)
                },
                void 0,
                false,
                {
                  fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
                  lineNumber: 495,
                  columnNumber: 25
                },
                this
              )
            ] }, void 0, true, {
              fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
              lineNumber: 477,
              columnNumber: 21
            }, this) : void 0))
          },
          void 0,
          false,
          {
            fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
            lineNumber: 474,
            columnNumber: 13
          },
          this
        ),
        (layout.style.bottombar !== false || editing) && container("bottom", "flexium-footer__bottom", editing ? /* @__PURE__ */ jsxDEV("span", { className: "flexium-footer__columnbar", children: /* @__PURE__ */ jsxDEV("span", { children: str(strings, "footer_bottom") }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
          lineNumber: 508,
          columnNumber: 63
        }, this) }, void 0, false, {
          fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
          lineNumber: 508,
          columnNumber: 19
        }, this) : void 0),
        editing && editor && panel && /* @__PURE__ */ jsxDEV(Fragment, { children: [
          activeid && /* @__PURE__ */ jsxDEV(Spotlight, { zone: activeid }, void 0, false, {
            fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
            lineNumber: 512,
            columnNumber: 34
          }, this),
          /* @__PURE__ */ jsxDEV(
            FooterPanel,
            {
              panel,
              layout,
              editor,
              strings,
              palette,
              onClose: () => setPanel(null),
              onChange: setLayout,
              onAdd: add
            },
            void 0,
            false,
            {
              fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
              lineNumber: 513,
              columnNumber: 21
            },
            this
          )
        ] }, void 0, true, {
          fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
          lineNumber: 511,
          columnNumber: 17
        }, this)
      ]
    },
    void 0,
    true,
    {
      fileName: "public/theme/flexium/js/esm/src/footer/SiteFooter.tsx",
      lineNumber: 465,
      columnNumber: 9
    },
    this
  );
}
__name(SiteFooter, "SiteFooter");
export {
  SiteFooter as default
};
//# sourceMappingURL=SiteFooter.dev.js.map
