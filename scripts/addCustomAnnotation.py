import sys, os, subprocess, shlex

def sortBed(inFile,outFile):
    #sort -k1,1 -k2,2n gnomad_hg19.bed > gnomad_hg19_sorted.bed
    sortCMD = "sort -k1,1 -k2,2n " + inFile
    sortArgs = shlex.split(sortCMD)
    sortedBed = subprocess.run(sortArgs, capture_output=True, check=False, text=True, encoding='utf-8').stdout
    out = open(outFile,"w")
    out.write(sortedBed)
    out.close()
    subprocess.run(["rm", inFile])
    subprocess.run(["mv", outFile, inFile])




filename = sys.argv[1] #arayüzde kullanıcının verdiği filename
hgVersion = sys.argv[2]
workingDir = sys.argv[3]  #arayüzde kullanıcın verdiği humanGenome
out_dir = os.path.join(workingDir + "/annotationFiles/userAnnotationFiles/") #workspace dir altındaki userannotation folder ı olacak fixed
print(out_dir)

f = os.path.join(out_dir, filename + "_" + hgVersion + ".bed")
if os.path.isfile(f):
    sortBed(f,os.path.join(out_dir, filename + "_" + hgVersion + "_sorted.bed"))
    bgzipCmd = "bgzip -@ " + str(os.cpu_count()) + " " + f
    bgzipArgs = shlex.split(bgzipCmd)
    subprocess.run(bgzipArgs, cwd=out_dir)
    print("bgzip done")
    tabixCmd = "tabix -p bed " + f + ".gz"
    
    tabixArgs = shlex.split(tabixCmd)
    subprocess.run(tabixArgs, cwd=out_dir)
    print("tabix done")

print("done")