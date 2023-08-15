import pandas as pd
import re, sys, os
import shutil,shlex,subprocess


workingDir = sys.argv[1]

paths = sys.argv[2]
paths2= paths.split(",")
print(paths2)

f = os.path.join(workingDir + ".config/", "configPath.py")

if(not os.path.isfile(f)):
    fp = open(f, 'w')
    fp.write("mosdepth = " + "'" + paths2[0] + "'" + "\n" + "samtools = " + "'" + paths2[1] + "'" + "\n" + "annovar = " + "'" +paths2[2]+ "'" )
    fp.close()

