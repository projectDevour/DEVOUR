const electron = require("electron");
const {ipcRenderer} = electron;
const fs = require("fs");
const path = require("path");
const reader = require('xlsx');


//global variable
let checkBoxesArray = [];
let annovarFileOpt = [{
    selectedSize: "",
    dbList: [],
}];
let resultFiles = [{
    radioType: "",
}];
let formStepsNum = 0;
let formStepsArray = [];
let pathName = "";
//get elements
let samSelectBtn = document.getElementById("samSelectBtn");
let fileNameSam = document.getElementById("fileNameSam");
let captureSelectBtn = document.getElementById("captureSelectBtn")
let slider = document.getElementById("myRange");
let processBtn = document.getElementById("processBtn");
let annotationSources = document.getElementById("annotationSources");
let overlapBtn = document.getElementById("overlapBtn");
let startBtn = document.getElementById("startBtn");
let appPage = document.getElementById("appPage");
let startPage = document.getElementById("startPage");
let exportSelectedBtn = document.getElementById("exportSelectedBtn");
let clinvar = document.getElementById("clinvar2");
let cosmic = document.getElementById("cosmic2");
let icgc = document.getElementById("icgc2");
let nci = document.getElementById("nci2");
let custom = document.getElementById("custom2");
let exportAllBtn = document.getElementById("exportAllBtn");
let spinLoadingSamtoBam = document.getElementById("spinLoadingSamtoBam");
let spinLoadingOverlap = document.getElementById("spinLoadingOverlap");
let exportSelectedSpin = document.getElementById("exportSelectedSpin");
let exportAllSpin = document.getElementById("exportAllSpin");
const progress = document.getElementById("progress");
const formSteps = document.querySelectorAll(".form-step");
const progressSteps = document.querySelectorAll(".progress-step");
const nextPrevBtn = document.getElementById("nextPrevBtn");
let humanGenomeSpan = document.getElementById("humanGenomeSpan");
let tabName = document.getElementById("tab-name");
let restartBtn = document.getElementById("restartBtn");



displayRadioValue();
getSelectedResultValue();

//threshold slider
slider.oninput = function () {
}
slider.addEventListener("click", () => {
    ipcRenderer.send("threshold", slider.value);
});

//button işlevleri
samSelectBtn.addEventListener("click",()=>{
    ipcRenderer.send("samFileUpload","samFileUpload");
});

captureSelectBtn.addEventListener("click",()=>{
    ipcRenderer.send("captureFileUpload","captureFileUpload");
});

processBtn.addEventListener("click",()=>{
    displayRadioValue();
    ipcRenderer.send("submitSamFile",annovarFileOpt);
});

overlapBtn.addEventListener("click",()=>{
    getSelectedValue();
    ipcRenderer.send("calculateOverlap",annovarFileOpt);
});

//sayfa değişim işlemleri


//her adımı arraye atıyorum index olarak kullanabilmek için
formSteps.forEach((formStep) => {
    formStepsArray.push(formStep);
});





startBtn.addEventListener("click",()=>{
    startPage.style.display = "none";
    appPage.style.display = "block"
})

exportSelectedBtn.addEventListener("click",()=>{
    getSelectedResultValue();
    ipcRenderer.send("exportCheckedFiles",resultFiles);
})

exportAllBtn.addEventListener("click", ()=>{
    ipcRenderer.send("exportAllFiles","exportAllFiles");
})

tabName.addEventListener("click",previewFunction);

restartBtn.addEventListener("click",()=>{
    ipcRenderer.send("restartPage","restartPage");
})

//ipcRenderer.on işlemleri
ipcRenderer.on("fileNameSam",(err,data)=>{
    fileNameSam.innerHTML = data;
})

ipcRenderer.on("fileNameCapture",(err,data)=>{
    fileNameCapture.innerHTML = data;
})

