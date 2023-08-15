const electron = require("electron");
const url = require("url");
const path = require("path");
const {ipcMain,app,BrowserWindow,dialog,Menu} = electron;
const fs = require("fs")
var openDatabase = require('websql');
const { PythonShell } = require("python-shell");



//yeni bir database oluşturuyorum. ayarları kayıt edebilmek için
var gfgDb = openDatabase('mydb10', '1.0', 'this is a client side database', 2 * 1024 * 1024);

//load appConfigDB
gfgDb.transaction(function (tx) { 
    tx.executeSql('SELECT * FROM appConfig3', [], function (tx, results) { 
        var len = results.rows.length, i; 
        for (i = 0; i < len; i++) { 
            pathList[i].path = results.rows.item(i).path
            
        } 
        createVariable(pathList);
        
    }, null); 
    
});




//load customAnnotDB
gfgDb.transaction(function (tx) { 
    tx.executeSql('SELECT * FROM customAnnotation5', [], function (tx, results) { 
        var len = results.rows.length, i; 
        for (i = 0; i < len; i++) { 
            customAnnotationFile.push({fileName:results.rows.item(i).fileName, humanGenome: results.rows.item(i).humanGenome})
            
        } 
    }, null); 
    
});

//load annovarAnnotDB
gfgDb.transaction(function (tx) { 
    tx.executeSql('SELECT * FROM annovarAnnotation5', [], function (tx, results) { 
        var len = results.rows.length, i; 
        for (i = 0; i < len; i++) { 
            annovarAnnotationFile.push({annovarFileName:results.rows.item(i).annovarFileName, annovarHumanGenome: results.rows.item(i).annovarHumanGenome})
            
        } 
    }, null); 
});


//global variables
let processPath = path.dirname(process.execPath);
let scriptPath = path.join(processPath,"/resources/scripts/");
let mainWindow,configWindow,fileWindow,fileAnnovarWindow, exportType, exportAllType;
let filePath = "";
let userFolderPath = "";
let threshold = "5";
let customAnnotationFile = [];
let annovarAnnotationFile = [];
let annotationSources = [];
let annotFileNoExt = [];
let pathList = [{id:"workingDirPath",path:""},
                {id:"mosdepthPath",path:""},
                {id:"samtoolsPath",path:""},
                {id:"annovarPath",path:""}];
let paths = [];
let workingDir = "";

//function variables
const filterSam = [
    { name: "*", extensions: ["sam", "bam"] },
    { name: "Sam files", extensions: ["sam"] },
    { name: "Bam files", extensions: ["bam"] },
];

const filterCapture = [
    { name: "*", extensions: ["bed", "BED"] },
    { name: "Bed files", extensions: ["bed", "BED"] },
];

//scripts options
let optionsForCustomAnnotation = {
    mode: "text",
    pythonOptions: ["-u"],
    scriptPath: scriptPath,
    args: ["","",workingDir],
};

let optionsForAnnovarAnnotation = {
    mode: "text",
    pythonOptions: ["-u"],
    scriptPath: scriptPath,
    args: ["hg19",[],workingDir],
};


let optionsForSamtobam = {
    mode: "text",
    pythonOptions: ["-u"],
    scriptPath: scriptPath,
    args: [workingDir],
};

let optionsForDepthCalculation = {
    mode: "text",
    pythonOptions: ["-u"],
    scriptPath: scriptPath,
    args: [workingDir,"5"],
};

let optionsForOverlap = {
    mode: "text",
    pythonOptions: ["-u"],
    scriptPath: scriptPath,
    args: [workingDir,[]],
};

let optionsFortsvTocsv = {
    mode: "text",
    pythonOptions: ["-u"],
    scriptPath: scriptPath,
    args: [[],"",workingDir],
};

let optionsFortsvTocsvSplit = {
    mode: "text",
    pythonOptions: ["-u"],
    scriptPath: scriptPath,
    args: ["",workingDir],
};

let optionsForZipResults = {
    mode: "text",
    pythonOptions: ["-u"],
    scriptPath: scriptPath,
    args: [[],"",workingDir],
};

let optionsForDelete = {
    mode: "text",
    pythonOptions: ["-u"],
    scriptPath: scriptPath,
    args: [workingDir],
};

let optionsForConfig = {
    mode: "text",
    pythonOptions: ["-u"],
    scriptPath: scriptPath,
    args: ["",[]],
};


