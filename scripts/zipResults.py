from posixpath import basename
from zipfile import ZipFile
import pandas as pd
import re, sys, os
import shutil,shlex,subprocess

files2 = sys.argv[1]
exportType = sys.argv[2]
files= files2.split(",")
workingDir = sys.argv[3]
finalResults = os.path.join(workingDir + "/results/finalResults/")
tempResults = os.path.join(workingDir + "/results/.tempResults/")
tempResults3 = os.path.join(workingDir + "/results/.tempResults3/")
fileName = [];

if(exportType == "zip"):
    for tsv in os.listdir(finalResults):
        f = os.path.join(finalResults,tsv)
        if((tsv in files) and f.endswith("tsv")):
            fileName.append(tsv)

    # create a ZipFile object
    zipObj = ZipFile(tempResults + "overlapResults.zip", 'w')
    for file in fileName:
        filePath = os.path.join(finalResults+file)
        zipObj.write(filePath,basename(filePath))
    zipObj.close()

elif(exportType == "allFiles"):
    for tsv in os.listdir(finalResults):
        f = os.path.join(finalResults,tsv)
        fileName.append(tsv)
        
        zipObj = ZipFile(tempResults + "allOverlapResults.zip", 'w')
    for file in fileName:
        filePath = os.path.join(finalResults+file)
        zipObj.write(filePath,basename(filePath))
    zipObj.close()

print("donee")
