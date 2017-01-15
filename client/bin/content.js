const iframeID = "ptifrmtgtframe";


//document.getElementById(iframeID).addEventListener("load", onFrameRefresh);
onFrameRefresh();
function onFrameRefresh(){
    let teachers = $("span[id^='MTG_INSTR']");
    console.log(teachers);

    setTimeout(onFrameRefresh, 3000);
}