//mainMenuTemplate
const mainMenuTemplate = [
    {
        label: "File",
        submenu: [
            {
                label: "Settings",
                click(){
                    createWindow()
                    
                }
            },
            {
                label: "Quit App",
                role: "quit"
            },
            
            
        ]
    },
    {
        label: "View",
        submenu: [
            {
                label: "Zoom In",
                role: "zoomIn"
            },
            {
                label: "Zoom Out",
                role: "zoomOut"
            },
            {
                label: "Reset Zoom",
                role: "resetZoom"
            },
        ]
    },
    
]


// Uygulama kurulumu
app.on("ready", ()=>{
    mainWindow = new BrowserWindow({
        minHeight: 768,
        minWidth: 1200,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        
    });
    console.log(process.execPath);
mainWindow.loadURL(
    url.format({
        pathname: path.join(__dirname, "../pages/main.html"),
        protocol: "file:",
        slashes: true,
    }),
);

//Menu bar düzenlemesi
const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
Menu.setApplicationMenu(mainMenu);


app.on("window-all-closed",()=>{
    if(process.platform !== "darwin"){
        app.quit();
    }
});

mainWindow.on("close",()=>{
    app.quit();
})

mainWindow.maximize();


//ipcMain partı
ipcMain.on("samFileUpload",(err,data)=>{
    storeUserFile(data);
});

ipcMain.on("captureFileUpload",(err,data)=>{
    storeUserFile(data);
});

ipcMain.on("threshold", (err,data)=>{
    threshold = data;
    optionsForDepthCalculation.args[1] = threshold;
    console.log(threshold)
});

ipcMain.on("workingDirPath", (err,data)=>{
    storeUserFile(data);
})

ipcMain.on("mosdepthPath", (err,data)=>{
    storeUserFile(data);
})

ipcMain.on("samtoolsPath", (err,data)=>{
    storeUserFile(data);
})

ipcMain.on("annovarPath", (err,data)=>{
    storeUserFile(data);
})

ipcMain.on("saveConfig", (err,data)=>{
    saveConfig(pathList,"pathList");
    
    
})

ipcMain.on("loadDB", (err,data)=>{
    loadDb(pathList);   
})

ipcMain.on("loadAnnotDB", (err,data)=>{
    loadAnnotDB(customAnnotationFile);
    loadAnnovarAnnotDB(annovarAnnotationFile);
})

ipcMain.on("addCustomFile", (err,data)=>{
    createWindow2();  
})

ipcMain.on("cancelWindow", (err,data)=>{
    fileWindow.close(); 
    fileWindow = null;
})

ipcMain.on("cancelAnnovarWindow", (err,data)=>{
    fileAnnovarWindow.close(); 
    fileAnnovarWindow = null;
})

ipcMain.on("customFileUpload", (err,data)=>{
    storeUserFile(data);
})

ipcMain.on("customAnnotFileObj",(err,data)=>{
    
    copyFile(data[0].filePath, pathList[0].path + "/annotationFiles/userAnnotationFiles/" + data[0].fileName + "_" + data[0].humanGenome + ".bed");
    saveConfig(data,"fileOptions");
});

ipcMain.on("annovarAnnotFileObj",(err,data)=>{
    saveConfig(data,"annovarFileOpt")
});

ipcMain.on("addAnnovarFile",(err,data)=>{
    createWindow3();
    
});

ipcMain.on("key|remove", (err, data) => {
    deleteFile(data);
});

ipcMain.on("submitSamFile",(err,data)=>{
    console.log(data[0].selectedSize)
    gfgDb.transaction(function (tx) { 
        tx.executeSql('SELECT * FROM customAnnotation5', [], function (tx, results) { 
            var len = results.rows.length, i; 
            for (i = 0; i < len; i++) { 
                console.log(results.rows.item(i).annotType)
                annotationSources.push({fileName:results.rows.item(i).fileName+".bed", humanGenome: results.rows.item(i).humanGenome, annotType: results.rows.item(i).annotType})
            } 
            loadAnnotationSources(annotationSources,data[0].selectedSize);
        }, null); 
    });
    gfgDb.transaction(function (tx) { 
        tx.executeSql('SELECT * FROM annovarAnnotation5', [], function (tx, results) { 
            var len = results.rows.length, i; 
            for (i = 0; i < len; i++) { 
                annotationSources.push({fileName:results.rows.item(i).annovarFileName, humanGenome: results.rows.item(i).annovarHumanGenome, annotType: results.rows.item(i).annovarAnnotType })
            } 
            
            loadAnnotationSources(annotationSources,data[0].selectedSize);
        }, null); 
    
    samTobam();
});
});

ipcMain.on("calculateOverlap",(err,data)=>{
    optionsForOverlap.args[1] = data[0].dbList;
    overlapCalculation();
})

ipcMain.on("resultPage",(err,data)=>{
    mainWindow.webContents.send("showResultFile", pathList[0].path + "/results/finalResults/");
});

ipcMain.on("exportCheckedFiles",(err,data)=>{
    createWindow4()
    
});

ipcMain.on("key|preview",(err,data)=>{
   
    fs.readdir(pathList[0].path + "/results/finalResults", (err, files) => {
        files.forEach((file) => {
            f = path.join(pathList[0].path + "/results/finalResults", file)
            
            if(file.split("_")[1] == data && f.endsWith("tsv")){
                optionsFortsvTocsvSplit.args[0] = f
                splitLargeCsv();
                
            }
        });
        
    });
    
    
    
});

ipcMain.on("exportAllFiles",(err,data)=>{
    createWindow5();
    
})

ipcMain.on("cancelExportWindow",(err,data)=>{
    exportType.close()
    exportType = null;
})

ipcMain.on("exportRadio",(err,data)=>{
    console.log(data)
    mainWindow.webContents.send("exportRadio",data);
})

ipcMain.on("exportAllRadio",(err,data)=>{
    console.log(data)
    mainWindow.webContents.send("exportAllRadio",data);
})

ipcMain.on("exportSelectedWithRadio",(err,data)=>{
    
    if(data[0].radioType == "xlsx"){
        if(data[0].fileNames.length > 1){
            optionsFortsvTocsv.args[0] = data[0].fileNames;
            optionsFortsvTocsv.args[1] = "multiple";
            tsvTocsv("multiple");
        }else if(data[0].fileNames.length = 1){
            optionsFortsvTocsv.args[0] = data[0].fileNames
            optionsFortsvTocsv.args[1] = "single";
            tsvTocsv("single");
        }
    }else if(data[0].radioType == "tsv"){
        optionsForZipResults.args[0] = data[0].fileNames;
        optionsForZipResults.args[1] = "zip"
        zipResults();    
    }
})

ipcMain.on("exportAllWithRadio",(err,data)=>{
    
    if(data[0].radioType == "xlsx"){
        optionsFortsvTocsv.args[1] = "allFiles";
        tsvTocsv("allFiles");
    }else if(data[0].radioType == "tsv"){
        optionsForZipResults.args[1] = "allFiles";
        zipResults();
    }
})

ipcMain.on("cancelAllExportWindow",(err,data)=>{
    exportAllType.close();
    exportAllType = null;
})

ipcMain.on("restartPage",(err,data)=>{
    mainWindow.reload();
    annotationSources =[];
    deleteAfterClose();
})

mainWindow.on("close", () => {
    deleteAfterClose();
    app.quit();
});

});




