import {getReviews} from "api";


const displayed_Headings = [
    {name: "Quality", desc: "How generally awesome the professor is", key: "quality"},
    {name: "Easiness", desc: "How easy the professor is ", key: "easiness"},
    {name: "Clarity", desc: "How clear the professor's lectures are", key: "clarity"}
];

export default function s_SearchClass(){
    
    // Get all teacher names on the page
    let teachers = $("span[id^='MTG_INSTR']");
    // If there are atleast one teacher not named staff
    if(teachers == null || teachers.length <= 0){
        return false; // Teachers weren't found using this method, move onto the next method
    }

    let insHeading = $("th[abbr='Instructor']");    // Find all heading called "instructor" so we can append more headings after them
    let headingTemplate = insHeading.first();       // Get a heading template

    /** Generates the headings for each class depending on the displayed_Headings array */
    let [headings, score] = displayed_Headings.reduce((a, b) => {
        let currScore = $("<td>").attr({"rmpquest": b.key, style:"background-color:white"}).html("N/A");

        let currHeading = headingTemplate.clone();
        currHeading.children().attr({id: "", href: "javascript: void(0)", title: b.desc}).html(b.name);

        return [a[0].concat(currHeading), a[1].concat(currScore)];
    }, [[], []]);

    // Inserts the headings after the "instructors" heading
    insHeading.after(headings);
    let $score = $(score);

    teachers.each((i, e) => {
        console.log(e.value);
        let ele = $score.clone();//.attr("name", e.value);
        //console.log(ele);
        $(e).closest("td").after(ele);
    });

    // Extract all the actual teachers
    let teacherNames = teachers.map(v => v.innerHTML).filter(v => v.toLowerCase() != "staff");
    
    getReviews(teacherNames).then(d => {
        teachers.forEach(v => {
            //console.table(d);
            let name = v.innerHTML; // Get the name of the prof
            let data = d.find(obj => obj.queryName.toLowerCase() === name.toLowerCase());
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
}