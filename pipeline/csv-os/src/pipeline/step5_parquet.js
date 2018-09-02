"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const IO_1 = require("./IO");
const parquets_1 = require("parquets");
const fs_1 = __importDefault(require("fs"));
class WriteParquet {
    static All() {
        return Promise.all([this.writeMatriciesParquet(), this.writeMutationsParquet()]);
    }
    static writeMutationsParquet() {
        const writeFile = function (filename, matrix) {
            return __awaiter(this, void 0, void 0, function* () {
                var schema = new parquets_1.ParquetSchema({ sample: { type: 'UTF8' }, hgnc: { type: 'UTF8' }, value: { type: 'DOUBLE' } });
                const data = matrix.reduce((p, gene) => {
                    const hgnc = gene.data.symbol;
                    Object.keys(gene.data)
                        .filter(v => v !== 'hgnc' && v !== 'symbol')
                        .forEach(sample => {
                        const value = gene.data[sample];
                        p.push({ sample: sample, hgnc: hgnc, value: value });
                    });
                    return p;
                }, new Array());
                let file = yield parquets_1.ParquetWriter.openFile(schema, './src/output/' + filename.replace('data.raw.json', 'data.parquet'));
                for (var i = 0; i < data.length; i++) {
                    yield file.appendRow(data[i]);
                }
                yield file.close();
            });
        };
        return new Promise((resolve, reject) => {
            resolve();
        });
    }
    static writeMatriciesParquet() {
        const writeFile = function (filename, matrix) {
            return __awaiter(this, void 0, void 0, function* () {
                var schema = new parquets_1.ParquetSchema({ sample: { type: 'UTF8' }, hgnc: { type: 'UTF8' }, value: { type: 'DOUBLE' } });
                const data = matrix.reduce((p, gene) => {
                    const hgnc = gene.data.symbol;
                    Object.keys(gene.data)
                        .filter(v => v !== 'hgnc' && v !== 'symbol')
                        .forEach(sample => {
                        const value = gene.data[sample];
                        p.push({ sample: sample, hgnc: hgnc, value: value });
                    });
                    return p;
                }, new Array());
                let file = yield parquets_1.ParquetWriter.openFile(schema, './src/output/' + filename.replace('data.raw.json', 'data.parquet'));
                for (var i = 0; i < data.length; i++) {
                    yield file.appendRow(data[i]);
                }
                yield file.close();
            });
        };
        return new Promise((resolve, reject) => {
            const files = fs_1.default
                .readdirSync('./src/output')
                .filter(v => v.indexOf('matrix-') === 0)
                .filter(v => v.indexOf('raw.json') !== -1);
            const samples = IO_1.IO.ReadJson('./src/output/', 'sample.data.id.json');
            Promise.all(files.map(v => {
                const matrix = IO_1.IO.ReadJson('./src/output/', v).filter((v) => v.error.length === 0);
                return writeFile(v, matrix);
            })).then(() => {
                console.log('Write Parquet Matrix Files');
                resolve();
            });
            resolve(); // Jenny this needs to be fixed.  I put this in as a hack
        });
    }
}
exports.WriteParquet = WriteParquet;
//# sourceMappingURL=step5_parquet.js.map