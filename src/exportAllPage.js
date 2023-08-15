const electron = require("electron");
const {ipcRenderer} = electron;
const fs = require("fs");
const path = require("path");

//variable
let exportTypeRadio = "";

//elements
let allExportType = document.getElementById("allExportType");
let cancelAllExportType = document.getElementById("cancelAllExportType");

//element events
cancelAllExportType.addEventListener("click",()=>{
    ipcRenderer.send("cancelAllExportWindow","cancelAllExportWindow");
});

allExportType.addEventListener("click",()=>{
    
    displayRadioValue();
    console.log(exportTypeRadio)
    ipcRenderer.send("exportAllRadio",exportTypeRadio)
});

//radio button
function displayRadioValue() {
    const radioButtons = document.querySelectorAll('input[name="exportType"]');
    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            selectedSize = radioButton.value;
            break;
        }
    }
    // show the output:
    exportTypeRadio = selectedSize;
}