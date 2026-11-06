var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
 * State of the catalogue editor (edit mode, site administrators): the draft filter layout, card
 * settings, page options and features, compared with the saved ones, and saving them.
 *
 * @module     theme_flexium/catalog/useCatalogEditor
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { useEffect, useState } from "react";
import { saveCatalogLayout } from "./repository";
const warnOnLeave = /* @__PURE__ */ __name((dirty, message) => {
  if (!dirty) {
    return void 0;
  }
  const warn = /* @__PURE__ */ __name((event) => {
    event.preventDefault();
  }, "warn");
  const editswitch = /* @__PURE__ */ __name((event) => {
    const target = event.target;
    if (!target?.closest('.editmode-switch-form, input[name="setmode"]')) {
      return;
    }
    if (window.confirm(message)) {
      window.removeEventListener("beforeunload", warn);
    } else {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, "editswitch");
  window.addEventListener("beforeunload", warn);
  document.addEventListener("click", editswitch, true);
  return () => {
    window.removeEventListener("beforeunload", warn);
    document.removeEventListener("click", editswitch, true);
  };
}, "warnOnLeave");
function useCatalogEditor(editor, onSaved) {
  const initial = editor ? { layout: editor.layout, card: editor.card, options: editor.options, features: editor.features } : null;
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [status, setStatus] = useState("idle");
  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);
  useEffect(() => warnOnLeave(dirty, editor?.strings.editor_leaveunsaved ?? ""), [dirty, editor]);
  const setLayout = /* @__PURE__ */ __name((layout) => draft && setDraft({ ...draft, layout }), "setLayout");
  const setCard = /* @__PURE__ */ __name((card) => draft && setDraft({ ...draft, card }), "setCard");
  const setOptions = /* @__PURE__ */ __name((options) => draft && setDraft({ ...draft, options }), "setOptions");
  const setFeature = /* @__PURE__ */ __name((key, value) => draft && setDraft({ ...draft, features: { ...draft.features, [key]: value } }), "setFeature");
  const save = /* @__PURE__ */ __name(() => {
    if (!draft) {
      return;
    }
    setStatus("saving");
    saveCatalogLayout(draft.layout, draft.card, draft.options, draft.features).then(([layout, card, options, features]) => {
      const next = { layout, card, options, features };
      setSaved(next);
      setDraft(next);
      setStatus("saved");
      onSaved();
      return next;
    }).catch(() => setStatus("error"));
  }, "save");
  const reset = /* @__PURE__ */ __name(() => {
    setDraft(saved);
    setStatus("idle");
  }, "reset");
  return { draft, dirty, status, setLayout, setCard, setOptions, setFeature, save, reset };
}
__name(useCatalogEditor, "useCatalogEditor");
export {
  useCatalogEditor as default,
  warnOnLeave
};
//# sourceMappingURL=useCatalogEditor.dev.js.map