ipcRenderer.on("annotationSources",(err,data)=>{
    

    annotationSources.innerHTML = data.map(file =>
        ` <tr>
        <td style="display: flex; justify-content: left; padding-bottom: 0px; padding-top:0px; border:none;">
            <input class="form-check-input cosmic" type="checkbox" value=${file.annotSource.fileName}  id="defaultCheck2"
                    style="margin-right: 5px; margin-left: 20px;">
                    <label class="form-check-label" for="defaultCheck2" style="margin-top: 4px;">
                    ${file.annotSource.fileName}
                    </label>
        </td>
        <td style="padding-bottom: 0px; padding-top:0px; border:none;">
        ${file.annotSource.annotType}
        </td>
    </tr>`
    ).join('')
    humanGenomeSpan.innerHTML = ("(Human Genome: " + data[0].humanGenomeVersion + ")")
})

ipcRenderer.on("showResultFile",(err,data)=>{
    let fileTabName = [];
    pathName = data;
    fs.readdir(data, (err, files) => {
        files.forEach((file) => {
            fileTabName.push(file)
        });

        
        tabName.innerHTML = fileTabName.map(file =>
            `<button class="tablinks" type="button" id=${file.split("_")[1]}>
            <div style="display: flex;" class="first-div">
                <input class="form-check-input" type="checkbox" value=${file} id="defaultCheck2"
                style="margin-right: 5px; margin-left: 20px;">
                <label class="form-check-label" for="defaultCheck2" style="margin-top: 5px; margin-left: 10px;">
                    ${file.split("_")[1]}
                </label>
            </div>
        </button>`
        ).join('')
        
    
    });
})

ipcRenderer.on("activateNextBtn",(err,data)=>{
    spinLoadingSamtoBam.style.display = "none";
    samSelectBtn.disabled = false;
    captureSelectBtn.disabled = false;
    slider.disabled = false;
    document.getElementById("hg38").disabled = false;
    document.getElementById("hg19").disabled = false;
    nextPage()
})

ipcRenderer.on("samtobamSpin", (err,data)=>{
    if(data){
        spinLoadingSamtoBam.style.display = "block";
        processBtn.disabled = true;
        processBtn.innerText = "Processing"
        samSelectBtn.disabled = true;
        captureSelectBtn.disabled = true;
        slider.disabled = true;
        document.getElementById("hg38").disabled = true;
        document.getElementById("hg19").disabled = true;
    }
})

ipcRenderer.on("overlapsSpin", (err, data) => {
    if(data){
        spinLoadingOverlap.style.display = "block";
        overlapBtn.disabled = true;
        overlapBtn.innerText = "Processing"
        
    }
})

ipcRenderer.on("overlapsSpinOf", (err, data) => {
    if(data){
        spinLoadingOverlap.style.display = "none";
    
        nextPage()
        ipcRenderer.send("resultPage","resultPage")
    }
})

ipcRenderer.on("exportSpin", (err,data)=>{
    if(data){
        exportSelectedSpin.style.display = "block";
        exportAllBtn.disabled = true;
        exportSelectedBtn.disabled = true;
    }
})

ipcRenderer.on("exportSpinOf", (err,data)=>{
    if(data){
        exportSelectedSpin.style.display = "none";
        exportAllBtn.disabled = false;
        exportSelectedBtn.disabled = false;
        
    }
})

ipcRenderer.on("previewExcel",(err,data)=>{
    
    let dataName = data.split("/")
    document.getElementById("previewMessage").style.display="block";
    document.getElementById("fileNamePreview").innerText = dataName[dataName.length - 1].split("_")[1]
    console.log(dataName[dataName.length - 1].split("_")[1])
    tableExcel(dataName[dataName.length - 1].split("_")[1],dataName[dataName.length - 1])
})

ipcRenderer.on("exportRadio",(err,data)=>{
    resultFiles[0].radioType = data;
    ipcRenderer.send("exportSelectedWithRadio",resultFiles);
})

ipcRenderer.on("exportAllRadio",(err,data)=>{
    resultFiles[0].radioType = data;
    ipcRenderer.send("exportAllWithRadio",resultFiles);
})



//functions

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
    annovarFileOpt[0].selectedSize = selectedSize;
    
}

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

function getSelectedResultValue() {
    
    let checkBoxes = document.querySelectorAll('input[id="defaultCheck2"]');
    for (let checkBox of checkBoxes) {
        if (checkBox.checked) {
            if(!checkBoxesArray.includes(checkBox.value)){
                checkBoxesArray.push(checkBox.value);
            }
        }
    }
    
    resultFiles[0].fileNames = checkBoxesArray;
    
}


