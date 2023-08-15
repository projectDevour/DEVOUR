
import pandas as pd
import os, sys, shlex, subprocess,re

fileName = sys.argv[1]
workingDir = sys.argv[2]
finalResults = os.path.join(workingDir + "/results/finalResults/")
tempResults = os.path.join(workingDir + "/results/.tempResults/")
tempResults2 = os.path.join(workingDir + "/results/.tempResults2/")


fileNameNoExt = fileName.split("/")[-1].split("_")[1]
# print(fileNameNoExt)
splitCmd = "head -n 10 " + fileName + " > " + tempResults2 + fileNameNoExt + ".tsv"
# print(splitCmd)
splitArg = shlex.split(splitCmd)
finalSplitPath = os.path.join(tempResults2 + fileNameNoExt + ".tsv")
subprocess.run(splitArg,stdout=open(finalSplitPath,"wb"))


with open(tempResults2 + fileNameNoExt +".tsv", 'r') as myfile:
        with open(tempResults2 + fileNameNoExt + ".csv", 'w') as csv_file:
            for line in myfile:
                # Replace every tab with comma
                fileContent = re.sub("\t", "~", line)
                # Writing into csv file
                csv_file.write(fileContent)


        # Reading the csv file
        df_new = pd.read_csv(tempResults2 + fileNameNoExt+".csv", sep="~",names=["chr", "start", "end", "depth", "annotationStart", "annotationEnd", "annotationInfo"])

        # saving xlsx files
        GFG = pd.ExcelWriter(tempResults2 + fileNameNoExt + ".xlsx")
        df_new.to_excel(GFG, index=False)

        GFG.save()
print("done")