const electron = require("electron");
const {ipcRenderer} = electron;
const fs = require("fs");
const path = require("path");

//elements
let workingDirPath = document.getElementById("workingDirPath");
let fileNameWorkingDir = document.getElementById("fileNameWorkingDir");
let mosdepthPath = document.getElementById("mosdepthPath");
let fileNameMosdepth = document.getElementById("fileNameMosdepth");
let samtoolsPath = document.getElementById("samtoolsPath");
let fileNameSamtools = document.getElementById("fileNameSamtools");
let annovarPath = document.getElementById("annovarPath");
let fileNameAnnovar = document.getElementById("fileNameAnnovar");
let savePathBtn = document.getElementById("savePathBtn");
let addCustomBtn = document.getElementById("addCustomBtn");
let addAnnovarBtn = document.getElementById("addAnnovarBtn");
let customAnnotFile = document.getElementById("customAnnotFile");
let customAnnotFileRemove = document.getElementById("customAnnotFileRemove")
let annovarAnnotFile = document.getElementById("annovarAnnotFile");
let annovarAnnotFileRemove = document.getElementById("annovarAnnotFileRemove");
//element events
workingDirPath.addEventListener("click", ()=>{
    ipcRenderer.send("workingDirPath","workingDirPath");
});

mosdepthPath.addEventListener("click",()=>{
    ipcRenderer.send("mosdepthPath","mosdepthPath");
});

samtoolsPath.addEventListener("click",()=>{
    ipcRenderer.send("samtoolsPath","samtoolsPath");
});

annovarPath.addEventListener("click",()=>{
    ipcRenderer.send("annovarPath","annovarPath");
});

savePathBtn.addEventListener("click",()=>{
    ipcRenderer.send("saveConfig","saveConfig");
})

firstPageBtn.addEventListener("click",()=>{
    ipcRenderer.send("loadDB","loadDB");
});

secondPageBtn.addEventListener("click",()=>{
    ipcRenderer.send("loadAnnotDB","loadAnnotDB");
});

addCustomBtn.addEventListener("click",()=>{
    ipcRenderer.send("addCustomFile","addCustomFile");
});

addAnnovarBtn.addEventListener("click",()=>{
    ipcRenderer.send("addAnnovarFile","addAnnovarFile");
})
customAnnotFileRemove.addEventListener("click",removeFunction);
annovarAnnotFileRemove.addEventListener("click",removeFunction);


//ipcRenderer işlemleri
ipcRenderer.on("workingDirPathName",(err,data)=>{
    fileNameWorkingDir.innerHTML = data;
});

ipcRenderer.on("mosdepthPathName",(err,data)=>{
    fileNameMosdepth.innerHTML = data;
});

ipcRenderer.on("samtoolsPathName",(err,data)=>{
    fileNameSamtools.innerHTML = data;
});

ipcRenderer.on("annovarPathName",(err,data)=>{
    fileNameAnnovar.innerHTML = data;
});

ipcRenderer.on("loadConfig",(err,data)=>{
    console.log(data[0].path)

    data.forEach(element => {
        if(element.id == "workingDirPath"){
            fileNameWorkingDir.innerHTML = element.path;
        }else if(element.id == "mosdepthPath"){
            fileNameMosdepth.innerHTML = element.path;
        }else if(element.id == "samtoolsPath"){
            fileNameSamtools.innerHTML = element.path;
        }else if(element.id == "annovarPath"){
            fileNameAnnovar.innerHTML = element.path;
        }
    });
})

ipcRenderer.on("customAnnotFile",(err,data)=>{
    

    customAnnotFile.innerHTML = data.map(file =>
        `<tr>
        <td>
            ${file.fileName+".bed"}
        </td>
        <td>
            ${file.humanGenome}
        </td>
        <td style="display: flex; justify-content: right;">
            <button class="btn remove-btn" style="width: 120px; margin-top:2px; color: white;" type="button" id="addCustomBtn"><ion-icon class="remove-icon" name="trash-sharp"></ion-icon></button>
        </td>
    </tr>`
    ).join('')
    
})

ipcRenderer.on("annovarAnnotFile",(err,data)=>{
    

    annovarAnnotFile.innerHTML = data.map(file =>
        `<tr>
        <td>
            ${file.annovarFileName}
        </td>
        <td>
            ${file.annovarHumanGenome}
        </td>
        <td style="display: flex; justify-content: right;">
            <button class="btn remove-btn" style="width: 120px; margin-top:2px; color: white;" type="button" id="addCustomBtn"><ion-icon class="remove-icon" name="trash-sharp"></ion-icon></button>
        </td>
    </tr>`
    ).join('')
    
})


//elements
function removeFunction(e) {
    deneme = e.target.parentElement.parentElement.parentElement
    console.log(e.target)
    if (e.target.className === "remove-icon md hydrated") {
        console.log("e.target",e.target);
        deneme.remove()
        collection = deneme.children
        console.log("dosya ismi",collection[0].innerText.trim())
        ipcRenderer.send("key|remove", collection[0].innerText.trim());
    }else if(e.target.className === "btn remove-btn"){
        deneme.remove()
        collection = deneme.children
        console.log("dosya ismi",collection[0].children[0].innerText.trim());
        ipcRenderer.send("key|remove", collection[0].children[0].innerText.trim());
    }
}