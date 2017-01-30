import {getReviews} from "api";
import s_SearchClass from "sSearchClass";
import s_ClassSched from "sClassSched";

const refresh = 100;

class searchPipeline{
    constructor(){
        this.steps = [];
        this.pageFound = false;
    }
    
    use(func){
        this.steps.push(func);
    }

    startSearch(){
        this.pageFound = false;
        this.search();
    }

    search(){
        for(let x = 0; x < this.steps.length; x ++){
            let result = this.steps[x].apply(this);
            if(result === true){
                return;
            }
        }
        setTimeout(this.search.bind(this), refresh);
    }
}

const iframeID = "ptifrmtgtframe";
let iframe = document.getElementById(iframeID);
/*
// If there is an iframe detected in the browser, redirect to the source of the iframe
if(iframe != null){
    const src = iframe.src;
    window.location = src;
} else {
    beginSearch();
}*/

if(iframe == null)
    beginSearch();

function beginSearch(){
    let sPipeline = new searchPipeline();
    sPipeline.use(s_SearchClass);
    sPipeline.use(s_ClassSched);

    sPipeline.startSearch();
}
