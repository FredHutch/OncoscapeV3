"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IO_1 = require("./IO");
var fs = require('fs');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const ddb = new AWS.DynamoDB({ apiVersion: '2012-10-08' });
const uuidv1 = require('uuid/v1');
class Deploy {
    static All() {
        return new Promise((resolve, reject) => {
            IO_1.IO.DeleteArtifacts().then(() => {
                const projectId = '31-' + uuidv1().replace(/\s/gi, '');
                // const projectId = 'acsp-e484b460-a0bf-11e8-9654-2973b6f27a97';
                this.CreateDynamoRecord('michael@zager.co', projectId, 'name', 'site', 'desc', false, true, false, 'Exempt');
                this.CreateS3Bucket(projectId);
            });
        });
    }
    static CreateS3Bucket(projectId) {
        return new Promise((resolve, reject) => {
            s3.listObjectsV2({ Bucket: 'oncoscape-datasets', Delimiter: '/', Prefix: 'datasets/', EncodingType: 'url' }, (err, data) => {
                const folderNames = data.CommonPrefixes.map((v) => v.Prefix.split('/')[1]);
                if (folderNames.indexOf(projectId)) {
                    console.log('GUID ALREADY EXISTS.. This is pretty much impossible other than during testing');
                }
                const files = IO_1.IO.ReadZips();
                Promise.all(files.map((file) => {
                    return new Promise((resolve, reject) => {
                        var rstream = fs.createReadStream('./src/output/' + file);
                        var params = { Bucket: 'oncoscape-datasets', Key: 'datasets/' + projectId + '/' + file, ContentType: 'application/json', ContentEncoding: 'gzip', ACL: 'public-read', Body: rstream }; // Remove ACL For Production
                        var options = { partSize: 10 * 1024 * 1024, queueSize: 5 };
                        s3.upload(params, options, (err, data) => {
                            console.log(data.Location);
                            resolve();
                        });
                    });
                })).then(() => {
                    resolve();
                });
            });
        });
    }
    static CreateDynamoRecord(email, projectId, name, site, description, isPublic, isHuman, isPhi, reviewType, reviewNumber = 'NA', role = 'ADMIN') {
        return new Promise((reject, resolve) => {
            const ddbItem = {
                TableName: 'datasets',
                Item: {
                    email: { S: email },
                    project: { S: projectId + '|' + role },
                    status: { S: 'UPLOAD' },
                    content: { M: { site: { S: site }, name: { S: name }, description: { S: description }, isPublic: { BOOL: isPublic }, reviewType: { S: reviewType }, isHuman: { BOOL: isHuman }, isPhi: { BOOL: isPhi }, reviewNumber: { S: reviewNumber } } }
                }
            };
            ddb.putItem(ddbItem, function (err, data) {
                const d = data;
                const e = err;
                if (err) {
                    console.log('Error', err);
                }
                else {
                    console.log('Success', data);
                }
            });
        });
    }
}
exports.Deploy = Deploy;
//# sourceMappingURL=step7_deploy.js.map