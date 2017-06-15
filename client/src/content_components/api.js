/**
 * Api calls use x-www-form-urlencoded calls to get rid of pre-fetch for better performance
 */
function base(api, body){

    let obj = Object.assign({}, body, {school: "University of Waterloo"});

    let jsonBody = $.param(obj);
    //console.log(jsonBody);

    return fetch("https://rmpfq.tylerzhang.com" + api, {
        method: "POST",
        body: jsonBody,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }, e => {return {success: false, body: e}})
    .then(d => {
        return d.json();
    })
    .catch( e => {
        return {success:false, body: e};
    })
    .then(d => {
        if(d.success === true){
            return d.body;
        } else {
            throw d.body;
        }
    })
}
/**
 * @param {String[]} names The names of the professors
 */
export function getReviews(names){
    return base("/getReviews", {names});
}
/**
 * @param {String} name the name of the professors
 * @param {String} url the url of the rate my prof page
 */
export function suggestReview(name, university, link){
    return base("/suggest", {name, university, link});
}
