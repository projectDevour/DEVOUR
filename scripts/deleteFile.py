import os
import sys
import shutil


workingDir = sys.argv[1]
samFiles = os.path.join(workingDir + "/userUpload/samFile/")
mosdepth = os.path.join(workingDir + "/userUpload/mosdepth/")
bedFiles = os.path.join(workingDir + "/userUpload/captureFile/")
precomp = os.path.join(workingDir + "/annotationFiles/precomputed/")
userAnnot = os.path.join(workingDir + "/annotationFiles/userAnnotationFiles/")
finalResult = os.path.join(workingDir + "/results/finalResults/")
tempResult =  os.path.join(workingDir + "/results/.tempResults/")
tempResult2 = os.path.join(workingDir + "/results/.tempResults2/")
tempResult3 = os.path.join(workingDir + "/results/.tempResults3/")
results = os.path.join(workingDir + "/results/")

for deleteFile in os.listdir(results):
        f = os.path.join(results, deleteFile)
        if(os.path.isfile(f)):
            os.remove(f)

for deleteFile in os.listdir(samFiles):
    os.remove(os.path.join(samFiles,deleteFile))

for deleteFile in os.listdir(mosdepth):
    os.remove(os.path.join(mosdepth,deleteFile))

for deleteFile in os.listdir(bedFiles):
    os.remove(os.path.join(bedFiles,deleteFile))

for deleteFile in os.listdir(precomp):
    if(os.path.join(precomp,deleteFile).endswith("idx") or os.path.join(precomp,deleteFile).endswith("log")):
        os.remove(os.path.join(precomp,deleteFile))

for deleteFile in os.listdir(finalResult):
    os.remove(os.path.join(finalResult,deleteFile))

for deleteFile in os.listdir(tempResult):
    os.remove(os.path.join(tempResult,deleteFile))

for deleteFile in os.listdir(tempResult2):
    os.remove(os.path.join(tempResult2,deleteFile))

for deleteFile in os.listdir(tempResult3):
    os.remove(os.path.join(tempResult3,deleteFile))