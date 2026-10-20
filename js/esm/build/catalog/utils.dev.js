var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
/**
 * Helpers of the course catalogue: strings, dates and the URL state.
 *
 * @module     theme_flexium/catalog/utils
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
const PARAM_SEARCH = "q";
const PARAM_SORT = "sort";
const PARAM_PAGE = "page";
const PARAM_PERPAGE = "perpage";
const PARAM_FILTER = "f";
const PARAM_QUICK = "quick";
const PARAM_FROM = "from";
const PARAM_TO = "to";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const str = /* @__PURE__ */ __name((strings, key, a = "") => (strings[key] ?? key).replace("{$a}", String(a)), "str");
const formatNumber = /* @__PURE__ */ __name((value) => new Intl.NumberFormat(document.documentElement.lang || void 0).format(value), "formatNumber");
const readQueryFromUrl = /* @__PURE__ */ __name((initialcategory, defaultsort) => {
  const params = new URLSearchParams(window.location.search);
  const selected = {};
  for (const entry of params.getAll(PARAM_FILTER)) {
    const separator = entry.indexOf("|");
    if (separator > 0) {
      const source = entry.slice(0, separator);
      (selected[source] ??= []).push(entry.slice(separator + 1));
    }
  }
  if (!params.has(PARAM_FILTER) && initialcategory) {
    selected.category = [initialcategory];
  }
  return {
    search: params.get(PARAM_SEARCH) ?? "",
    selected,
    sort: params.get(PARAM_SORT) ?? defaultsort,
    page: Math.max(0, parseInt(params.get(PARAM_PAGE) ?? "0", 10) || 0),
    perpage: Math.max(0, parseInt(params.get(PARAM_PERPAGE) ?? "0", 10) || 0),
    quick: params.getAll(PARAM_QUICK),
    startfrom: DATE_PATTERN.test(params.get(PARAM_FROM) ?? "") ? params.get(PARAM_FROM) ?? "" : "",
    startto: DATE_PATTERN.test(params.get(PARAM_TO) ?? "") ? params.get(PARAM_TO) ?? "" : ""
  };
}, "readQueryFromUrl");
const writeQueryToUrl = /* @__PURE__ */ __name((query, defaultsort) => {
  const params = new URLSearchParams();
  if (query.search) {
    params.set(PARAM_SEARCH, query.search);
  }
  for (const [source, values] of Object.entries(query.selected)) {
    for (const value of values) {
      params.append(PARAM_FILTER, `${source}|${value}`);
    }
  }
  query.quick.forEach((key) => params.append(PARAM_QUICK, key));
  if (query.startfrom) {
    params.set(PARAM_FROM, query.startfrom);
  }
  if (query.startto) {
    params.set(PARAM_TO, query.startto);
  }
  if (query.sort !== defaultsort) {
    params.set(PARAM_SORT, query.sort);
  }
  if (query.perpage > 0) {
    params.set(PARAM_PERPAGE, String(query.perpage));
  }
  if (query.page > 0) {
    params.set(PARAM_PAGE, String(query.page));
  }
  const search = params.toString();
  const url = window.location.pathname + (search ? `?${search}` : "") + window.location.hash;
  if (url !== window.location.pathname + window.location.search + window.location.hash) {
    window.history.replaceState(null, "", url);
  }
}, "writeQueryToUrl");
const toggleValue = /* @__PURE__ */ __name((selected, source, value) => {
  const values = selected[source] ?? [];
  const next = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
  const copy = { ...selected };
  if (next.length) {
    copy[source] = next;
  } else {
    delete copy[source];
  }
  return copy;
}, "toggleValue");
const decodeFeatures = /* @__PURE__ */ __name((raw, definitions) => {
  const features = {};
  definitions.forEach((definition) => {
    const value = raw[definition.key] ?? "";
    if (definition.type === "bool") {
      features[definition.key] = value === "1";
    } else if (definition.type === "list") {
      features[definition.key] = value === "" ? [] : value.split(",");
    } else {
      features[definition.key] = value;
    }
  });
  return features;
}, "decodeFeatures");
const dayToTimestamp = /* @__PURE__ */ __name((date, nextday = false) => {
  if (!DATE_PATTERN.test(date)) {
    return 0;
  }
  const [year, month, day] = date.split("-").map(Number);
  return Math.floor(new Date(year, month - 1, day + (nextday ? 1 : 0)).getTime() / 1e3);
}, "dayToTimestamp");
const readLocal = /* @__PURE__ */ __name((key) => {
  try {
    return window.localStorage.getItem(`theme_flexium_${key}`) ?? "";
  } catch {
    return "";
  }
}, "readLocal");
const writeLocal = /* @__PURE__ */ __name((key, value) => {
  try {
    window.localStorage.setItem(`theme_flexium_${key}`, value);
  } catch {
  }
}, "writeLocal");
const normalise = /* @__PURE__ */ __name((text) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase(), "normalise");
export {
  dayToTimestamp,
  decodeFeatures,
  formatNumber,
  normalise,
  readLocal,
  readQueryFromUrl,
  str,
  toggleValue,
  writeLocal,
  writeQueryToUrl
};
//# sourceMappingURL=utils.dev.js.map