//functions
function storeUserFile(data){
    let filters = [];
    let fileOrFolder = "";

    if (data == "samFileUpload"){
        filters = filterSam;
        fileOrFolder = "openFile";
    }else if(data == "captureFileUpload"){
        filters = filterCapture;
        fileOrFolder = "openFile";
    }else if(data == "workingDirPath" || data == "annovarPath"){
        fileOrFolder = "openDirectory";
    }else if(data == "mosdepthPath" || data == "samtoolsPath" || data == "customFileUpload"){
        fileOrFolder = "openFile";
    }

    dialog.showOpenDialog({
        properties: [fileOrFolder],
        filters: filters,
    }).then((result) => {
      // checks if window was closed
    if (result.canceled) {
        console.log("No file selected!");
    }else {
        // seçilen doysanın pathini bize veriyor.
        filePath = result.filePaths[0];
        // seçilen dosyasının ismini bize veriyor.
        fileName = path.basename(filePath);

        if (data === "samFileUpload"){
            mainWindow.webContents.send("fileNameSam", fileName);
        }else if(data === "captureFileUpload"){
            mainWindow.webContents.send("fileNameCapture",fileName);
        }else if(data === "workingDirPath"){
            configWindow.webContents.send("workingDirPathName",filePath);
            pathList[0].path = filePath;
            configWindow.webContents.send("pathList",pathList);
        }else if(data === "mosdepthPath"){
            configWindow.webContents.send("mosdepthPathName",filePath);
            pathList[1].path = filePath;
            configWindow.webContents.send("pathList",pathList);
        }else if(data === "samtoolsPath"){
            configWindow.webContents.send("samtoolsPathName",filePath);
            pathList[2].path = filePath;
            configWindow.webContents.send("pathList",pathList);
        }else if(data === "annovarPath"){
            configWindow.webContents.send("annovarPathName",filePath);
            pathList[3].path = filePath;
            configWindow.webContents.send("pathList",pathList);
        }else if(data === "customFileUpload"){
            fileWindow.webContents.send("customFileName",filePath);
        }

        // Bu dosya yolu kullanıcının yüklemelerini nereye kayıt edeceğini belirliyor.
        if (data == "samFileUpload"){
            userFolderPath = path.join(pathList[0].path,"/userUpload/samFile",fileName);
            copyFile(filePath,userFolderPath);
        }else if(data == "captureFileUpload"){
            userFolderPath = path.join(pathList[0].path,"/userUpload/captureFile",fileName);
            copyFile(filePath,userFolderPath);
        }
    }
    });
    return filePath, userFolderPath;
}

