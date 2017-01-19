import {getReviews} from "api";
export default function s_SearchClass(){

    // Get all teacher names on the page
    let teachers = $("span[id^='MTG_INSTR']").toArray();
    // Extract all the actual teachers
    let teacherNames = teachers.map(v => v.innerHTML).filter(v => v.toLowerCase() != "staff");
    console.log(teacherNames);
    // If there are atleast one teacher not named staff
    if(teachers != null && teachers.length > 0){
        getReviews(teacherNames).then(d => {
            teachers.forEach(v => {
                console.table(d);
                let name = v.innerHTML; // Get the name of the prof
                let data = d.find(obj => obj.queryName.toLowerCase() === name.toLowerCase());
                console.log(name);
                console.log(data);
                if(data == null || data.data == null){
                    /**
                     * The teacher doesn't have any data
                     * Do something?
                     * @todo implement suggestions
                     */
                    return;
                } else {
                    v.innerHTML += `<b> ${data.data.quality} </b>`;
                }
            });
        });
        // This module can resolve the teachers on this page, so return true;
        return true;
    } else
        return false;
}