const electron = require("electron");
const {ipcRenderer} = electron;
const fs = require("fs");
const path = require("path");

//variable
let exportTypeRadio = "";

//elements
let selectExportType = document.getElementById("selectExportType");
let cancelExportType = document.getElementById("cancelExportType");

//element events
cancelExportType.addEventListener("click",()=>{
    ipcRenderer.send("cancelExportWindow","cancelExportWindow");
});

selectExportType.addEventListener("click",()=>{
    displayRadioValue();
    ipcRenderer.send("exportRadio",exportTypeRadio)
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