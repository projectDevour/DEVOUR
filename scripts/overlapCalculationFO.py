import sys, subprocess, os, shlex
from intervaltree import IntervalTree
from multiprocessing.pool import ThreadPool

#merge files
def mergeTsvFiles(dbName,finalResult,depthFileName, annotFileName,):
    if(len(dbName) != 0):
        mergeDbName = "cat " + " ".join(dbName) + " > " + finalResult + depthFileName + "_" + annotFileName + "_" + "overlaps.tsv"
        mergeDbArg = shlex.split(mergeDbName)
        finalResultPath = os.path.join(finalResult + depthFileName + "_" + annotFileName + "_" + "overlaps.tsv")
        subprocess.run(mergeDbArg,cwd=out_dir,stdout=open(finalResultPath,"wb"))
        


def mergeChrOverlaps(depthFileName, annotFileName, resultsDir):
    dbName = []
    for tsv in os.listdir(resultsDir):

        if tsv.startswith(depthFileName + "_" + annotFileName) and tsv.endswith(".tsv"):
            dbName.append(tsv)
            mergeTsvFiles(dbName,finalResult,depthFileName,annotFileName)



def createChrDictFromFile(bedgzFile, chrom):
    dict = {}
    cmd = ["tabix", bedgzFile, chrom]
    result = subprocess.run(cmd, capture_output=True, check=False, text=True, encoding='utf-8').stdout
    chromIntervals = IntervalTree()
    for line in result.split(os.linesep):
        if line != '':
            cols = line.split("\t")
            begin = int(cols[1])
            end = int(cols[2]) + 1
            data = cols[3]
            if (chrom == cols[0]):
                chromIntervals.addi(begin, end, data)
    dict[chrom] = chromIntervals
    return dict

def reportOverlaps(depthgzFile, annotgzFile, annotDict, chrom, outDir):
    depthFileName = depthgzFile.split(".")[0].split("/")[-1]
    if (not ("_" in annotgzFile)):
        dbType = annotgzFile.split("/")[-1].split("_")[0]
    else:
        dbType = annotgzFile.split("/")[-1].split(".")[0]

    annotTree = IntervalTree(annotDict.get(chrom))
    if (annotTree):
        out = open(outDir + depthFileName + "_" + dbType + "_" + chrom + "_overlaps.tsv", 'w')
        cmd2 = ["tabix", depthgzFile, chrom]
        result = subprocess.run(cmd2, capture_output=True, check=False, text=True, encoding='utf-8').stdout
        for line in result.split(os.linesep):
            if line != '':
                cols = line.rstrip().split("\t")
                chrom = cols[0]
                begin = int(cols[1])
                end = int(cols[2])
                depth = int(cols[3])
                overlaps = sorted(annotTree[begin:end+1])
                if (overlaps):
                    for overlap in overlaps:
                        out.write(chrom + "\t" + str(begin) + "\t" + str(end) + "\t" + str(depth) + "\t" + str(overlap[0]) + "\t" + str(overlap[1] - 1) + "\t" + overlap[2] + "\n")
        out.close()


workingDir = sys.argv[1]




depthResults_dir = os.path.join(workingDir + "/userUpload/mosdepth/") # bizim path ini bildiğimiz bi folder
precompAnnot_dir = os.path.join(workingDir + "/annotationFiles/precomputed/") # bizim path ini bildiğimiz bi folder
userAnnot_dir = os.path.join(workingDir + "/annotationFiles/userAnnotationFiles/") # bizim path ini bildiğimiz bi folder
out_dir = os.path.join(workingDir + "/results/") # result için de sabit bi klasör belirleyelim
finalResult = os.path.join(workingDir + "/results/finalResults/") # finalResults path
dbNameAnnot = sys.argv[2] # dbName






chromList = ["chr" + str(i) for i in range(1,23)]
chromList.append("chrX")
chromList.append("chrY")

tp = ThreadPool(os.cpu_count())




for chrom in chromList:  # multithread edilecek
    for precompAnnotFile in os.listdir(precompAnnot_dir):
        precompAnnotFile2 = precompAnnotFile.split("_")[0]
        if(precompAnnotFile2 in dbNameAnnot):
            precomp = os.path.join(precompAnnot_dir, precompAnnotFile)  # /path/to/precompAnnot_dir/dbtype_hgversion.bed.gz
            if os.path.isfile(precomp) and precomp.endswith("bed.gz"):
                annotDict = tp.apply_async(createChrDictFromFile, (precomp, chrom)).get()
                #annotDict = createChrDictFromFile(precomp, chrom)
                dbType = precomp.split("/")[-1].split("_")[0]
                for filename in os.listdir(depthResults_dir):
                    f = os.path.join(depthResults_dir, filename)  # /path/to/XYZ.per-base.bed.gz
                    depthFileName = f.split(".")[0].split("/")[-1]
                    if os.path.isfile(f) and f.endswith("per-base.bed.gz"):
                        tp.apply_async(reportOverlaps, (f, precomp, annotDict, chrom, out_dir))
    
    
    for userAnnotFile in os.listdir(userAnnot_dir):
        userAnnotFile2 = userAnnotFile.split("_")[0];
        if(userAnnotFile2 + ".bed" in dbNameAnnot):
            userannot = os.path.join(userAnnot_dir, userAnnotFile)  # /path/to/userAnnot_dir/userannotFile1.bed.gz
            annotFileName = userannot.split("/")[-1].split(".")[0]
            if os.path.isfile(userannot) and userannot.endswith("bed.gz"):
  

                annotDict = tp.apply_async(createChrDictFromFile, (userannot, chrom)).get()
                for filename2 in os.listdir(depthResults_dir):
                    f = os.path.join(depthResults_dir, filename2)  # /path/to/XYZ.per-base.bed.gz
                    depthFileName = f.split(".")[0].split("/")[-1]
                    if os.path.isfile(f) and f.endswith("per-base.bed.gz"):
                        tp.apply_async(reportOverlaps, (f, userannot, annotDict, chrom, out_dir))
   


for precompAnnotFile in os.listdir(precompAnnot_dir):
    precompAnnotFile2 = precompAnnotFile.split("_")[0]
    if(precompAnnotFile2 in dbNameAnnot):
        precomp = os.path.join(precompAnnot_dir, precompAnnotFile)  # /path/to/precompAnnot_dir/dbtype_hgversion.bed.gz
        if os.path.isfile(precomp) and precomp.endswith("bed.gz"):
            for filename in os.listdir(depthResults_dir):
                f = os.path.join(depthResults_dir, filename)  # /path/to/XYZ.per-base.bed.gz
                depthFileName = f.split(".")[0].split("/")[-1]
                print(depthFileName)
            mergeChrOverlaps(depthFileName,precompAnnotFile2,out_dir)

for userAnnotFile in os.listdir(userAnnot_dir):
        userannot = os.path.join(userAnnot_dir, userAnnotFile)  # /path/to/userAnnot_dir/userannotFile1.bed.gz
        annotFileName = userannot.split("/")[-1].split(".")[0]
        if os.path.isfile(userannot) and userannot.endswith("bed.gz"):
            for filename2 in os.listdir(depthResults_dir):
                f = os.path.join(depthResults_dir, filename2)  # /path/to/XYZ.per-base.bed.gz
                depthFileName = f.split(".")[0].split("/")[-1]
            mergeChrOverlaps(depthFileName,annotFileName,out_dir)

print("done")
tp.close()
tp.join()