function copyFile(filePath, userFolderPath) {
    // copy file from original location to app data folder
    let f = path.dirname(userFolderPath)
    //console.log(f)
    fs.copyFile(filePath, userFolderPath, (err) => {
        if (err) throw err;
        console.log(fileName + " uploaded.");
    });
}

function createWindow(){
    configWindow = new BrowserWindow({
        height: 800,
        width: 1000,
        autoHideMenuBar: true,
        maximizable:false,
        
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        resizable:false,
    });

    configWindow.loadURL(url.format({
        pathname: path.join(__dirname,"../pages/configWindow.html"),
        protocol:"file:",
        slashes: true,
    }));

    configWindow.on("close",()=>{
        configWindow = null;
    })
    
}

function createWindow2(){
    fileWindow = new BrowserWindow({
        height: 340,
        width: 500,
        
        maximizable:false,
        frame:false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        resizable:false,
    });

    fileWindow.loadURL(url.format({
        pathname: path.join(__dirname,"../pages/fileOptionsWindow.html"),
        protocol:"file:",
        slashes: true,
    }));

    fileWindow.on("close",()=>{
        fileWindow = null;
    })
    
}

function createWindow3(){
    fileAnnovarWindow = new BrowserWindow({
        height: 340,
        width: 500,
        
        maximizable:false,
        frame:false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        resizable:false,
    });

    fileAnnovarWindow.loadURL(url.format({
        pathname: path.join(__dirname,"../pages/annovarFileOptions.html"),
        protocol:"file:",
        slashes: true,
    }));
    fileAnnovarWindow.webContents.send("clicked",pathList[0].path)
    fileAnnovarWindow.on("close",()=>{
        fileAnnovarWindow = null;
    })
};

function createWindow4(){
    exportType = new BrowserWindow({
        height: 200,
        width: 500,
        
        maximizable:false,
        frame:false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        resizable:false,
    });

    exportType.loadURL(url.format({
        pathname: path.join(__dirname,"../pages/exportPage.html"),
        protocol:"file:",
        slashes: true,
    }));

    exportType.on("close",()=>{
        exportType = null;
    })
};

function createWindow5(){
    exportAllType = new BrowserWindow({
        height: 200,
        width: 500,
        
        maximizable:false,
        frame:false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        resizable:false,
    });

    exportAllType.loadURL(url.format({
        pathname: path.join(__dirname,"../pages/exportAllPage.html"),
        protocol:"file:",
        slashes: true,
    }));

    exportAllType.on("close",()=>{
        exportType = null;
    })
};

