import {getReviews} from "api";
export default function s_SearchClass(){

    // Get all teacher names on the page
    let teachers = $("span[id^='MTG_INSTR']");
    // Extract all the actual teachers
    let teacherNames = teachers.map(v => v.innerHTML).filter(v => v.lowerCase() != "staff");

    // If there are atleast one teacher not named staff
    if(teachers != null && teachers.length > 0){
        getReviews(teacherNames).then(d => {
            teachers.forEach(v => {
                let name = v.innerHTML; // Get the name of the prof
                let data = d.find(obj => obj.queryName.toLowerCase() === name.toLowerCase);
                if(data == null || data.data == null){
                    /**
                     * The teacher doesn't have any data
                     * Do something?
                     * @todo implement suggestions
                     */
                    return;
                } else {
                    v.innerHTML += data.data.quality;
                }
            });
        });

        // This module can resolve the teachers on this page, so return true;
        return true;
    } else
        return false;
}