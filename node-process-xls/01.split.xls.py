
import xlsx2csv
from openpyxl import load_workbook
import sys


# file = 'D.xlsx'
file = sys.argv[1]

wb = load_workbook(filename=file, read_only=True)
sheetNames = wb.sheetnames
converter = xlsx2csv.Xlsx2csv(file, sheetid=0, outputencoding='utf-8')
del wb


    
for idx, sheetName in enumerate(sheetNames):
    print sheetName, idx
    converter.convert('data/' + sheetName + '.csv', sheetid=idx)


# from openpyxl import load_workbook
# import subprocess
# import os
# # wb = load_workbook(filename='GBM-LGG.xlsx')
# wb = load_workbook(filename=sys.argv[1], read_only=True)
# # wb = load_workbook(filename='uploading_demo.xlsx', read_only=True)
# sheetNames = wb.sheetnames;

# for sheetName in sheetNames:
#     print('***')
#     print(sheetName)
#     command_string = "xlsx2csv D.xlsx -n " + sheetName + " > data/" + sheetName + ".csv"
#     os.system(command_string)
#     # print subprocess.check_call(['ls', '-l'])       


