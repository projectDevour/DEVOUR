import os, sys, shlex, subprocess



directory =  sys.argv[1] 
sys.path.append(directory + "/" + ".config" + "/")
import configPath

threadCount = os.cpu_count();



def sortAndIndex(bamFile,root):
    # sort bam files
    bamsortCmd = configPath.samtools + " sort -@ " + str(threadCount) + " " + bamFile + " -o " + root + "_sorted.bam"
    bamsortArgs = shlex.split(bamsortCmd)
    subprocess.run(bamsortArgs)
    # index bam files
    bamindexCmd = "samtools index -b -@ " + str(threadCount) + " " + root + "_sorted.bam"
    bamindexArgs = shlex.split(bamindexCmd)
    subprocess.run(bamindexArgs)


def samtobam(samfilePath,outputBamFile):
    sam2bamCmd = configPath.samtools + " view -S -b -@ " + str(threadCount)+ " " + samfilePath + " > " + outputBamFile + ".bam"
    bamFile = os.path.join(root+ ".bam")
    subprocess.call(["samtools","view","-S","-b",f],stdout=open(bamFile,"wb"))
    bamFile = os.path.join(outputBamFile +".bam")
    sortAndIndex(bamFile,root)


for filename in os.listdir(os.path.join(directory + "/userUpload/samFile/")):
    f = os.path.join(os.path.join(directory + "/userUpload/samFile/"),filename)
    if(not f.endswith("_sorted.bam")):
        if (os.path.isfile(f)):
            root = os.path.splitext(f)[0]
            ext = os.path.splitext(f)[1].lower()
            if ext == ".sam":
                samtobam(f,root)
            elif ext == ".bam":
                sortAndIndex(f,root)

print("done")       