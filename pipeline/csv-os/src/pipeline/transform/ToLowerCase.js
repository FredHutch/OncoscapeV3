"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
class TransformToLowerCase extends stream_1.Transform {
    constructor() {
        super({ objectMode: true });
    }
    _transform(data, encoding, done) {
        // const trim = /((")[ ]+)|([ ]+("))/g;
        this.push(data
            .toString()
            // .replace(trim, '')
            .toLowerCase());
        done();
    }
}
exports.TransformToLowerCase = TransformToLowerCase;
//# sourceMappingURL=ToLowerCase.js.map