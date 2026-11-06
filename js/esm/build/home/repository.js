import{fetchOne as o}from"@moodle/lms/core/ajax";import{getCatalog as n}from"@moodle/lms/theme_flexium/catalog/repository";/*
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
 *//**
 * Web service calls of the home page builder. Course lists reuse the catalogue web service.
 *
 * @module     theme_flexium/home/repository
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */const m=()=>!document.body.classList.contains("notloggedin"),c=()=>o({methodname:"theme_flexium_get_home_data",args:{}},{loginrequired:m()}),l=async e=>{const t=await o({methodname:"theme_flexium_save_home_page",args:{page:JSON.stringify(e)}});return JSON.parse(t)},u=async(e,t,s)=>{const a=["startingsoon","inprogress","mycourses","favourites"].includes(e)?[e]:[],r={latest:"latest",popular:"popularity",startingsoon:"startdate"}[e]??"name";return(await n({search:"",selected:e==="category"&&t?{category:[String(t)]}:{},sort:r,page:0,perpage:0,quick:a,startfrom:"",startto:""},s)).courses};export{c as getHomeData,u as getSectionCourses,l as saveHomePage};
