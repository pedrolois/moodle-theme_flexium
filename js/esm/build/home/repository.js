import{fetchOne as o}from"@moodle/lms/core/ajax";import{getCatalog as n}from"@moodle/lms/theme_flexium/catalog/repository";/**
 * Web service calls of the home page builder. Course lists reuse the catalogue web service.
 *
 * @module     theme_flexium/home/repository
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */const m=()=>!document.body.classList.contains("notloggedin"),c=()=>o({methodname:"theme_flexium_get_home_data",args:{}},{loginrequired:m()}),l=async e=>{const t=await o({methodname:"theme_flexium_save_home_page",args:{page:JSON.stringify(e)}});return JSON.parse(t)},u=async(e,t,s)=>{const a=["startingsoon","inprogress","mycourses","favourites"].includes(e)?[e]:[],r={latest:"latest",popular:"popularity",startingsoon:"startdate"}[e]??"name";return(await n({search:"",selected:e==="category"&&t?{category:[String(t)]}:{},sort:r,page:0,perpage:0,quick:a,startfrom:"",startto:""},s)).courses};export{c as getHomeData,u as getSectionCourses,l as saveHomePage};
