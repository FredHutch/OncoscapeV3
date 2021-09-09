import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter, OnInit,
  Output,
  Renderer,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';
import {MatStepper} from '@angular/material';
import { Http, Headers } from '@angular/http';
import { S3 } from 'aws-sdk';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import { environment } from '../../../../environments/environment';

import { TemplateRef } from '@angular/core';

declare var $: any;



export class OncoscapeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

export class UploadFeedback {
  public success: boolean = false;
  public errorAsEnglish:string;
  public stateRecord:any;
}

@Component({
  selector: 'app-workspace-upload-panel',
  templateUrl: './upload-panel.component.html',
  styleUrls: ['./upload-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class UploadPanelComponent {
  @ViewChild('fileInput')
  fileInput: ElementRef;

  @ViewChild('stepper') stepper: MatStepper;

  formGroup: FormGroup;
  step2DefaultText:string = "Step 2: Select Your .zip Data File";
  accessOption = 'private';
  datasets = [];
  reviewTypes = ['IRB', 'IEC', 'Exempt With Waiver', 'Exempt'];
  speciesTypes = ['Human', 'C. elegans', 'Dog', 'Fruit Fly', 'Mouse', 'Rat', 'Yeast', 'Zebra Fish', 'Other'];
  siteTypes = ['-Other-', 	'Acute Myeloid Leukemia (LAML)', 	'Adrenocortical carcinoma (ACC)', 	'Bladder Urothelial Carcinoma (BLCA)', 	'Brain Lower Grade Glioma (LGG)', 	'Breast invasive carcinoma (BRCA)', 	'Cervical squamous cell carcinoma and endocervical adenocarcinoma (CESC)', 	'Cholangiocarcinoma (CHOL)', 	'Chronic Myelogenous Leukemia (LCML)', 	'Colon adenocarcinoma (COAD)', 	'Controls (CNTL)', 	'Esophageal carcinoma (ESCA)', 	'FFPE Pilot Phase II (FPPP)', 	'Glioblastoma multiforme (GBM)', 	'Head and Neck squamous cell carcinoma (HNSC)', 	'Kidney Chromophobe (KICH)', 	'Kidney renal clear cell carcinoma (KIRC)', 	'Kidney renal papillary cell carcinoma (KIRP)', 	'Liver hepatocellular carcinoma (LIHC)', 	'Lung adenocarcinoma (LUAD)', 	'Lung squamous cell carcinoma (LUSC)', 	'Lymphoid Neoplasm Diffuse Large B-cell Lymphoma (DLBC)', 	'Mesothelioma (MESO)', 	'Miscellaneous (MISC)', 	'Ovarian serous cystadenocarcinoma (OV)', 	'Pancreatic adenocarcinoma (PAAD)', 	'Pheochromocytoma and Paraganglioma (PCPG)', 	'Prostate adenocarcinoma (PRAD)', 	'Rectum adenocarcinoma (READ)', 	'Sarcoma (SARC)', 	'Skin Cutaneous Melanoma (SKCM)', 	'Stomach adenocarcinoma (STAD)', 	'Testicular Germ Cell Tumors (TGCT)', 	'Thymoma (THYM)', 	'Thyroid carcinoma (THCA)', 	'Uterine Carcinosarcoma (UCS)', 	'Uterine Corpus Endometrial Carcinoma (UCEC)', 	'Uveal Melanoma (UVM)'];
  showReviewNumber = true;
  matcher = new OncoscapeErrorStateMatcher();

  uploadFeedbackVisible: boolean = false;

  @Output()
  hide = new EventEmitter<any>();

  stepIndex_IAccept:number = 0;
  stepIndex_SelectDataFile:number = 1;
  stepIndex_Annotate:number = 2;
  stepIndex_Process:number = 3;

  disableUploadButton:boolean = false;
  lastStatusCode:string = '';
  lastErrorFree:boolean = null;  
  allStudies:any = {};

  getMyUserId() {
    let email = window['storedAuthBits'].email; 
    return email;
  }

  getMyToken() {
    let zagerToken = window['storedAuthBits'].idToken.getJwtToken();
    return zagerToken;
  }

  isMJ(aContext:string) {
    console.log(`In test for isMJ, context=${aContext}.`);
    let email = this.getMyUserId();
    console.log(`In test for isMJ, email=${email}.`);
    return email && (email.toLowerCase() === 'mnjensen@fredhutch.org') && (environment.envName.toLowerCase()==='dev');
  }

  composeFeedbackDetails(feedback:UploadFeedback):string {
    let s:string = '<p>&nbsp;</p>';
    if (feedback.success) {
      s = s +'Congratulations, your data set "' + feedback.stateRecord.datasetName + '" has been uploaded and validated.';
    } else {
      //s = s + 'There was an error in the "' + feedback.stateRecord.statusCode +'" phase.<p />Error: ' + feedback.errorAsEnglish;
      s = s + feedback.errorAsEnglish;
      s = s + "<p> </p>";
      s = s + "<p><hr></p><B>What to do next?</b> You can try fixing your original files, rezipping them using the <b>same .zip filename</b>, and clicking the Upload button again. If you want to use a zip file with a different name, go back to Step 2, above.  Email <a href='mailto:contact@oncoscape.org'>contact@oncoscape.org</a> for help." ;
    }
    return s;
  }

  composeFeedbackTitle(feedback:UploadFeedback):string {
    let s:string = '';
    if (feedback.success) {
      s = s + '<mat-icon class="mat-icon notranslate material-icons mat-icon-no-color ng-star-inserted" role="img" aria-hidden="true">check</mat-icon>';
      s = s + '&nbsp;&nbsp;';
      s = s + 'Success Importing "' + feedback.stateRecord.datasetName + '".';
    } else {
      s = s + '<mat-icon class="mat-icon notranslate material-icons mat-icon-no-color ng-star-inserted" role="img" aria-hidden="true">error</mat-icon>';
      s = s + '&nbsp;&nbsp;';
      s = s + 'Error Importing "' + feedback.stateRecord.datasetName + '".';
    }
    return s;
  }

  testPopulate() {
    this.formGroup.patchValue({'name': 'Placeholder Title'});
    this.formGroup.patchValue({'description': 'A placeholder desc.'});
    this.formGroup.patchValue({'reviewType': 'IRB'});
    this.formGroup.patchValue({'reviewNumber': '123456'});
    this.formGroup.patchValue({'site': 'Other'});
    this.formGroup.patchValue({'institution': 'Fred Hutch'});
    this.formGroup.patchValue({'lab': 'STTR'});
    this.formGroup.patchValue({'contactName': 'Matt Jensen'});
    this.formGroup.patchValue({'contactEmail': 'mnjensen@fredhutch.org'});
    this.formGroup.patchValue({'contactPhone': '206 667 7995'});
    this.formGroup.patchValue({'contactAllow': true});
    this.formGroup.patchValue({'species': 'Human'});
    this.formGroup.patchValue({'permissions': 'private'});
    console.log('Populated with test data.');    
  }

  processIAccept() {
    // TBD: Log the click to DynamoDB.
    console.log('User clicked "I Accept". TBD: log it.');
    this.stepper.steps['_results'][this.stepIndex_IAccept].completed = true;
    this.stepper.selectedIndex = this.stepIndex_SelectDataFile;
  }

  hideUploadFeedback(): void {
    // console.log('MJ Hiding feedback panel from within upload panel. TBD: Do it the Angular way. MJ');
    this.manuallyHideUploadFeedback();
    let self = this;
    if (this.lastErrorFree) {
      window.setTimeout(function(){self.closeClick();}, 200);
    } else {
      //alert('Error. TBD: reset the step.');
      this.setProgressIcon('Uploading', 'unstarted');
      this.setProgressIcon('Validating', 'unstarted');
      this.setProgressIcon('Converting', 'unstarted');
      this.setProgressIcon('Finalizing', 'unstarted');
      //window.setTimeout(function(){self.disableUploadButton = false;}, 300);

      let s = "<B>What to do next?</b> You can try fixing your original files, rezipping them using the <b>same .zip filename</b>, and clicking the Upload button again.";
      document.getElementById('feedbackAfterError')['innerHTML'] = s;
      self.disableUploadButton = false;
      this.stepper.steps['_results'][this.stepIndex_Process].completed = false;
      this.stepper.selectedIndex = this.stepIndex_Process;
      
    }
  }


  manuallyShowUploadFeedback(feedback:UploadFeedback) {
    this.uploadFeedbackVisible = true;
    console.log(Date.now() + ' Show');
    let self = this;
    window.setTimeout(function(){self.delayedManuallyShowUploadFeedback(feedback);}, 700);
  }

  delayedManuallyShowUploadFeedback(feedback:UploadFeedback) {
    document.getElementById('uploadFeedbackDetails')['innerHTML'] = this.composeFeedbackDetails(feedback);
    document.getElementById('uploadFeedbackTitle')['innerHTML'] = this.composeFeedbackTitle(feedback);
    document.getElementsByTagName("APP-WORKSPACE-UPLOAD-FEEDBACK-PANEL")[0]['style']['display'] = "block";
  }

  manuallyHideUploadFeedback() {
    console.log(Date.now() + ' Hide');
    let self = this;
    window.setTimeout(function(){self.delayedManuallyHideUploadFeedback();}, 700);
  }
  delayedManuallyHideUploadFeedback() {
    if(document.getElementById('uploadFeedbackDetails')) {
      if(document.getElementsByTagName("APP-WORKSPACE-UPLOAD-FEEDBACK-PANEL").length == 1) {
        document.getElementById('uploadFeedbackDetails')['innerHTML'] = '---';
      document.getElementsByTagName("APP-WORKSPACE-UPLOAD-FEEDBACK-PANEL")[0]['style']['display'] = "none";
      }
    }
  }

  public findInvalidControls(aFormGroup: FormGroup) {
    const invalid = [];
    const controls = aFormGroup.controls;
    for (const name in controls) {
        if (controls[name].invalid) {
            invalid.push(name);
        }
    }
    return invalid;
  }

  public getReadableFileSizeString(fileSizeInBytes) {
    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
  };

  closeClick(): void {
    this.hide.emit();
  }

  uploadFile(): void {
    this.renderer.invokeElementMethod(this.fileInput.nativeElement, 'dispatchEvent', [
      new MouseEvent('click', { bubbles: true })
    ]);
  }

  public fileChangeEvent(fileInput: any){
    if (fileInput.target.files && fileInput.target.files[0]) {
      var reader = new FileReader();
      let self = this;
      reader.onload = function (e : any) {
          console.log('here');
          let fileChoice = document.getElementsByClassName('oncoscape-file-choice')[0];
          if (fileChoice['files']['length'] == 1) {
            let file:any = fileChoice['files'][0];
            let fileSizeStr:string = self.getReadableFileSizeString(file.size);
            console.log(`File name: ${file.name}. Size: ${fileSizeStr}.`);
            let fileDetailsDiv:any = document.getElementById('file-choice-details');
            fileDetailsDiv.innerHTML = `<div><b>Filename: ${file.name}, size: ${fileSizeStr}</b></div>`;

            self.stepper.steps['_results'][self.stepIndex_SelectDataFile].completed = true;
            self.stepper.selectedIndex = self.stepIndex_Annotate;
          } else {
            alert('ERROR: Expected to see one .zip file selected.');
          }
      }
      reader.readAsDataURL(fileInput.target.files[0]);
    }
  }

  showFailureFeedback(feedback:string){
    alert(feedback);
  }

  formValidate(): void {
    if (!this.formGroup.valid) {
      let invalidControls = this.findInvalidControls(this.formGroup);
//      this.showFailureFeedback('The form data is not valid. Did you fill out each part?');
      this.showFailureFeedback(`The following fields are empty or invalid:\n\n` +
        invalidControls.join(', '));
      return;
    }
    if (this.fileInput.nativeElement.files.length != 1) {
      this.showFailureFeedback('You need to select one .zip file.');
      return;
    }
    let fileToUpload = this.fileInput.nativeElement.files[0];
    console.log(`TEMPNOTE: fileToUpload = ${fileToUpload}.`);
    if (this.fileInput.nativeElement.files[0].name.endsWith('.zip') != 1) {
      this.showFailureFeedback('The file you selected is not a .zip file.');
      return;
    }

    let datasetNameDisplayDiv:any = document.getElementById('dataset-name-display');
    let datasetName:string = this.formGroup.controls.name.value;
    datasetNameDisplayDiv.innerHTML = `<div><b>Dataset Name: ${datasetName}</b></div>`;

    this.stepper.steps['_results'][this.stepIndex_Annotate].completed = true
    this.stepper.selectedIndex = this.stepIndex_Process;
  }

  formSubmit(): void {
    this.disableUploadButton = true;

    // const filename = (this.formGroup.get('name').value + Date.now().toString() + '.xls').replace(/\s+/gi, '');
    const filename = this.formGroup.get('name').value.replace(/\s+/gi, '');

    // Gistic, Copy Number, eXome Seq, Rna Seq, Meth, Proteomic, Metabolomics, Single Cell

    const dataset = {
      name: this.formGroup.get('name').value,
      description: this.formGroup.get('description').value,
      reviewType: this.formGroup.get('reviewType').value,
      reviewNumber: this.formGroup.get('reviewNumber').value,
      site: this.formGroup.get('site').value,
      institution: this.formGroup.get('institution').value,
      lab: this.formGroup.get('lab').value,
      contactName: this.formGroup.get('contactName').value,
      contactEmail: this.formGroup.get('contactEmail').value,
      contactPhone: this.formGroup.get('contactPhone').value,
      contactAllow: this.formGroup.get('contactAllow').value,
      species: this.formGroup.get('species').value,
      //permissions: this.formGroup.get('permissions').value,
      file: filename,
      status: 'pending'
    };

    // const formData = new FormData();
    // formData.append('zipWHAT VAR SHOULD THIS BE', this.fileInput.nativeElement.files[0]);
    // formData.append('data', JSON.stringify(dataset));

    // const headers = new Headers({
    //   'Content-Type': 'multipart/form-data',
    //   Accept: 'application/json'
    // });

    // this.http
    //   .post('https://oncoscape.v3.sttrcancer.org/dataset', formData, {
    //     headers: headers
    //   })
    //   .toPromise()
    //   .then(v => {})
    //   .catch(e => {
    //     const z = e;
    //   });

    // Call initiator from the Client Upload App
    console.log("MJ About to fire s3add...");
    let theFile:any = this.fileInput.nativeElement.files[0];
    console.log(`MJ file info: ${JSON.stringify(theFile)}`);
    this.s3add(theFile, dataset);
    console.log("MJ After firing s3add.");
  }


  _requestInit = null;
  requestInit = (token): RequestInit => {
    if (!this._requestInit) {
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Accept-Encoding', 'gzip');
      if (token !== '') {
        headers.append('zager', token);
      }
      this._requestInit = {
        method: 'GET',
        headers: headers,
        mode: 'cors',
        cache: 'default'
      };
    }
    
    return this._requestInit;
  };
  
  // tryLoadingSignedFile(aToken) {
  //   const input:RequestInfo = 'https://oncoscape-privatedata-dev.s3-us-west-2.amazonaws.com/converted/mnjensen%40fredhutch.org/ucec_msk_2018.zip_2019-10-22T18-09-07.87_2976/final/manifest.json.gz';
  //   const inputParts:Array<string> = input.toString().split('/');
  //   const filename:string = inputParts[inputParts.length-1]; // e.g., manifest.json.gz
  //   const itemId:string = inputParts[inputParts.length-3]; //  e.g., ucec_msk_2018.zip_2019-10-22T18-09-07.87_2976
  //   const user:string = decodeURIComponent(inputParts[inputParts.length-4]); // mnjensen%40fredhutch.org, convert o @
  //   const env = environment.envName;

  //   let signRequest = `https://jwjvsfcl6c.execute-api.us-west-2.amazonaws.com/${env.toLocaleUpperCase()}/onco-private-dev-getsignedurl?` +
  //   `user=${user}&environment=${env}&itemId=${itemId}&filename=${filename}`;
  //   console.log(`The signRequest = ${signRequest}!`);
  //   let initCopy = this.requestInit(aToken); // init;
  //   let signedUrlPromise =  fetch(signRequest, initCopy);
  //   signedUrlPromise.then((signResult:any) => {
  //     // console.log('MJ before signresult.json'); 

  //     return signResult.json();
  //   }).then(function(body) {
  //     // console.log('MJ body = ' + JSON.stringify(body)); 
  //     // let newInit = requestInit('');
  //     // // console.log('MJ newInit = ' + JSON.stringify(newInit)); 
  //     let gg = fetch(body.signedUrl).then((q) => { // was initCopy, or newInit
  //       console.log('inside q.');
  //       console.log(JSON.stringify(q));
  //       console.log('---done with q---');
  //       return q.json();
  //     }).then((qResult) => {
  //       console.log('got to qResult');
  //       console.log(`qResult = [${JSON.stringify(qResult)}]!`);``
  //     }).catch((err) => {
  //       console.log('FAILED to fetch.');
  //       console.log('ERR = ' + JSON.stringify(err));
  //     });
  //   });    
  // }

credentialsUrl = 'https://jwjvsfcl6c.execute-api.us-west-2.amazonaws.com/DEV/onco_private_dev_upload'; //'/s3_credentials';
finalDesiredStatus = 'converted';

getSetsUrlBase() {
  return `https://jwjvsfcl6c.execute-api.us-west-2.amazonaws.com/${environment.envName.toUpperCase()}/onco-private-${environment.envName}-getsets`;
}

reportProgress(progressString){
  let oldText = $("textarea#uploadFeedbackTextarea").val();
  let d = new Date();
  let newText = d.toISOString() + '  ' + progressString + "\r\n" + oldText;
  $("textarea#uploadFeedbackTextarea").val(newText);
  console.log(Date.now() + ' ' + progressString);
}


getStageIcon(stageState) {
  switch (stageState) {
    case 'active':
      return "fa fa-refresh fa-spin";
      break;
    case 'success':
      return "fa fa-check";
      break;
    case 'failure':
      return "fa fa-exclamation-circle";
      break;
    default: // unstarted
      return "fa fa-ellipsis-h";
  }
}

getStageColor(stageState) {
  switch (stageState) {
    case 'active':
      return "green";
      break;
    case 'success':
      return "green";
      break;
    case 'failure':
      return "red";
      break;
    default: // unstarted
      return "lightgray";
  }
}

// stageName = Uploading|Validating|Converting|Finalizing
// stageState = unstarted|active|success|failure
setProgressIcon(stageName, stageState){
  if(stageName === 'Converting'){
    console.log('For converting, state=' + stageState);
  }
  let stageIcon = this.getStageIcon(stageState);
  let stageColor = this.getStageColor(stageState);

  $('#stage' + stageName +'Progress').removeClass();
  $('#stage' + stageName +'Progress').addClass(stageIcon);
  $('#stage' + stageName +'Progress').css('color', stageColor);
  if (stageState === 'unstarted') {
    $('#stage' + stageName ).css('color', 'lightgray');
  } else {
    $('#stage' + stageName ).css('color', 'gray');
  }
}

iconStringForDataset(set, iconSize){
  // console.log('Testing upload date, = ' + new Date(set.uploadDate).toISOString() + '  ' + set.errorFree + ', ' + set.statusCode+', '+set.itemId ); //set=' + JSON.stringify(set));
  var stageState = 'success';
  if (set.errorFree == false) {
    stageState = 'failure';
  } else {
    if (set.statusCode != this.finalDesiredStatus) {
      stageState = 'active';
    }
  }
  let stageIcon = this.getStageIcon(stageState);
  let stageColor = this.getStageColor(stageState);
  let s= '<i class="'+stageIcon+'" style="font-size:' + iconSize + 'px;color:'+stageColor+'"></i>';
  return s;
}

handleUploadResult(stateRecord){
  let feedback:UploadFeedback = new UploadFeedback();
  feedback.stateRecord = stateRecord;
  if (stateRecord.errorFree){
    feedback.success = true;
  } else {
    // $('#uploadResultModalLabel').text('Error');
    let errorAsEnglish = JSON.stringify(stateRecord.lastError);
    if (stateRecord.lastError.errors){
      if (stateRecord.lastError.errors.length>0 && stateRecord.lastError.errors[0].details) {
        errorAsEnglish = stateRecord.lastError.errors[0].details;
      }
    } else {
      errorAsEnglish = '<ul>' + errorAsEnglish.split('\\n').slice(0,8).map(e => '<li>'+e+'</li>') + '</ul>';
    }
    // $('#uploadModalBody').html('There was an error in the "' + stateRecord.statusCode +'" phase.<p />Error: ' + errorAsEnglish);
    feedback.errorAsEnglish= 'There was an error in the "' + stateRecord.statusCode +'" phase.<p />Error: ' + errorAsEnglish;
  }
  // alert(feedback);

  // console.log('MJ about to make feedbackVisible.');
  this.uploadFeedbackVisible = true;
  this.manuallyShowUploadFeedback(feedback);

}

// This function retrieves s3 parameters from our server API and appends them
// to the upload form.
s3add(theFormFile, datasetAnnotations:any) {  // e, data) {
  let self = this;
  self.setProgressIcon('Uploading', 'active');
  self.setProgressIcon('Validating', 'unstarted');
  self.setProgressIcon('Converting', 'unstarted');
  self.setProgressIcon('Finalizing', 'unstarted');

  self.reportProgress('-----');
  self.reportProgress('getting permission to upload to S3...');
  //var theFormFile = data.files[0];
  var filename = theFormFile.name;
  var contentType = theFormFile.type;
  var datasetName:string = datasetAnnotations.name;
  var datasetDescription:string = datasetAnnotations.description;
  var params = [];
  let myUserId:string = this.getMyUserId();
  let myToken:string = this.getMyToken();
  $.ajax({
    url: this.credentialsUrl,
    type: 'GET',
    dataType: 'json',
    headers: {zager: myToken},
    data: {
      filename: filename,
      content_type: contentType,
      email: myUserId,
      environment: environment.envName,
      datasetName: encodeURIComponent(datasetName),
      datasetDescription: encodeURIComponent(datasetDescription),
      datasetAnnotations: encodeURIComponent(JSON.stringify(datasetAnnotations))
    },
    success: function (s3Data) {
      // itemKey will be the internal ID for the data set for this user.
      // e.g., BareBonesCBio.zip_2019-09-19T20-40-13.06_3612,
      // extracted from uploaded/john@doe.com/DupeOfBareBonesCBio.zip_2019-09-19T20-41-36.46_5005.

      let thisUploadKey = s3Data.presignedPost.fields.key;
      let parts = thisUploadKey.split('/');
      parts.shift(); // drop state, like "uploaded".
      parts.shift(); // drop userId
      let itemKey = parts[0]; // The itemId, like ziptest.zip_2019-09-12T18-16-17.14_8166
            
      self.reportProgress('Response to sign request, error=' + s3Data.error +', key= ' + thisUploadKey);

      const formData = new FormData();
      Object.keys(s3Data.presignedPost.fields).forEach(key => {
        formData.append(key, s3Data.presignedPost.fields[key]);
      });
      // Actual file has to be appended last.
      formData.append("file", theFormFile);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", s3Data.presignedPost.url, true);
      xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
      xhr.onloadstart = function (oEvent) {
        self.reportProgress( 'onloadstart');
      };
      xhr.onerror = function (oEvent) {
        console.log(Date.now() + ' ' + 'onerror - ' + JSON.stringify(oEvent));
      }; 

      xhr.upload.onprogress = function (oEvent) {
        if (oEvent.lengthComputable) {
          var percentComplete = oEvent.loaded / oEvent.total * 100;
          self.reportProgress( percentComplete + '% complete...');
        } else {
          console.log(Date.now() + ' ' + 'FYI: Full size unknown during progress call');
        }
      };  
      xhr.onload = function (oEvent) {
        let aTarget:any = oEvent.target;
        if (aTarget.readyState == 4) { // done
          if (this.status === 204) {
            //resolve()
            self.reportProgress('upload is complete. Check status...');
            $.ajax({
              url: self.getSetsUrlBase(),
              type: 'GET',
              dataType: 'json',
              headers: {zager: myToken},
              data: {
                user: myUserId,
                environment: environment.envName
              },
              success: function(setsData){
                //reportProgress('Sets data success');
                //reportProgress('Number of datasets: ' + JSON.stringify(setsData.sets.Items.length));
                // Find record that matches itemKey
                let matches = setsData.sets.Items.filter(i => i.itemId === itemKey);
                if(matches.length !=1){
                  self.reportProgress('ERROR: could not find that key in data sets.');
                  self.setProgressIcon('Uploading', 'failure');
                  alert('ERROR: Could not find that key in datasets. Is your dataset name too long?');;
                } else {
                  let thisRecord = matches[0];
                  self.updateDatasetStatus(thisRecord, 1);
                }
              },
              error: function(data, textStatus, errorThrown) {
                self.reportProgress('Sets data error');
              }
            });

          } else {
            console.log(Date.now() + ' ' + ' done, but not 204. status = ' + this.status);

            alert('xhr failure---');
          }
        } else { // still in progress
          console.log(Date.now() + ' ' + ' readyState = ' + aTarget.readyState);
        }
      };

      xhr.send(formData);
    },
    error: function (s3Data, textStatus, errorThrown) {
      this.setProgressIcon('Uploading', 'failure');
      const errorString = 'Error = ' + s3Data.responseJSON["error"] + ". " + s3Data.responseJSON["description"]; 
      alert(errorString);
    }
  });
  return params;
};

updateDatasetStatus(stateRecord, counter) {
  let self = this;
  console.log(Date.now() + '  in updateDatasetStatus with counter ' + counter + '...');
  self.reportProgress('RECORD: ' + JSON.stringify(stateRecord));
  self.reportProgress('STATUS: ' + stateRecord.statusCode + ' ERRORFREE ' + (stateRecord.errorFree));
  let myToken:string = self.getMyToken();

  if (self.lastStatusCode != stateRecord.statusCode || this.lastErrorFree != stateRecord.errorFree) {
    // something has changed
    //self.checkStatusForUserIdInput();
    switch (stateRecord.statusCode) {
      case 'uploadRequested':
        if (stateRecord.errorFree == false) {
          self.setProgressIcon('Uploading', 'failure');
          self.handleUploadResult(stateRecord);
        }
        break;

      case 'unzipped':
        if (stateRecord.errorFree == false) {
          self.setProgressIcon('Uploading', 'failure');
          self.handleUploadResult(stateRecord);
        }
        break;

      case 'validating':
      case 'validated':
        self.setProgressIcon('Uploading', 'success');
        if (stateRecord.errorFree == false) {
          self.setProgressIcon('Validating', 'failure');
          self.handleUploadResult(stateRecord);
        } else {
          self.setProgressIcon('Validating', 'active');
        }
        break;

      case 'converting':
        self.setProgressIcon('Uploading', 'success');
        self.setProgressIcon('Validating', 'success');
        if (stateRecord.errorFree == false) {
          self.setProgressIcon('Converting', 'failure');
          self.handleUploadResult(stateRecord);
        } else {
          self.setProgressIcon('Converting', 'active');
        }
        break;

      case 'converted':
        self.setProgressIcon('Uploading', 'success');
        self.setProgressIcon('Validating', 'success');
        if (stateRecord.errorFree == false) {
          self.setProgressIcon('Converting', 'failure');
          self.handleUploadResult(stateRecord);
        } else {
          self.setProgressIcon('Converting', 'success');
          // When we do steps beyond  JSON conversion,
          // add logic for Finalizing step. For now, consider it an instant success.
          self.setProgressIcon('Finalizing', 'success');

          self.handleUploadResult(stateRecord);
        }
        break;

      default:
    }
  }
  // Update our tracking vars
  self.lastStatusCode = stateRecord.statusCode;
  self.lastErrorFree = stateRecord.errorFree;

  if (stateRecord.statusCode != self.finalDesiredStatus) {
    if (stateRecord.errorFree) {
      //      window.setTimeout(updateDatasetStatus(datasetRecord), 3000);

      $.ajax({
        url: this.getSetsUrlBase(),
        type: 'GET',
        dataType: 'json',
        headers: {zager: myToken},
        data: {
          user: stateRecord.user,
          environment: environment.envName
        },
        success: function(setsData) {
          //reportProgress('Sets data success');
          //reportProgress('Number of datasets: ' + JSON.stringify(setsData.sets.Items.length));
          // Find record that matches itemKey
          let matches = setsData.sets.Items.filter(i => i.itemId === stateRecord.itemId);
          if (matches.length != 1) {
            self.reportProgress('ERROR: could not find that key in data sets.');
          } else {
            let thisRecord = matches[0];
            window.setTimeout(function() {
              self.updateDatasetStatus(thisRecord, counter + 1);
            }, 700);

          }
        },
        error: function(data, textStatus, errorThrown) {
          self.reportProgress('Sets data error');
        }
      });

    }
  }

}

formatEpochAsLocal(e) {
  if (typeof e === 'undefined') {
    return '-';
  } else {
    let d = new Date(e);
    let tz = d.getTimezoneOffset();
    let dStr = new Date(e - (60*tz)).toISOString();
    let cleanDate = dStr.slice(0,10)+'&nbsp;'+dStr.slice(11,19);
    let nonbreakingDate = cleanDate.replace(/-/g, '&#8209;');
    return nonbreakingDate;
  }
}

numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


  constructor(fb: FormBuilder, public cd: ChangeDetectorRef, private renderer: Renderer, private http: Http) {

    this.formGroup = fb.group({
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null, [Validators.required, Validators.minLength(2)]],
      reviewType: [null, Validators.required],
      reviewNumber: [null, Validators.required],
      site: [null, Validators.required],
      lab: [null, Validators.required],
      institution: [null, Validators.required],
      contactName: [null, Validators.required],
      contactEmail: [null, [Validators.required, Validators.email]],
      contactPhone: [null, [Validators.required,Validators.pattern("^(?:[^a-zA-Z]*){9}$")]],
      contactAllow: [true, Validators.required],
      species: [null, Validators.required]
    });

    // this.formGroup.get('reviewType').valueChanges.subscribe((mode: string) => {
    //   const reviewNumberControl = this.formGroup.controls['reviewNumber'];
    //   if (mode === 'Exempt') {
    //     reviewNumberControl.clearValidators();
    //     this.showReviewNumber = false;
    //   } else {
    //     reviewNumberControl.setValidators([Validators.required]);
    //     this.showReviewNumber = true;
    //   }
    //   reviewNumberControl.updateValueAndValidity();
    // });
  }
}