function saveConfig(dataObj,typeObj){
    if(typeObj == "pathList"){
        dataObj.forEach(path => {
            gfgDb.transaction(function (tx) {     
                tx.executeSql('CREATE TABLE IF NOT EXISTS appConfig3 (pathName unique, path)');  
                tx.executeSql('INSERT INTO appConfig3 (pathName, path) VALUES (?, ?)',[path.id,path.path]);
            });
            
            gfgDb.transaction(function (tx) {     
                tx.executeSql('UPDATE appConfig3 SET path=? WHERE pathName=?', [path.path,path.id]);
            });  
        });
        gfgDb.transaction(function (tx) { 
            tx.executeSql('SELECT * FROM appConfig3', [], function (tx, results) { 
                var len = results.rows.length, i; 
                for (i = 0; i < len; i++) { 
                    pathList[i].path = results.rows.item(i).path
                    
                } 
            }, null); 
            configWindow.webContents.send("clicked",pathList[3].path)
            createResultsFolder(pathList);
        });
    }else if(typeObj == "fileOptions"){
        
        gfgDb.transaction(function (tx) {     
            tx.executeSql('CREATE TABLE IF NOT EXISTS customAnnotation5 (fileName unique,humanGenome,annotType)');  
            tx.executeSql('INSERT INTO customAnnotation5 (fileName, humanGenome, annotType) VALUES (?, ?, ?)',[dataObj[0].fileName,dataObj[0].humanGenome,dataObj[0].annotType]);
            refreshAnnot("custom");
        });
        optionsForCustomAnnotation.args[0] = dataObj[0].fileName;
        optionsForCustomAnnotation.args[1] = dataObj[0].humanGenome;
        addCustomAnnotation();
        
        

    }else if(typeObj == "annovarFileOpt"){
        let dbList = dataObj[0].dbList
        dbList.forEach(element => {
            console.log("annovar",element)
            gfgDb.transaction(function (tx) {     
            tx.executeSql('CREATE TABLE IF NOT EXISTS annovarAnnotation5 (annovarFileName unique,annovarHumanGenome, annovarAnnotType)');  
            tx.executeSql('INSERT INTO annovarAnnotation5 (annovarFileName, annovarHumanGenome, annovarAnnotType) VALUES (?, ?, ?)',[element,dataObj[0].humanGenome, dataObj[0].annotType]);
            
        });
        
        optionsForAnnovarAnnotation.args[0] = dataObj[0].humanGenome;
        optionsForAnnovarAnnotation.args[1] = dataObj[0].dbList;
        addAnnovarAnnotation();
        });
        refreshAnnot("annovar");
        

    }
    
    
}

function loadDb(pathList){
    configWindow.webContents.send("loadConfig",pathList);
}

function loadAnnotDB(fileOptions){
    configWindow.webContents.send("customAnnotFile",fileOptions);
}

function loadAnnovarAnnotDB(fileOptions){
    configWindow.webContents.send("annovarAnnotFile",fileOptions);
}

function deleteFile(data) {
    let data2 = [];
    data2 = data.split(".");
    data2 = data2[data2.length - 1];

    if (data2 == "bed") {
        fs.readdirSync(pathList[0].path+"/annotationFiles/userAnnotationFiles").map(fileName => {
            
            if(fileName.split("_")[0]+".bed" == data){
                fs.unlink(
                    path.join(pathList[0].path + "/annotationFiles/userAnnotationFiles", fileName),
                    (err) => {
                    if (err) throw err;
                }
                )
            }
            
            gfgDb.transaction(function (tx) {  
                console.log("buraya giriyor",fileName.split("_")[1].split(".")[0])   
                tx.executeSql('DELETE FROM customAnnotation5 WHERE fileName= ? and humanGenome= ?', [fileName.split("_")[0],fileName.split("_")[1].split(".")[0]]);
            }); 
        });
        refreshAnnot("custom");
    }else{
        fs.readdirSync(pathList[0].path + "/annotationFiles/precomputed").map(fileName => {
            if(fileName.startsWith(data.split("_")[0]) && (fileName.endsWith(".gz") || fileName.endsWith(".tbi"))){
                fs.unlink(
                    path.join(pathList[0].path + "/annotationFiles/precomputed", fileName),
                    (err) => {
                    if (err) throw err;
                }
                )
            }
            gfgDb.transaction(function (tx) {  
                console.log(fileName.split("_")[1].split(".")[0])   
                tx.executeSql('DELETE FROM annovarAnnotation5 WHERE annovarFileName= ? and annovarHumanGenome= ?', [data,fileName.split("_")[1].split(".")[0]]);
            }); 
        });
        refreshAnnot("annovar");
    }
    
}

