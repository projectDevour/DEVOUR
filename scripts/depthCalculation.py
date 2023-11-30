from concurrent.futures import thread
import os
from re import sub
import sys
import shlex
import subprocess
import configPath


def filterBedFile(inFile,threshold,outFile):
    with open(infile, "r") as input_file:
        lines = input_file.readlines()
    filtered_lines = [line for line in lines if float(line.split()[2]) <= float(threshold)]
    out = open(outFile,"w")
    out.write(filteredBed)
    for line in filtered_lines:
        cols = line.strip().split("\t")
        output_file.write(cols[0] + "\t" + cols[1] + "\t" + cols[1] + "\t" + cols[2] + "\n")
    out.close()
    subprocess.run(["rm", inFile])
    subprocess.run(["mv", outFile, inFile])

workingDir = sys.argv[1]
sys.path.append(workingDir + "/" + ".config" + "/")

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
        samtoolsCmd = (samtoolsPath + " depth -b " + capture + " " + f + " -o " + file + ".per-base.bed")
        samtoolsArgs = shlex.split(samtoolsCmd)
        subprocess.run(samtoolsArgs, cwd=out_dir)
        subprocess.run(shlex.split("gzip " + out_dir + "/" + file + ".per-base.bed"))
        
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
