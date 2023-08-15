import sys, os, threading, subprocess, shlex
import warnings
warnings.filterwarnings('ignore')

def annovarDownDb(annovarPath, hgVer, db, outPath):
    annovarDownDbCmd = annovarPath + "annotate_variation.pl -downdb -buildver " + hgVer + " -webfrom annovar " + db + " " + outPath
    annovarDownDbArgs = shlex.split(annovarDownDbCmd)
    subprocess.run(annovarDownDbArgs)

def parseClinvar(infile, outfile):
    f = open(infile, 'r')
    lines = f.readlines()
    f.close()
    o = open(outfile, 'w')
    for line in lines:
        if line.startswith('#'):
            continue
        cols = line.strip('\n').split('\t')
        o.write("chr" + cols[0] + "\t" + cols[1] + "\t" + cols[2] + "\t" + "CLNALLELEID:" + cols[5] + "|" + cols[6].replace(u'\\x2c', ", ") + "|" + cols[7].replace(u'\\x2c', ", ") + "|" + cols[9] + "\n")
    o.close()

def parseCosmic(infile, outfile):
    f = open(infile, 'r')
    lines = f.readlines()
    f.close()
    o = open(outfile, 'w')
    for line in lines:
        if line.startswith('#'):
            continue
        cols = line.strip('\n').split('\t')
        o.write("chr" + cols[0] + "\t" + cols[1] + "\t" + cols[2] + "\t" + cols[3] + "|" + cols[4] + "|" + cols[5] + "\n")
    o.close()

def parseNci(infile, outfile):
    f = open(infile, 'r')
    lines = f.readlines()
    f.close()
    o = open(outfile, 'w')
    for line in lines:
        cols = line.strip('\n').split('\t')
        o.write("chr" + cols[0] + "\t" + cols[1] + "\t" + cols[2] + "\t" + cols[3] + "|" + cols[4] + "|" + cols[5])
    o.close()

def parseIcgc(infile, outfile):
    f = open(infile, 'r')
    lines = f.readlines()
    f.close()
    o = open(outfile, 'w')
    for line in lines:
        if line.startswith('#'):
            continue
        cols = line.strip('\n').split('\t')
        o.write("chr" + cols[0] + "\t" + cols[1] + "\t" + cols[2] + "\t" + cols[3] + "|" + cols[4] + "|" + cols[5] + "|" + cols[6])
    o.close()

workingDir = sys.argv[3]
sys.path.append(workingDir + "/" + ".config" + "/")
import configPath

annovar_dir = configPath.annovar + "/" # application paths de girilen annovar path fixed
out_dir = workingDir + "/annotationFiles/precomputed/" # workspace dir altındaki precomputedannotation folder ı olacak fixed
hgVersion = sys.argv[1]
dbTypes = sys.argv[2] # arayüzde kullanıcının seçeceği db listesi (checkboxlarda işaretlediği dblerin value su annovardakiyle aynı olsun örn: clinvar_20210501, cosmic70, nci60, icgc28)
dbType_list= dbTypes.split(",")
print(dbType_list)
print(hgVersion)


threads = []
for i in range(len(dbType_list)):
    print("downloading", dbType_list[i])
    thread = threading.Thread(target=annovarDownDb, args=(annovar_dir, hgVersion, dbType_list[i], out_dir,))
    threads.append(thread)
    thread.start()

for thread in threads:
    print("finish downloading")
    thread.join()

for dbType in dbType_list:
    print("parsing",dbType)
    infile = os.path.join(out_dir, hgVersion + "_" + dbType + ".txt")
    outfile = os.path.join(out_dir, dbType.split("_")[0] + "_" + hgVersion + ".bed")
    if(dbType.startswith("clinvar")):
        parseClinvar(infile, outfile)
    elif(dbType.startswith("cosmic")):
        parseCosmic(infile, outfile)
    elif(dbType.startswith("icgc")):
        parseIcgc(infile, outfile)
    elif(dbType.startswith("nci")):
        parseNci(infile, outfile)

for filename in os.listdir(out_dir):
    f = os.path.join(out_dir, filename)
    if os.path.isfile(f) and f.endswith(".bed"):
        print("bgzip starts")
        bgzipCmd = "bgzip -@ " + str(os.cpu_count()) + " " + f
        bgzipArgs = shlex.split(bgzipCmd)
        subprocess.run(bgzipArgs, cwd=out_dir)
        print("tabix starts")
        tabixCmd = "tabix -p bed " + f + ".gz"
        tabixArgs = shlex.split(tabixCmd)
        subprocess.run(tabixArgs, cwd=out_dir)