function refreshAnnot(annotType){

    if(annotType == "custom"){
        gfgDb.transaction(function (tx) { 
            tx.executeSql('SELECT * FROM customAnnotation5', [], function (tx, results) { 
                var len = results.rows.length, i; 
                for (i = 0; i < len; i++) { 
                    customAnnotationFile.push({fileName:results.rows.item(i).fileName, humanGenome: results.rows.item(i).humanGenome})
                    configWindow.webContents.send("customAnnotFile",customAnnotationFile);
                } 
            }, null); 
            
        });
        
        
        customAnnotationFile = [];
    }else if(annotType == "annovar"){
        gfgDb.transaction(function (tx) { 
            tx.executeSql('SELECT * FROM annovarAnnotation5', [], function (tx, results) { 
                var len = results.rows.length, i;
                for (i = 0; i < len; i++) { 
                    annovarAnnotationFile.push({annovarFileName:results.rows.item(i).annovarFileName, annovarHumanGenome: results.rows.item(i).annovarHumanGenome})
                    configWindow.webContents.send("annovarAnnotFile",annovarAnnotationFile);
                    
                } 
            }, null); 
        });
        
        
        annovarAnnotationFile = [];
    }

    
}

function loadAnnotationSources(annotationSources,humanGenome){
    let filteredAnnotationSources = [];

    annotationSources.forEach(element => {
        if(element.humanGenome == humanGenome){
            filteredAnnotationSources.push({humanGenomeVersion:humanGenome,annotSource:element});
        }
    });
    
    mainWindow.webContents.send("annotationSources",filteredAnnotationSources);
}

function exportFile(data) {
    let copyFile = "";
    if(data == "multiple"){
        let defaultPath = path.join("/home/Desktop/" + "overlapResults.xlsx");
        fs.readdir(pathList[0].path + "/results/.tempResults", (err, files) => {
            files.forEach((file) => {
            if (file == "overlapResults.xlsx") {
                copyFile = path.join(pathList[0].path + "/results/.tempResults",file);
                console.log(copyFile);
            }
            });
        });

        console.log(copyFile);
        dialog.showSaveDialog({
            title: "Select the File Path to Save",
            defaultPath: defaultPath,
            buttonLabel: "Export",
            filters: [
            {
                name: "Excel Files",
                extensions: ["xlsx"],
            },
            ],
            properties: [],
        }).then((file) => {
            console.log(file.canceled);
            if (!file.canceled) {
                console.log(file.filePath.toString());
                fs.copyFile(copyFile, file.filePath.toString(), function (err) {
                if (err) throw err;
                console.log("saved");
                defaultPath = file.filePath.toString();
            });
            }
        }).catch((err) => {
            console.log(err);
        });
    }else if(data == "single"){
        console.log(optionsFortsvTocsv.args[0])
        let defaultPath = path.join("/home/Desktop/" + optionsFortsvTocsv.args[0][0].split(".")[0] + ".xlsx");
        fs.readdir(pathList[0].path + "/results/.tempResults", (err, files) => {
            files.forEach((file) => {
            if (file ==  optionsFortsvTocsv.args[0][0].split(".")[0] + ".xlsx") {
                copyFile = path.join(pathList[0].path + "/results/.tempResults",file);
                console.log(copyFile);
            }
            });
        });

        console.log(copyFile);
        dialog.showSaveDialog({
            title: "Select the File Path to Save",
            defaultPath: defaultPath,
            buttonLabel: "Export",
            filters: [
            {
                name: "Excel Files",
                extensions: ["xlsx"],
            },
            ],
            properties: [],
        }).then((file) => {
            console.log(file.canceled);
            if (!file.canceled) {
                console.log(file.filePath.toString());
                fs.copyFile(copyFile, file.filePath.toString(), function (err) {
                if (err) throw err;
                console.log("saved");
                defaultPath = file.filePath.toString();
            });
            }
        }).catch((err) => {
            console.log(err);
        });

    }else if(data == "allFiles"){
        console.log(optionsFortsvTocsv.args[0])
        let defaultPath = path.join("/home/Desktop/" + "allResults.xlsx");
        fs.readdir(pathList[0].path + "/results/.tempResults", (err, files) => {
            files.forEach((file) => {
            if (file == "allResults.xlsx") {
                copyFile = path.join(pathList[0].path + "/results/.tempResults",file);
                console.log(copyFile);
            }
            });
        });

        console.log(copyFile);
        dialog.showSaveDialog({
            title: "Select the File Path to Save",
            defaultPath: defaultPath,
            buttonLabel: "Export",
            filters: [
            {
                name: "Excel Files",
                extensions: ["xlsx"],
            },
            ],
            properties: [],
        }).then((file) => {
            console.log(file.canceled);
            if (!file.canceled) {
                console.log(file.filePath.toString());
                fs.copyFile(copyFile, file.filePath.toString(), function (err) {
                if (err) throw err;
                console.log("saved");
                defaultPath = file.filePath.toString();
            });
            }
        }).catch((err) => {
            console.log(err);
        });

    }else if(data == "zipFile"){
        console.log(optionsFortsvTocsv.args[0])
        let defaultPath = path.join("/home/Desktop/" + "overlapResults" + ".zip");
        fs.readdir(pathList[0].path + "/results/.tempResults", (err, files) => {
            files.forEach((file) => {
            if (file ==  "overlapResults.zip") {
                copyFile = path.join(pathList[0].path + "/results/.tempResults",file);
                console.log(copyFile);
            }
            });
        });

        console.log(copyFile);
        dialog.showSaveDialog({
            title: "Select the File Path to Save",
            defaultPath: defaultPath,
            buttonLabel: "Export",
            filters: [
            {
                name: "Zip Files",
                extensions: ["zip"],
            },
            ],
            properties: [],
        }).then((file) => {
            console.log(file.canceled);
            if (!file.canceled) {
                console.log(file.filePath.toString());
                fs.copyFile(copyFile, file.filePath.toString(), function (err) {
                if (err) throw err;
                console.log("saved");
                defaultPath = file.filePath.toString();
            });
            }
        }).catch((err) => {
            console.log(err);
        });
    }
    
    
    
}

