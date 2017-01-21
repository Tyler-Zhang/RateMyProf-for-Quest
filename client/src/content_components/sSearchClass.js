import {getReviews} from "api";
import {calculateColor, colors} from "util";

const displayed_Headings = [
    {
        name: "Quality", 
        desc: "How generally awesome the professor is", 
        key: "quality", 
        colored: true, 
        colored_inverted: false, 
        offset: 0
    },
    {
        name: "Difficulty",
        desc: "How easy the professor is ",
        key: "easiness",
        colored: true,
        colored_inverted: true,
        offset: 1.5},
    {
        name: "Reviews",
        desc: "How many people have reviewed the professor",
        colored: false,
        key: "count"
    }

    /*{
        name: "Clarity",
        desc: "How clear the professor's lectures are",
        key: "clarity",
        colored: true,
        colored_inverted: false}*/
];

const maxScore = 5;
const cellStyle = {
    height: "50px"
}

export default function s_SearchClass(){
    
    // Get all teacher names on the page
    let teachers = $("span[id^='MTG_INSTR']");
    // If there are atleast one teacher not named staff
    if(teachers == null || teachers.length <= 0){
        return false; // Teachers weren't found using this method, move onto the next method
    }

    $("table[id^='SSR_CLSRCH_MTG']").attr("width", 700);

    let insHeading = $("th[abbr='Instructor']");    // Find all heading called "instructor" so we can append more headings after them
    let headingTemplate = insHeading.first();       // Get a heading template

    /** Generates the headings for each class depending on the displayed_Headings array */
    let [headings, score] = displayed_Headings.reduce((a, b) => {
        let currScore = $("<td>").attr({"rmpquest-type": b.key, style:"background-color:white"}).html("N/A");

        let currHeading = headingTemplate.clone();
        currHeading.attr("width", 60);
        currHeading.children().attr({id: "", href: "javascript: void(0)", title: b.desc}).html(b.name);

        return [a[0].concat(currHeading), a[1].concat(currScore)];
    }, [[], []]);

    // Inserts the headings after the "instructors" heading
    insHeading.after(headings);

    teachers.each((i, e) => {
        /** Hack because of know jquery bug */
        let ele = score.map(v => $(v).clone());
        $(e).closest("td").after(ele);
        $(e).closest("tr").attr("rmpquest-name", e.innerHTML.toLowerCase());
    });

    // Extract all the actual teachers
    let teacherNames = teachers.toArray().map(v => v.innerHTML).filter(v => v.toLowerCase() != "staff");
    
    getReviews(teacherNames).then(d => {
        d.forEach(v => {
            let name = v.queryName;
            let data = v.data;
            if(data == null)    // Nothing was found o
                return;
            /**
             * @todo put in a link to suggest a rmp link
             */

            // Get the row with the professor's information
            let profRow = $(`tr[rmpquest-name='${name}']`);
            console.log(data);
            displayed_Headings.forEach(h => {
                let val = data[h.key];
                let cell = profRow.find(`td[rmpquest-type='${h.key}']`); // Get rating cell

                cell.empty().append(`<b>${val}</b>`).attr(cellStyle); // put in the score, bolded

                /**If we want to color the cell */
                if(h.colored){
                    let workingVal = (h.colored_inverted? maxScore - val : val) + h.offset;
                    let color = calculateColor(workingVal, maxScore);
                    cell.css("background-color", color);
                }
            })            
        })
    });
    // This module can resolve the teachers on this page, so return true;
    return true;
}