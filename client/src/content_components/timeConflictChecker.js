
export class ConflictChecker{
    constructor(){
        this.times = [];
    }

    /**
     * @param {String} course Course code
     * @param {Integer} start time in minutes since start of the day where 0 <= Start <= 24 * 60
     * @param {Integer} end time in minutes since start of the day
     * @param {String} day in format MWF, etc
     */
    add(course, day, start, end){
        // Just incase there ever is a midnight course, so that the code doesn't fail
        let dateObj = {course, start, end: end <= start? 24* 60 + end: end, day};
        this.times.push(dateObj);
    }

    /**
     * @param {Integer} start time in minutes since the start of the day
     * @param {Integer} end
     * @param {String} day
     */
    check(day, start, end){
        let totalConflicts = []; // Array to account for the overrides;

        for(let x = 0; x < this.times.length; x++){
            let currEle = this.times[x];

            if(!day.some(v => currEle.day.includes(v)))
                continue;
            if(start <= currEle.end && end >= currEle.start)
                totalConflicts.push(currEle.course);
        }
        
        return totalConflicts;

    }
}


const suffix = ["", "- midterm", "- final"]
/**
 * @param {Integer} idx the nth appearence of that course
 * @return {String}
 */
export function getSuffix(idx){
    if(idx > suffix.length)
        return "";
    else
        return suffix[idx];
}


const hourMinuteRegex = /(\d{1,2}):(\d{1,2})(AM|PM)/;
/**
 * @param {String} time in format 12:56pm
 */
export function timeToMinute(time){
    let result = time.match(hourMinuteRegex);
    if(result == null || result.length != 4){
        throw new Error("Invalid time format " + time);
    }

    let totalMinutes = 0;
    let hour = Number(result[1]);
    totalMinutes += ((hour == 12)? 0 : hour) * 60;
    totalMinutes += Number(result[2]);
    totalMinutes += (result[3] == "PM")? 12 * 60 : 0;

    return totalMinutes;
}



const timeRegex = /(\w+) (.+) - (.+)/;
/**
 * @param {String} sched in format TWFSu 10:45pm - 11:12pm
 * @returns {String[]}
 */
export function parseScheduleFormat(sched){
    let parsedTimeResult = sched.match(timeRegex);

    if(parsedTimeResult == null || parsedTimeResult.length != 4){
        throw new error("Invalid schedule format " + sched);
    }
    let dates = parseDate(parsedTimeResult[1]);
    let startTime = timeToMinute(parsedTimeResult[2]);
    let endTime = timeToMinute(parsedTimeResult[3]);

    return [dates, startTime, endTime];
}


const dateRegExp = /([A-Z][a-z]?)/g;

/**
 * Parses the days of the week format into seperate elements in a array eg MWFSSu
 * @param {String} date in format of MWFSu, etc
 * @returns {String[]} of the parsed dates
 */
 export function parseDate(date){
    let rtn = date.match(dateRegExp);
    if(rtn == null)
        return [];
    else
        return rtn;
}