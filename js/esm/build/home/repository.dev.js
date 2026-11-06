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
