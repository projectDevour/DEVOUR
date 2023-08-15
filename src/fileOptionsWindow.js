const electron = require("electron");
const {ipcRenderer} = electron;
const fs = require("fs");
const path = require("path");

let fileOptions = [{
    humanGenome: "",
    fileName: "",
    oldFileName: "",
    filePath: "",
    annotType: "",
}]

//elements
let cancelFilter = document.getElementById("cancelFilter");
let submitFilter = document.getElementById("submitFilter");
let customFileName = document.getElementById("customFileName");
let customFileDir = document.getElementById("customFileDir");
let customFilePath = document.getElementById("customFilePath");
let spinLoadingCustom = document.getElementById("spinLoadingCustom");
let alertUnderScore = document.getElementById("alertUnderScore");
//element events
cancelFilter.addEventListener("click",()=>{
    ipcRenderer.send("cancelWindow","cancelWindow");
});

submitFilter.addEventListener("click",()=>{
    displayRadioValue();
    console.log("file",customFileName.value)
    if(String(customFileName.value).includes("_")){
        alertUnderScore.style.display = "block";
    }else{
        fileOptions[0].fileName = customFileName.value;
        editFile(fileOptions[0].filePath);
        fileOptions[0].annotType = "Custom"
        ipcRenderer.send("customAnnotFileObj",fileOptions);
    }
    
});

customFileDir.addEventListener("click",()=>{
    ipcRenderer.send("customFileUpload","customFileUpload");
});

//ipcRenderer işlemleri
ipcRenderer.on("customFileName",(err,data)=>{
    customFilePath.innerHTML = data;
    fileOptions[0].filePath = data;
    
});

ipcRenderer.on("customSpin",(err,data)=>{
    spinLoadingCustom.style.display = "block";
    cancelFilter.disabled = true;
});

ipcRenderer.on("customSpinOff",(err,data)=>{
    spinLoadingCustom.style.display = "none";
    cancelFilter.disabled = false;
});


//radio button
function displayRadioValue() {
    const radioButtons = document.querySelectorAll('input[name="humanGenome"]');
    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            selectedSize = radioButton.value;
            break;
        }
    }
    // show the output:
    console.log(selectedSize)
    fileOptions[0].humanGenome = selectedSize;
}

function editFile(data){
    let oldFile = data.split("/");
    oldFileName = oldFile[oldFile.length - 1];
    fileOptions[0].oldFileName = oldFileName;
}