function previewFunction(e){
    deneme = e.target
    
    if (e.target.className === "first-div") {
        collection = deneme.children
        console.log(collection[1].innerText)
        ipcRenderer.send("key|preview",collection[1].innerText)
        document.getElementById(collection[1].innerText);
    }else if(e.target.className === "tablinks"){
        collection = deneme.children
        console.log(collection[0].children[1].innerText)
        ipcRenderer.send("key|preview",collection[0].children[1].innerText)
    }else if(e.target.className === "form-check-label"){
        collection = deneme
        console.log(collection.innerText)
        ipcRenderer.send("key|preview",collection.innerText)
    }
}

//stepleri belirlememi sağlayan fonksiyon.

function updateFormSteps() {
    formSteps.forEach((formStep) => {
        formStep.classList.contains("form-step-active") &&
        formStep.classList.remove("form-step-active");
});

    formSteps[formStepsNum].classList.add("form-step-active");
}

//progressbarı ilerletmemi sağlıyor.
function updateProgressBar() {
    progressSteps.forEach((progressStep, idx) => {
        if (idx < formStepsNum + 1) {
        progressStep.classList.add("progress-step-active");
    } else {
        progressStep.classList.remove("progress-step-active");
    }
});
    const progressActive = document.querySelectorAll(".progress-step-active");

    progress.style.width =
    ((progressActive.length - 1) / (progressSteps.length - 1)) * 100 + "%";
}


function nextPage(){
        formStepsNum++;
        updateFormSteps();
        updateProgressBar();
}


    
function tableExcel(datas,fullDatas){
        // Reading our test file
        
        let paths = pathName.split("/")
        let strippedPath = paths.slice(0, paths.length-2).join("/");
        console.log(strippedPath)
        let resultPath = strippedPath + "/.tempResults2/";
        //datas = datas.split(".")[0];
        let xlsxPath = resultPath.concat(datas,".xlsx");
        let table = document.getElementById("table-body");
        const file = reader.readFile(xlsxPath)
        
        let data = []
        let first1000 = []
        const sheets = file.SheetNames
        
        for (let i = 0; i < sheets.length; i++) {
            const temp = reader.utils.sheet_to_json(
                file.Sheets[file.SheetNames[i]])
            temp.forEach((res) => {
                console.log("satur",res)
                data.push(res)
            })
        }
        
        if(data.length > 10){
            first1000 = data.slice(1,11);
        
    
        if(first1000.length <= 4){
            document.getElementById("Paris").style.display = "block";
            document.getElementById("fileNameForEmptyOverlap").innerText = datas;
            document.getElementById("London").style.display = "none";
        }else{
            document.getElementById("London").style.display = "block"
            document.getElementById("Paris").style.display = "none";
            table.innerHTML = first1000.map(row =>
                `<tr>
                            <td>${row.chr}</td>
                            <td>${row.start}</td>
                            <td>${row.end}</td>
                            <td>${row.depth}</td>
                            <td>${row.annotationStart}</td>
                            <td>${row.annotationEnd}</td>
                            <td>${row.annotationInfo}</td>
                        </tr>`
            ).join('')
        
        }
    }else{
        first1000 = data.slice(1,(((data.length-3)/2) + 1))
        if(first1000.length == 0 ){
            document.getElementById("Paris").style.display = "block";
            document.getElementById("fileNameForEmptyOverlap").innerText = datas;
            document.getElementById("London").style.display = "none";
        }else{
            document.getElementById("London").style.display = "block"
            document.getElementById("Paris").style.display = "none";
            table.innerHTML = first1000.map(row =>
                `<tr>
                            <td>${row.chr}</td>
                            <td>${row.start}</td>
                            <td>${row.end}</td>
                            <td>${row.depth}</td>
                            <td>${row.annotationStart}</td>
                            <td>${row.annotationEnd}</td>
                            <td>${row.annotationInfo}</td>
                        </tr>`
            ).join('')
        
        }
    }   
        }   