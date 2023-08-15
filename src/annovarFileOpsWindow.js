const electron = require("electron");
const {ipcRenderer} = electron;
const fs = require("fs");
const path = require("path");

//variables
let checkBoxesArray = [];
let annotFiles = ["clinvar_hg19","cosmic70_hg19","icgc28_hg19","nci60_hg19"];
let annotFiles2 = ["clinvar_hg38","cosmic70_hg38","icgc28_hg38","nci60_hg38"];
let annovarFileOpt = [{
    humanGenome: "",
    dbList: [],
    annotType: "",
}]
let processPath = path.dirname(process.execPath);
console.log(processPath)
//elements
let cancelAnnovarFilter = document.getElementById("cancelAnnovarFilter");
let submitAnnovarFilter = document.getElementById("submitAnnovarFilter");
let cosmicCheck = document.getElementsByClassName("cosmic");
let clinvarCheck = document.getElementsByClassName("clinvar");
let icgcCheck = document.getElementsByClassName("cosmic");
let nciCheck = document.getElementsByClassName("clinvar");
let spinLoadingAnnovar = document.getElementById("spinLoadingAnnovar");

displayRadioValue();

//element events
cancelAnnovarFilter.addEventListener("click",()=>{
    ipcRenderer.send("cancelAnnovarWindow","cancelAnnovarWindow");
});

submitAnnovarFilter.addEventListener("click",()=>{
    displayRadioValue();
    getSelectedValue();
    annovarFileOpt[0].annotType = "Annovar"
    ipcRenderer.send("annovarAnnotFileObj",annovarFileOpt);
    console.log(processPath)
});

document.getElementById("hg38").addEventListener("click",()=>{
    displayRadioValue();
})

document.getElementById("hg19").addEventListener("click",()=>{
    displayRadioValue();
})

//ipcRenderer
ipcRenderer.on("annovarFileOptions",(err,data)=>{
    cosmicCheck[0].disabled = true;
    clinvarCheck[0].disabled = true;
})

ipcRenderer.on("annovarSpin",(err,data)=>{
    spinLoadingAnnovar.style.display = "block";
    cancelAnnovarFilter.disabled = true;
})

ipcRenderer.on("annovarSpinOff",(err,data)=>{
    spinLoadingAnnovar.style.display = "none";
    cancelAnnovarFilter.disabled = false;
})

ipcRenderer.on("clicked",(err,data)=>{
    console.log(data)
})

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
    annovarFileOpt[0].humanGenome = selectedSize;
    
}

//get checkbox value for disease
function getSelectedValue() {
    let checkBoxes = document.querySelectorAll('input[id="defaultCheck2"]');
    for (let checkBox of checkBoxes) {
        if (checkBox.checked) {
            if(!checkBoxesArray.includes(checkBox.value)){
                checkBoxesArray.push(checkBox.value);
            }
        }

    }
    annovarFileOpt[0].dbList = checkBoxesArray;
}