function createResultsFolder(pathList){
    console.log("paths",pathList[0])
    console.log("paths2",pathList)
    if(fs.existsSync(pathList[0].path + "/")){
        workingDir = pathList[0].path + "/";
    }
    let samFiles = path.join(workingDir + "userUpload/" + "samFile/");
    let mosdepth = path.join(workingDir + "userUpload/" + "mosdepth/");
    let captureFile = path.join(workingDir + "userUpload/" + "captureFile/");
    let precomputed = path.join(workingDir + "annotationFiles/" + "precomputed/");
    let userAnnotationFiles = path.join(workingDir + "annotationFiles/" + "userAnnotationFiles/");
    let tempResults = path.join(workingDir + "results/" + ".tempResults/");
    let tempResults2 = path.join(workingDir + "results/" + ".tempResults2/");
    let tempResults3 = path.join(workingDir + "results/" + ".tempResults3/");
    let finalResults = path.join(workingDir + "results/" + "finalResults/");
    let config = path.join(workingDir + ".config/");

    if(!fs.existsSync(samFiles)){
        fs.mkdirSync(samFiles,{recursive:true})
    }
    if(!fs.existsSync(mosdepth)){
        fs.mkdirSync(mosdepth,{recursive:true})
    }
    if(!fs.existsSync(captureFile)){
        fs.mkdirSync(captureFile,{recursive:true})
    }
    if(!fs.existsSync(precomputed)){
        fs.mkdirSync(precomputed,{recursive:true})
    }
    if(!fs.existsSync(userAnnotationFiles)){
        fs.mkdirSync(userAnnotationFiles,{recursive:true})
    }
    if(!fs.existsSync(tempResults)){
        fs.mkdirSync(tempResults,{recursive:true})
    }
    if(!fs.existsSync(tempResults2)){
        fs.mkdirSync(tempResults2,{recursive:true})
    }
    if(!fs.existsSync(tempResults3)){
        fs.mkdirSync(tempResults3,{recursive:true})
    }
    if(!fs.existsSync(finalResults)){
        fs.mkdirSync(finalResults,{recursive:true})
    }
    if(!fs.existsSync(config)){
        fs.mkdirSync(config,{recursive:true})
    }
    
    optionsForConfig.args[0] = workingDir;
    paths.push(pathList[1].path);
    paths.push(pathList[2].path);
    paths.push(pathList[3].path);
    optionsForConfig.args[1] = paths;
    createPathFile();
    createVariable(pathList);

    return workingDir;
}




