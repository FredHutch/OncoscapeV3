import { NullDataAction } from 'app/action/compute.action';
import { S3, EnvironmentCredentials } from 'aws-sdk';
import { environment } from './environments/environment';
import { LoaderWorkerGlobalScope } from './loader';

export class AccessS3 {

  static getMyUserId(grantee:string, owner:string) {
    if(grantee){
      return grantee;
    } else {
      return owner;
    }
  //   try{
  //   let email = 'window@noexists.error';
  //   if (window && window['storedAuthBits']) {
  //     email = window['storedAuthBits'].email;
  //   }
  //   console.log('accessS3 getMyUserId='+email)
  //   return email;
  // } catch(err){
  //   console.log('>>>EXCEPTION in getMyUserId...')
  //   console.dir(err)
  // }
  }

  // owner only used when loader is loading sets shared with us.
  public static fetchSupportingPresigned = (env: string, input: RequestInfo, initWithToken: RequestInit, fromPrivate: boolean, grantee: string, consoleContext: LoaderWorkerGlobalScope, owner: string) => {
    if (fromPrivate) {
      console.log(`fetchSupportingPresigned, owner=${JSON.stringify(owner)}.`);
      console.log(`fetchSupportingPresigned, grantee=${JSON.stringify(grantee)}.`);
      // Okay, we have been handed a long URL. 
      // We need to parse from it the components we need to pass in to 
      // an onco_privatedatasets_getsignedurl call.

      // It comes in as....
      // https://oncoscape-privatedata-dev.s3-us-west-2.amazonaws.com/converted/mnjensen%40fredhutch.org/ucec_msk_2018.zip_2019-10-22T18-09-07.87_2976/final/manifest.json.gz
      const inputParts: Array<string> = input.toString().split('/');
      console.log(`fetchSupportingPresigned, inputParts=....`);
      console.dir(inputParts)

      const filename: string = inputParts[inputParts.length - 1]; // manifest.json.gz
      const ignoreThis: string = inputParts[inputParts.length - 2]; // "final"
      const itemId: string = inputParts[inputParts.length - 3]; //  ucec_msk_2018.zip_2019-10-22T18-09-07.87_2976
      const user: string = decodeURIComponent(inputParts[inputParts.length - 4]); // mnjensen%40fredhutch.org, convert o @
      console.log(`fetchSupportingPresigned, after decodeURIComponent call.`);

      // Example:
      // "user": "mnjensen@fredhutch.org",
      // "environment": 'dev',
      // "itemId": "msk_impact_2017.zip_2019-10-22T23-09-54.73_6782",
      // "filename": "manifest.json.gz",
      let initCopy = initWithToken;

      let upperCaseEnv = env.toLocaleUpperCase();
      let signRequest = `https://jwjvsfcl6c.execute-api.us-west-2.amazonaws.com/${upperCaseEnv}/onco-private-dev-getsignedurl?` +
        `user=${encodeURIComponent(user)}&environment=${env}&itemId=${itemId}&filename=${filename}`;

      console.log(`fetchSupportingPresigned, before getMyUserId call.`);
      let myUserId = AccessS3.getMyUserId(grantee, user);
      console.log(`fetchSupportingPresigned, after getMyUserId call.`);
      if (user != myUserId) {
        console.log('=== Grantee needed for:[' + myUserId + ']')
        signRequest = signRequest + "&grantee=" + myUserId;
      } else {
        console.warn('===== GRANTEE not needed. user=me');
      }

      if (grantee) {
        signRequest = `${signRequest}&grantee=${grantee}`
      }
      initCopy.headers['zager'] = self['zagerToken']; // MJ window

      return fetch(signRequest, initCopy)
        .then((signResult: Response) => {
          return signResult.json()
            .then(function (body) {
              console.log("=== body.signedUrl = " + body.signedUrl);
              return fetch(body.signedUrl);
            });
        })
        .catch((err) => {
          console.error(`MJ private signing error is [${JSON.stringify(err)}]`);
          return Promise.reject(new Response('HTML error: ' + err.message));
        });

    } else {
      let headers = {};
      headers['Content-Type'] = 'application/json';
      headers['Accept-Encoding'] = 'gzip'; //
      headers['Access-Control-Allow-Origin'] = '*';
      headers['Access-Control-Allow-Methods'] = 'GET';
      headers['Access-Control-Allow-Headers'] = 'content-type, content-encoding';
      const requestInit: RequestInit = {
        method: 'GET',
        headers: headers,
        mode: 'cors',
        cache: 'default'
      };

      return fetch(input, requestInit);
    }
  };
}