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
        offset: 1.5
    },
    {
        name: "Reviews",
        desc: "How many people have reviewed the professor",
        colored: false,
        key: "count"
    }
];

const maxScore = 5;
const cellStyle = {
    height: "50px"
}

const und = "javascript:void(0)";

export default function s_ClassSched(){
    let mainTable = $("#ACE_STDNT_ENRL_SSV2\\$0"); // Main table with most of the content
    // Get all teacher names on the page
    let teachers = mainTable.find("span[id^='DERIVED_CLS_DTL_SSR_INSTR_LONG\\$']");
    // If there are atleast one teacher not named staff
    if(teachers == null || teachers.length <= 0){
        return false; // Teachers weren't found using this method, move onto the next method
    }
    renderPage(mainTable, teachers);
    return true;
}

function renderPage(mainTable, teachers){
    
    /** Enlarge the tables for better readability */
    mainTable.find("table[id^='SSR_DUMMY_RECVW\\$scroll\\$']").attr("width", 700);
    mainTable.find("table[id^='CLASS_MTG_VW\\$scroll\\$']").attr("width", 700);
    
    let insHeading = mainTable.find("th[abbr='Instructor']");    // Find all heading called "instructor" so we can append more headings after them
    let headingTemplate = insHeading.first();       // Get a heading template

    /** Generates the headings for each class depending on the displayed_Headings array */
    let [headings, score] = displayed_Headings.reduce((a, b) => {
        let currScore = $("<td>").attr({"rmpquest-type": b.key, style:"background-color:white; border-style:solid; border-width:1"}).html("N/A");

        let currHeading = headingTemplate.clone();
        currHeading.attr("width", 60);
        currHeading.html(b.name);

        return [a[0].concat(currHeading), a[1].concat(currScore)];
    }, [[], []]);

    // Inserts the headings after the "instructors" heading
    insHeading.after(headings);
    teachers.each((i, e) => {
        /** Hack because of know jquery bug */
        let ele = score.map(v => $(v).clone());
        $(e).closest("td").after(ele);
        let row = $(e).closest("tr").attr({"rmpquest-name": e.innerHTML.toLowerCase(), onmouseover:und, onclick:und, onmouseout:und});
        let clonedChild = row.children().clone();
        row.empty().append(clonedChild);

    });

    // Extract all the actual teachers
    let teacherNames = teachers.toArray().map(v => v.innerHTML).filter((v, i, a) => {
        if(v.toLowerCase() === "staff")
            return false;
        else
            return a.indexOf(v) == i;
    });
    
    getReviews(teacherNames).then(d => {
        d.forEach(v => {
            let name = v.queryName;
            let data = v.data;
            let profRow = mainTable.find(`tr[rmpquest-name="${name}"]`);
            
            let profName = profRow.find("span[id^='DERIVED_CLS_DTL_SSR_INSTR_LONG\\$']");
            if(data == null){    // Nothing was found o
                profName.wrap($("<a>", {
                    title: "Suggest a link for this teacher", 
                    href:"javascript:void(0)"}).click(() => suggestHandler(name)));
                return;
            }
                profName.wrap($("<a>", {
                    title: "Checkout the rate my prof page", 
                    href: `javascript:window.open('${v.data.url}', '_blank')`}));
            
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
            });
        })
    });
}

function suggestHandler(name){
    chrome.runtime.sendMessage({
        name,
        message: "openSuggest"
    }, function(response) {
        if(response == false)
            console.error("Couldn't open the webpage");
    });
}
