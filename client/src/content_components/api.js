function base(api, body){

    let obj = Object.assign({}, body, {school: "University of Waterloo"});

    let jsonBody = JSON.stringify(obj);
    //console.log(jsonBody);

    return fetch("https://tylerzhang.com:8080" + api, {
        method: "POST",
        body: jsonBody,
        headers: {
            "Content-Type": "application/json; charset=utf-8"
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