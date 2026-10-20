var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
/**
 * Web service calls of the home page builder. Course lists reuse the catalogue web service.
 *
 * @module     theme_flexium/home/repository
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import { fetchOne } from "@moodle/lms/core/ajax";
import { getCatalog } from "@moodle/lms/theme_flexium/catalog/repository";
const hasSession = /* @__PURE__ */ __name(() => !document.body.classList.contains("notloggedin"), "hasSession");
const getHomeData = /* @__PURE__ */ __name(() => fetchOne({ methodname: "theme_flexium_get_home_data", args: {} }, { loginrequired: hasSession() }), "getHomeData");
const saveHomePage = /* @__PURE__ */ __name(async (page) => {
  const saved = await fetchOne({ methodname: "theme_flexium_save_home_page", args: { page: JSON.stringify(page) } });
  return JSON.parse(saved);
}, "saveHomePage");
const getSectionCourses = /* @__PURE__ */ __name(async (source, categoryid, count) => {
  const quick = ["startingsoon", "inprogress", "mycourses", "favourites"].includes(source) ? [source] : [];
  const sort = { latest: "latest", popular: "popularity", startingsoon: "startdate" }[source] ?? "name";
  const response = await getCatalog({
    search: "",
    selected: source === "category" && categoryid ? { category: [String(categoryid)] } : {},
    sort,
    page: 0,
    perpage: 0,
    quick,
    startfrom: "",
    startto: ""
  }, count);
  return response.courses;
}, "getSectionCourses");
export {
  getHomeData,
  getSectionCourses,
  saveHomePage
};
//# sourceMappingURL=repository.dev.js.map
