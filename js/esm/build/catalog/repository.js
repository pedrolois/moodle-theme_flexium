import{fetchMany as l,fetchOne as n}from"@moodle/lms/core/ajax";import _ from"@moodle/lms/core/config";import{dayToTimestamp as c}from"./utils";/*
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
 * Data access for the course catalogue: the only module that calls web services.
 *
 * @module     theme_flexium/catalog/repository
 * @copyright  2026 Pedro Lois {@link https://github.com/pedrolois}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */const d=()=>!document.body.classList.contains("notloggedin"),w=async(e,a,t,o)=>{const[s,r,m,g]=await l([{methodname:"theme_flexium_save_filter_layout",args:{layout:e}},{methodname:"theme_flexium_save_card_layout",args:{...a}},{methodname:"theme_flexium_save_catalog_options",args:{...t}},{methodname:"theme_flexium_save_catalog_features",args:{features:Object.entries(o).map(([i,u])=>({name:i,value:u}))}}]),p={};return g.forEach(i=>{p[i.name]=i.value}),[s,r,m,p]},y=async(e,a)=>{if(a.maxbytes>0&&e.size>a.maxbytes)throw new Error(`${e.name}: > ${Math.round(a.maxbytes/1048576)} MB`);const t=new FormData;t.append("repo_upload_file",e),t.append("repo_id",String(a.repoid)),t.append("itemid",String(a.draftitemid)),t.append("ctx_id",String(a.contextid)),t.append("sesskey",_.sesskey),t.append("savepath","/"),t.append("title",e.name),t.append("overwrite","1"),t.append("accepted_types[]",".jpg"),t.append("accepted_types[]",".jpeg"),t.append("accepted_types[]",".png"),t.append("accepted_types[]",".gif"),t.append("accepted_types[]",".webp"),t.append("accepted_types[]",".svg");const o=await fetch(a.url,{method:"POST",body:t,credentials:"same-origin"}),s=await o.json();if(s.error||!s.file)throw new Error(s.error??o.statusText);return(await n({methodname:"theme_flexium_save_default_image",args:{draftitemid:a.draftitemid,filename:s.file}})).url},x=e=>n({methodname:"theme_flexium_get_course_preview",args:{courseid:e}},{loginrequired:d()}),C=(e,a)=>n({methodname:"core_course_set_favourite_courses",args:{courses:[{id:e,favourite:a}]}}),P=(e,a)=>n({methodname:"core_user_set_user_preferences",args:{preferences:[{name:e,value:a,userid:0}]}}),b=(e,a,t="")=>{const o=Object.entries(e.selected).filter(([,r])=>r.length>0).map(([r,m])=>({source:r,values:m})),s=()=>n({methodname:"theme_flexium_get_catalog",args:{search:e.search,filters:o,sort:e.sort,page:e.page,perpage:a,quick:e.quick,startfrom:c(e.startfrom),startto:c(e.startto,!0),preview:t}},{loginrequired:d()});return s().catch(async()=>(await new Promise(r=>setTimeout(r,1500)),s()))};export{b as getCatalog,x as getCoursePreview,w as saveCatalogLayout,C as setFavourite,P as setPreference,y as uploadDefaultImage};
