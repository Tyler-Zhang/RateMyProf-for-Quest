import {getReviews} from "api";
import {search as sSearch} from "sSearchClass";

const iframeID = "ptifrmtgtframe";
let iframe = document.getElementById(iframeID);

// If there is an iframe detected in the browser, redirect to the source of the iframe
if(iframe != null){
    const src = iframe.src;
    window.location = src;
    console.log(src);
} else {
    beginSearch();
}

class searchPipeline{
    constructor(){
        this.steps = [];
    }
    
    use(func){
        this.steps.push(func);
    }

    search(){
        for(let x = 0; x < this.steps.length; x ++){
            console.log("searching");
            let result = this.steps[x].apply(this);
            if(result === true)
                return;
        }

        setTimeout(this.search, 2000);
    }
}

function beginSearch(){
    console.log("Setting up pipeline");
    let sPipeline = new searchPipeline();
    sPipeline.use(sSearch);

    sPipeline.search();
}
