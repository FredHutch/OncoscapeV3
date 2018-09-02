"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ToLowerCase_1 = require("./transform/ToLowerCase");
const InterfacesAndEnums_1 = require("./InterfacesAndEnums");
const hl = __importStar(require("highland"));
const fs = __importStar(require("fs"));
const csv = __importStar(require("fast-csv"));
class IO {
    static ReadEventFiles(path) {
        return new Promise((resolve, reject) => {
            fs.readdir(path, (err, files) => {
                resolve(files.filter(v => v.indexOf('event') === 0));
            });
        });
    }
    static ReadMutationFiles(path) {
        return new Promise((resolve, reject) => {
            fs.readdir(path, (err, files) => {
                resolve(files.filter(v => v.indexOf('mutation') === 0));
            });
        });
    }
    static ReadMatrixFiles(path) {
        return new Promise((resolve, reject) => {
            fs.readdir(path, (err, files) => {
                resolve(files.filter(v => v.indexOf('matrix') === 0));
            });
        });
    }
    static ReadJson(path, file) {
        return JSON.parse(fs.readFileSync(path + file, 'UTF8'));
    }
    static ReadZips() {
        return fs.readdirSync('./src/output/').filter(v => v.endsWith('.gz'));
    }
    static ReadMutations() {
        const file = fs.readFileSync('./src/ref/mutations.json', 'UTF8');
        const json = JSON.parse(file);
        return json;
    }
    static ReadMutationIdMap() {
        const file = fs.readFileSync('./src/ref/mutations.json', 'UTF8');
        const json = JSON.parse(file);
        var x = 1;
        return json.reduce((p, c) => {
            x += x;
            p[c] = x;
            return p;
        }, {});
    }
    static DeleteArtifacts() {
        return new Promise((resolve, reject) => {
            fs.readdir('./src/output/', (err, files) => {
                const filesToDelete = files.filter(v => !v.endsWith('.gz') && !v.endsWith('.md'));
                filesToDelete.forEach(v => {
                    fs.unlinkSync('./src/output/' + v);
                });
                resolve();
            });
        });
    }
    static ReadGenes() {
        const file = fs.readFileSync('./src/ref/hgnc.json', 'UTF8');
        const json = JSON.parse(file);
        return json;
    }
    /**
     * Takes the result of a stream of value objects, transposes the object and properties and wraps in a TestVO
     * @param inputStream
     * @param omitFields Fields not to include in the transpose
     */
    static loadMetadata(inputStream, omitFields) {
        const omit = new Set(omitFields.map(v => v.trim().toLowerCase()));
        return new Promise((resolve, reject) => {
            inputStream
                .filter(v => {
                // Remove Items With Errors
                return v.error.length === 0;
            })
                .reduce({}, (meta, obj) => {
                Object.keys(obj.data)
                    .filter(prop => !omit.has(prop))
                    .forEach(prop => {
                    const value = obj.data[prop];
                    if (!meta.hasOwnProperty(prop)) {
                        meta[prop] = new Set();
                    }
                    meta[prop].add(value.trim().toLowerCase());
                });
                return meta;
            })
                .toArray(result => {
                const testVos = Object.keys(result[0])
                    .filter(v => !omit.has(v))
                    .map(v => ({
                    data: {
                        name: v,
                        label: v,
                        values: Array.from(result[0][v]),
                        distribution: null,
                        type: InterfacesAndEnums_1.eDataType.NA
                    },
                    error: [],
                    info: []
                }));
                resolve(hl.default(testVos));
            });
        });
    }
    /**
     * Loads A CSV File Into a Highland Stream, Converts Content To LowerCase,
     * Transforms Each Row Into A Object Wrapped In TestVo
     *
     * @param uri Location Of File
     * @api public
     */
    static loadCsv(uri) {
        return hl
            .default(fs
            .createReadStream(uri)
            .pipe(new ToLowerCase_1.TransformToLowerCase())
            .pipe(csv.default({ headers: true, ignoreEmpty: true, discardUnmappedColumns: true, strictColumnHandling: false, trim: true, objectMode: true })))
            .map((obj) => {
            return { data: obj, info: [], error: [] };
        });
    }
    /**
     *
     * @param uri File Name For Output
     * @param inputStream Stream to extract the
     */
    static WriteLog(uri, inputStream) {
        return new Promise((resolve, reject) => {
            const outputStream = fs.createWriteStream('./src/output/' + uri);
            outputStream.write('[');
            outputStream.on('finish', () => resolve());
            inputStream
                .filter(v => v.error.length !== 0 || v.info.length !== 0)
                .map(v => JSON.stringify(v))
                .intersperse(',')
                .append(']')
                .pipe(outputStream);
        });
    }
    static WriteProperty(uri, inputStream, prop) {
        return new Promise((resolve, reject) => {
            prop = prop.toLowerCase().trim();
            const outputStream = fs.createWriteStream('./src/output/' + uri);
            outputStream.on('finish', () => resolve());
            outputStream.write('[');
            inputStream
                .filter(v => v.error.length === 0)
                .map(v => JSON.stringify(v.data[prop]))
                .intersperse(',')
                .append(']')
                .pipe(outputStream);
        });
    }
    static WriteMeta(uri, inputStream) {
        return new Promise((resolve, reject) => {
            const outputStream = fs.createWriteStream('./src/output/' + uri);
            outputStream.on('finish', () => resolve());
            outputStream.write('[');
            inputStream
                .filter(v => v.error.length === 0)
                .filter(v => v.data.type !== InterfacesAndEnums_1.eDataType.ID)
                .map(v => {
                const obj = {};
                obj[v.data.name] = v.data.type === InterfacesAndEnums_1.eDataType.Number ? v.data.values : v.data.values.string;
                return JSON.stringify(obj);
            })
                .intersperse(',')
                .append(']')
                .pipe(outputStream);
        });
    }
    static WriteEvent(uri, inputStream) {
        return new Promise((resolve, reject) => {
            const outputStream = fs.createWriteStream('./src/output/' + uri);
            outputStream.on('finish', () => resolve());
            outputStream.write('[');
            inputStream
                .filter(v => v.error.length === 0)
                .map(v => {
                return JSON.stringify(v);
            })
                .intersperse(',')
                .append(']')
                .pipe(outputStream);
        });
    }
    static WriteMutation(uri, inputStream) {
        return new Promise((resolve, reject) => {
            const outputStream = fs.createWriteStream('./src/output/' + uri);
            outputStream.on('finish', () => resolve());
            outputStream.write('[');
            inputStream
                .filter(v => v.error.length === 0)
                .map(v => {
                return JSON.stringify(v);
            })
                .intersperse(',')
                .append(']')
                .pipe(outputStream);
        });
    }
    static WriteMatrix(uri, inputStream) {
        return new Promise((resolve, reject) => {
            const outputStream = fs.createWriteStream('./src/output/' + uri);
            outputStream.on('finish', () => resolve());
            outputStream.write('[');
            inputStream
                .filter(v => v.error.length === 0)
                .map(v => JSON.stringify(v))
                .intersperse(',')
                .append(']')
                .pipe(outputStream);
        });
    }
    static WriteString(uri, content) {
        return new Promise((resolve, reject) => {
            fs.writeFileSync('./src/output/' + uri, content);
            resolve();
        });
    }
    static WriteJson(uri, inputStream) {
        return new Promise((resolve, reject) => {
            const outputStream = fs.createWriteStream('./src/output/' + uri);
            outputStream.on('finish', () => resolve());
            outputStream.write('[');
            inputStream
                .filter(v => v.error.length === 0)
                .map(v => JSON.stringify(v))
                .intersperse(',')
                .append(']')
                .pipe(outputStream);
        });
    }
}
exports.IO = IO;
//# sourceMappingURL=IO.js.map