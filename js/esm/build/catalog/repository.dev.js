var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
/**
 * Data access for the course catalogue: the only module that calls web services.
 *
 * @module     theme_flexium/catalog/repository
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { fetchMany, fetchOne } from "@moodle/lms/core/ajax";
import config from "@moodle/lms/core/config";
import { dayToTimestamp } from "./utils";
const hasSession = /* @__PURE__ */ __name(() => !document.body.classList.contains("notloggedin"), "hasSession");
const saveCatalogLayout = /* @__PURE__ */ __name(async (layout, card, options, features) => {
  const [savedlayout, savedcard, savedoptions, savedfeatures] = await fetchMany([
    { methodname: "theme_flexium_save_filter_layout", args: { layout } },
    { methodname: "theme_flexium_save_card_layout", args: { ...card } },
    { methodname: "theme_flexium_save_catalog_options", args: { ...options } },
    { methodname: "theme_flexium_save_catalog_features", args: {
      features: Object.entries(features).map(([name, value]) => ({ name, value }))
    } }
  ]);
  const raw = {};
  savedfeatures.forEach((feature) => {
    raw[feature.name] = feature.value;
  });
  return [savedlayout, savedcard, savedoptions, raw];
}, "saveCatalogLayout");
const uploadDefaultImage = /* @__PURE__ */ __name(async (file, upload) => {
  if (upload.maxbytes > 0 && file.size > upload.maxbytes) {
    throw new Error(`${file.name}: > ${Math.round(upload.maxbytes / 1048576)} MB`);
  }
  const form = new FormData();
  form.append("repo_upload_file", file);
  form.append("repo_id", String(upload.repoid));
  form.append("itemid", String(upload.draftitemid));
  form.append("ctx_id", String(upload.contextid));
  form.append("sesskey", config.sesskey);
  form.append("savepath", "/");
  form.append("title", file.name);
  form.append("overwrite", "1");
  form.append("accepted_types[]", ".jpg");
  form.append("accepted_types[]", ".jpeg");
  form.append("accepted_types[]", ".png");
  form.append("accepted_types[]", ".gif");
  form.append("accepted_types[]", ".webp");
  form.append("accepted_types[]", ".svg");
  const response = await fetch(upload.url, { method: "POST", body: form, credentials: "same-origin" });
  const result = await response.json();
  if (result.error || !result.file) {
    throw new Error(result.error ?? response.statusText);
  }
  const saved = await fetchOne({
    methodname: "theme_flexium_save_default_image",
    args: { draftitemid: upload.draftitemid, filename: result.file }
  });
  return saved.url;
}, "uploadDefaultImage");
const getCoursePreview = /* @__PURE__ */ __name((courseid) => fetchOne({ methodname: "theme_flexium_get_course_preview", args: { courseid } }, { loginrequired: hasSession() }), "getCoursePreview");
const setFavourite = /* @__PURE__ */ __name((courseid, favourite) => fetchOne({ methodname: "core_course_set_favourite_courses", args: { courses: [{ id: courseid, favourite }] } }), "setFavourite");
const setPreference = /* @__PURE__ */ __name((name, value) => fetchOne({ methodname: "core_user_set_user_preferences", args: { preferences: [{ name, value, userid: 0 }] } }), "setPreference");
const getCatalog = /* @__PURE__ */ __name((query, perpage, preview = "") => {
  const filters = Object.entries(query.selected).filter(([, values]) => values.length > 0).map(([source, values]) => ({ source, values }));
  const request = /* @__PURE__ */ __name(() => fetchOne({
    methodname: "theme_flexium_get_catalog",
    args: {
      search: query.search,
      filters,
      sort: query.sort,
      page: query.page,
      perpage,
      quick: query.quick,
      startfrom: dayToTimestamp(query.startfrom),
      startto: dayToTimestamp(query.startto, true),
      preview
    }
  }, { loginrequired: hasSession() }), "request");
  return request().catch(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return request();
  });
}, "getCatalog");
export {
  getCatalog,
  getCoursePreview,
  saveCatalogLayout,
  setFavourite,
  setPreference,
  uploadDefaultImage
};
//# sourceMappingURL=repository.dev.js.map