//scripts
function addCustomAnnotation(){
    fileWindow.webContents.send("customSpin","customSpin")
    PythonShell.run("addCustomAnnotation.py",optionsForCustomAnnotation,function(err,results){
        if(err) throw err;
        console.log("results: %j",results);
        if(results && fileWindow != null){
            fileWindow.close();
            fileWindow = null;
        }

    });
}

function addAnnovarAnnotation(){
    fileAnnovarWindow.webContents.send("annovarSpin","annovarSpin")
    PythonShell.run("addAnnovarAnnotations.py",optionsForAnnovarAnnotation,function(err,results){
        if(err) throw err;
        console.log("results: %j",results);
        if(results && fileAnnovarWindow != null){
            fileAnnovarWindow.close();
            fileAnnovarWindow = null;
        }
    });
}

function depthCalculation(){
    PythonShell.run("depthCalculation.py",optionsForDepthCalculation,function(err,results){
        if(err) throw err;
        console.log("results: %j",results);
        if(results){
            mainWindow.webContents.send("activateNextBtn","activateNextBtn");
        }
    });
}

function samTobam(){
    mainWindow.webContents.send("samtobamSpin","samtobamSpin");
    PythonShell.run("samtobam.py",optionsForSamtobam,function(err,results){
        if(err) throw err;
        console.log("results: %j",results);
        if(results){
            depthCalculation();
        }
    });
}

function overlapCalculation(){
    mainWindow.webContents.send("overlapsSpin","overlapsSpin");
    PythonShell.run("overlapCalculationFO.py",optionsForOverlap,function(err,results){
        if(err) throw err;
        console.log("results: %j",results);
        if(results){
            mainWindow.webContents.send("overlapsSpinOf","overlapsSpinOf");
        }
    });
}

function tsvTocsv(dataType){
    if(exportType != null){
        exportType.close();
        
    }
    if(exportAllType != null){
        exportAllType.close();
        
    }
    mainWindow.webContents.send("exportSpin","exportSpin");
    PythonShell.run("tsvTocsv.py",optionsFortsvTocsv,function(err,results){
        if(err) throw err;
        console.log("results: %j",results);
        if(results){
            exportFile(dataType);
            mainWindow.webContents.send("exportSpinOf","exportSpinOf");
        }if(results && exportType != null){
            exportType.close();
            exportType = null;
        }
        if(results && exportAllType != null){
            exportAllType.close();
            exportAllType = null;
        }
        
        
        
    });
}

function splitLargeCsv(){

    PythonShell.run("splitlargeCsv.py",optionsFortsvTocsvSplit,function(err,results){
        if(err) throw err;
        console.log("results: %j",results);
        if(results){
            mainWindow.webContents.send("previewExcel",optionsFortsvTocsvSplit.args[0])
        }
    });
}

function zipResults(){
    
    mainWindow.webContents.send("exportSpin","exportSpin");
    PythonShell.run("zipResults.py",optionsForZipResults,function(err,results){
        if(err) throw err;
        console.log("results: %j",results);
        if(results){
            exportFile("zipFile")
            mainWindow.webContents.send("exportSpinOf","exportSpinOf");
        }
        if(results && exportAllType != null){
            exportAllType.close();
            exportAllType = null;
        }
        if(results && exportType != null){
            exportType.close();
            exportType = null;
        }
        
    });
}

function deleteAfterClose(){
    PythonShell.run("deleteFile.py",optionsForDelete,function(err,results){
        if(err) throw err;
        console.log("results: %j",results);
        
    });
}



function createPathFile(){
    PythonShell.run("config.py",optionsForConfig,function(err,results){
        if(err) throw err;
        console.log("results: %j",results);
    });
}

function createVariable(pathList){
    
    optionsForCustomAnnotation.args[2] = pathList[0].path
    optionsForAnnovarAnnotation.args[2] = pathList[0].path
    optionsForSamtobam.args[0] = pathList[0].path
    optionsForDepthCalculation.args[0] = pathList[0].path
    optionsForOverlap.args[0] = pathList[0].path
    optionsFortsvTocsv.args[2] = pathList[0].path
    optionsFortsvTocsvSplit.args[1] = pathList[0].path
    optionsForZipResults.args[2] = pathList[0].path
    optionsForDelete.args[0] = pathList[0].path

}