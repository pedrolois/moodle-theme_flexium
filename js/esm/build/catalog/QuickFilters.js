import{formatNumber as k,str as l}from"./utils";import{jsx as n,jsxs as h}from"react/jsx-runtime";/**
 * Quick filters (feature "Quick filters"): toggle buttons for frequent searches, in the order chosen by the admin.
 * "My courses" and "Favourites" are only offered to logged in users.
 *
 * @module     theme_flexium/catalog/QuickFilters
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */const q=["mycourses","favourites"],N=i=>{try{const e=JSON.parse(i||"{}");return e&&typeof e=="object"?e:{}}catch{return{}}};function v({keys:i,quick:e,selected:u,loggedin:a,icons:f,onToggle:d,showcount:g,strings:o,labels:p}){const m=N(p),c=i.filter(t=>a||!q.includes(t));return c.length?n("div",{className:"flexium-quickfilters",role:"group","aria-label":l(o,"catalog_quickfilters"),children:c.map(t=>{const r=u.includes(t),s=e.find(b=>b.key===t)?.count;return h("button",{type:"button","aria-pressed":r,className:`flexium-quickfilter${r?" flexium-quickfilter--active":""}`,disabled:!r&&s===0,onClick:()=>d(t),children:[n("i",{className:`${f[t]??"fa fa-filter"} me-1`,"aria-hidden":"true"}),m[t]||l(o,`quick_${t}`),g&&s!==void 0&&n("span",{className:"flexium-quickfilter__count",children:k(s)})]},t)})}):null}export{v as default,N as parseLabels};
