import {suggestReview} from "api";


(function(){
    let data  = (function(a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p=a[i].split('=', 2);
            if (p.length == 1)
                b[p[0]] = "";
            else
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));

    const profString = `Suggest a link for ${capitalize(data.name).bold()}`;
    const universityString = `At the ${capitalize(data.university).bold()}`;

    $("#profName").html(profString);
    $("#universityName").html(universityString);
    
    $("#submit").click(()=> {
        let link = $("#url").val();
        let regex = /https:\/\/www\.ratemyprofessors\.com\/ShowRatings\.jsp\?tid=\d+/;

        if(!regex.test(link))
            alert("This url is not a valid rate my prof url");
        else {
            suggestReview(data.name, data.university, link)
            .then( d => {
                alert("Success!")
            },
            e => {
                alert("Your submission couldn't be completed. Please try again");
            });
        }
    })

})();

function capitalize(string){
    return string.replace(/\b\w/g, l => l.toUpperCase());
}