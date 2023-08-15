import pandas as pd
import re, sys, os
import shutil,shlex,subprocess

files2 = sys.argv[1]
exportType = sys.argv[2]
workingDir = sys.argv[3]
files= files2.split(",")
finalResults = os.path.join(workingDir + "/results/finalResults/")
tempResults = os.path.join(workingDir + "/results/.tempResults/")
tempResults3 = os.path.join(workingDir + "/results/.tempResults3/")
fileName = [];

for csv in os.listdir(finalResults):
    f = os.path.join(finalResults,csv)

    if((csv in files) and f.endswith("tsv")):
        fileName.append(csv)


if(exportType == "allFiles"):
    for filename in os.listdir(finalResults):
        fileNameNoExt = filename.split(".")[0]
        with open(finalResults+filename, 'r') as myfile:
            with open(tempResults+fileNameNoExt+".csv", 'w') as csv_file:
                for line in myfile:
                    #   Replace every tab with comma
                    fileContent = re.sub("\t", "~", line)
                    # Writing into csv file
                    csv_file.write(fileContent)
                    
    
    for csv in os.listdir(tempResults):
        f = os.path.join(tempResults,csv)
        if(f.endswith(".csv")):
            splitCMD = "split -d -l 1000000 --additional-suffix=.csv " + f + " " + tempResults3 + csv.split("_")[1] + "_"
            splitARGS = shlex.split(splitCMD)
            subprocess.run(splitARGS)
        multiExcel = pd.ExcelWriter(tempResults+"allResults.xlsx")
        for newCsv in os.listdir(tempResults3):
            f2 = os.path.join(tempResults3,newCsv)
            if(f2.endswith(".csv")):
                df = pd.read_csv(f2,sep="~",names=["chr", "start", "end", "depth", "annotationStart", "annotationEnd", "annotationInfo"])
                df.to_excel(multiExcel,sheet_name=f2.split("/")[-1].split(".")[0],index=False,engine="xlsxwriter")
        multiExcel.save();
else:
    print("dsds",fileName)
    for filename in fileName:
        
        fileNameNoExt = filename.split(".")[0]
        fileType = filename.split("_")[1]
        with open(finalResults+filename, 'r') as myfile:
            with open(tempResults+fileNameNoExt+".csv", 'w') as csv_file:
                for line in myfile:
                    # Replace every tab with comma
                    fileContent = re.sub("\t", "~", line)
                    # Writing into csv file
                    csv_file.write(fileContent)

    if(exportType == "multiple"):
        for csv in os.listdir(tempResults):
            f = os.path.join(tempResults,csv)
            if(f.endswith(".csv") and csv.split(".")[0] + ".tsv" in files):
                splitCMD = "split -d -l 1000000 --additional-suffix=.csv " + f + " " + tempResults3 + csv.split("_")[1] + "_"
                splitARGS = shlex.split(splitCMD)
                subprocess.run(splitARGS)
        multiExcel = pd.ExcelWriter(tempResults+"overlapResults.xlsx")
        for newCsv in os.listdir(tempResults3):
            f2 = os.path.join(tempResults3,newCsv)
            if(f2.endswith(".csv")):
                df = pd.read_csv(f2,sep="~",names=["chr", "start", "end", "depth", "annotationStart", "annotationEnd", "annotationInfo"])
                df.to_excel(multiExcel,sheet_name=f2.split("/")[-1].split(".")[0],index=False,engine="xlsxwriter")
        multiExcel.save();

        for deleteFile in os.listdir(tempResults3):
            os.remove(os.path.join(tempResults3,deleteFile))


    elif(exportType == "single"):
        fileNameNoExt = files[0].split(".")[0]
        singleExcel = pd.ExcelWriter(tempResults + fileNameNoExt + ".xlsx")
        for csv in os.listdir(tempResults):
            f = os.path.join(tempResults,csv)
            if(f.endswith("csv") and f.split("/")[-1] == fileNameNoExt + ".csv"):
                df = pd.read_csv(f,sep="~",names=["chr", "start", "end", "depth", "annotationStart", "annotationEnd", "annotationInfo"])
                if(df.shape[0] >1000000):
                    GROUP_LENGTH = 1000000
                    with singleExcel as writer:
                        count = 0
                        for i in range(0, len(df), GROUP_LENGTH):
                            df[i : i+GROUP_LENGTH].to_excel(writer, sheet_name= fileNameNoExt.split("_")[1] + '.{}'.format(count), index=False, header=True)
                            count += 1
                else:
                    df.to_excel(singleExcel,index=False,engine="xlsxwriter")
                singleExcel.save();


GROUP_LENGTH = 1000000 # set nr of rows to slice df
print("doneee")