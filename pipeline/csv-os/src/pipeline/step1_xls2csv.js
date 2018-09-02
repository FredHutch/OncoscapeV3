"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xlsx = __importStar(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
class Xls2Csv {
    static Run() {
        return new Promise((resolve, reject) => {
            var workbook = xlsx.readFile('./src/input/ASCp_Oncoscape_06292018.xlsx');
            Promise.all(workbook.SheetNames.map(sheetName => {
                return new Promise((resolve, reject) => {
                    const data = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName], {
                        FS: ',',
                        RS: '\n',
                        strip: true,
                        blankrows: false,
                        skipHidden: true
                    });
                    fs_1.default.writeFileSync('./src/output/' + sheetName.toLowerCase() + '.csv', data);
                    console.log('Exported CSV : ' + sheetName.toLowerCase());
                    resolve();
                });
            })).then(() => {
                resolve();
            });
        });
    }
}
exports.Xls2Csv = Xls2Csv;
//# sourceMappingURL=step1_xls2csv.js.map