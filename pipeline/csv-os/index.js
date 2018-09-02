"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const step2_validate_1 = require("./src/pipeline/step2_validate");
const step3_log_1 = require("./src/pipeline/step3_log");
const step4_json_1 = require("./src/pipeline/step4_json");
const step5_parquet_1 = require("./src/pipeline/step5_parquet");
const step6_compress_1 = require("./src/pipeline/step6_compress");
class Startup {
    static main() {
        // Xls2Csv.Run().then(() => {
        step2_validate_1.Validate.Run().then(() => {
            step3_log_1.WriteLog.Run().then(() => {
                step4_json_1.WriteJson.Run().then(v => {
                    step5_parquet_1.WriteParquet.All().then(v => {
                        step6_compress_1.WriteZips.All().then(v => {
                            // Deploy.All().then(v => {
                            //   console.log('done');
                            //   EXIT = true;
                            // });
                        });
                    });
                });
            });
        });
        // });
        return 0;
    }
}
Startup.main();
let EXIT = false;
function wait() {
    if (!EXIT)
        setTimeout(wait, 1000);
}
wait();
//# sourceMappingURL=index.js.map