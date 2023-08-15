from concurrent.futures import thread
import os
from re import sub
import sys
import shlex
import subprocess



def filterBedFile(inFile,threshold,outFile):
    filterCMD = "awk -v threshold=" + threshold + " '$4<=threshold' " + inFile
    # " > " + os.path.splitext(f)[0].split(".")[0] + ".per-base_filtered.bed"
    filterArgs = shlex.split(filterCMD)
    filteredBed = subprocess.run(filterArgs, capture_output=True, check=False, text=True, encoding='utf-8').stdout
    out = open(outFile,"w")
    out.write(filteredBed)
    out.close()
    subprocess.run(["rm", inFile])
    subprocess.run(["mv", outFile, inFile])



workingDir = sys.argv[1]
sys.path.append(workingDir + "/" + ".config" + "/")
import configPath


capture = os.path.join(workingDir + "/userUpload/captureFile/")
for i in os.listdir(capture):
    capturefile = os.path.join(capture,i)

depth_threshold = sys.argv[2]

alignmentDir = os.path.join(workingDir + "/userUpload/samFile/")



out_dir =  os.path.join(workingDir + "/userUpload/mosdepth/")

def deleteFile():
    for deleteFile in os.listdir(out_dir):
        f = os.path.join(out_dir,deleteFile)
        if(not(f.endswith(".per-base.bed.gz") or f.endswith(".per-base.bed.gz.tbi"))):
            os.remove(f)


for filename in os.listdir(alignmentDir):
    f = os.path.join(alignmentDir, filename)
    if os.path.isfile(f) and f.endswith("_sorted.bam"):
        file = filename.split("_")[0]
        mosdepthCmd = (configPath.mosdepth + " -t 4 --by " + capturefile + " " + file + " " + f)
        print(mosdepthCmd)
        mosdepthArgs = shlex.split(mosdepthCmd)
        subprocess.run(mosdepthArgs, cwd=out_dir)


for filename in os.listdir(out_dir):
    f = os.path.join(out_dir,filename)
    if os.path.isfile(f) and ("per-base" in filename) and f.endswith(".gz"):
        gzipCMD = "gunzip " + f
        gzipArg = shlex.split(gzipCMD)
        subprocess.run(gzipArg)
    

        filterBedFile(os.path.splitext(f)[0],depth_threshold,os.path.splitext(f)[0].split(".")[0] + ".per-base_filtered.bed")
        
       

        bgzipCmd = ("bgzip" + " -@ " + str(os.cpu_count()) + " " + os.path.splitext(f)[0])
        bgzipArgs = shlex.split(bgzipCmd)
        subprocess.run(bgzipArgs, cwd=out_dir)

       
        tabixCmd = ("tabix" + " -p bed " + f)
        tabixArgs = shlex.split(tabixCmd)
        subprocess.run(tabixArgs, cwd=out_dir)
deleteFile()