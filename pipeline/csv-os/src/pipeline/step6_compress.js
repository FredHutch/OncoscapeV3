"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IO_1 = require("./IO");
var fs = require('fs');
var zlib = require('zlib');
class WriteZips {
    static All() {
        return new Promise((resolve, reject) => {
            const files = IO_1.IO.ReadJson('./src/output/', 'manifest.json')
                .files.map((v) => v.file)
                .concat(['manifest.json', 'log.json']);
            Promise.all(files.map((file) => {
                return new Promise((resolve, reject) => {
                    var gzip = zlib.createGzip({ level: 9 });
                    var rstream = fs.createReadStream('./src/output/' + file);
                    var wstream = fs.createWriteStream('./src/output/' + file + '.gz');
                    rstream // reads from myfile.txt
                        .pipe(gzip) // compresses
                        .pipe(wstream) // writes to myfile.txt.gz
                        .on('finish', function () {
                        // finished
                        console.log('done compressing');
                        resolve();
                    });
                }).then(() => {
                    resolve();
                });
            }));
        });
    }
}
exports.WriteZips = WriteZips;
//# sourceMappingURL=step6_compress.js.map