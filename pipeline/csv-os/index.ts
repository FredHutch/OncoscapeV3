import { Deploy } from './src/pipeline/step7_deploy';
import { Xls2Csv } from './src/pipeline/step1_xls2csv';
import { Validate } from './src/pipeline/step2_validate';
import { WriteLog } from './src/pipeline/step3_log';
import { WriteJson } from './src/pipeline/step4_json';
import { WriteParquet } from './src/pipeline/step5_parquet';
import { WriteZips } from './src/pipeline/step6_compress';

const rimraf = require('rimraf');
// import * as fs from 'fs';
import * as fs from 'fs-extra';
import { resolve } from 'url';


class Startup {
  public static main(): number {
    fs.readdir('./src/cbio-sample-folder', (err, dirs) => {
      if(err) console.log(err);
      console.log(dirs);
      const start = async () => {
        await Promise.all(dirs.map(async (dir) => {
          fs.move('./src/cbio-sample-folder/' + dir, './src/output', { overwrite: true })
            .then(() => {
              Validate.Run().then(() => {
                WriteLog.Run().then(() => {
                  WriteJson.Run().then(v => {
                    // WriteParquet.All().then(v => {
                    WriteZips.All().then(v => {
                      Deploy.All(dir).then(() => {
                        console.log(dir, ' --- done');
                        // EXIT = true;
                        start();
                      })
                      // .catch((error) => {
                        // console.log(dir, '-- Deploy Error: ', error);
                      // });
                    })
                    // .catch((error) => {
                      // console.log(dir, '-- WriteZips Error: ', error);
                    // });
                    // });
                  })
                  // .catch((error) => {
                    // console.log(dir, '-- WriteJson Error: ', error);
                  // });
                })
                // .catch((error) => {
                  // console.log(dir, '-- WriteWriteLogZips Error: ', error);
                // });
              })
              // .catch((error) => {
                // console.log(dir, '-- Validate Error: ', error);
              // });
          });
        }))
      }
      start();
      
    });
    // Xls2Csv.Run().then(() => {
    // });
    return 0;
  }
}

Startup.main();

let EXIT = false;
function wait() {
  if (!EXIT) setTimeout(wait, 1000);
}
// wait();
