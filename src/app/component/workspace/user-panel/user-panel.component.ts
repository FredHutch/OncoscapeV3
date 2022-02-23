import { environment } from "../../../../environments/environment";
import { getUserDataSets } from './../../../reducer/user.reducer';
import { DataService } from './../../../service/data.service';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { API, Auth } from 'aws-amplify';
import { PanelEnum, UserPanelFormEnum } from '../../../model/enum.model';
import { S3, CognitoIdentityCredentials } from 'aws-sdk';
import { debug } from "util";

import tippy from 'tippy.js';

@Component({
  selector: 'app-workspace-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class UserPanelComponent {
  // Public variables that can be referenced in the template
  public myDatasets: Array<any>;
  public sharedDatasets: Array<any>;
  public user: any;
  public activeForm = UserPanelFormEnum.BLANK.toString();
  public errorMessage = '';
  public formGroupSignUp: FormGroup;
  public formGroupSignUpConfirm: FormGroup;
  public formGroupSignIn: FormGroup;
  public formGroupSignInConfirm: FormGroup;
  public formGroupResendCode: FormGroup;
  public formGroupForgotPassword: FormGroup;
  public formGroupUpdatePassword: FormGroup;
  public env: string;

  @Output()
  showPanel = new EventEmitter<PanelEnum>();

  @Output()
  loadPrivate = new EventEmitter<{ bucket: string; env: string }>();


  ngAfterViewInit(): void {

    if (DataService.cognitoSessionTimeLeft() > 120) {
      this.fetchDatasetsAndShowThem();
    }
  }

  // Call this method to change the form
  setForm(form: UserPanelFormEnum): void {
    this.activeForm = form.toString();
    this.cd.detectChanges();
  }

  addDataSet(): void {
    this.showPanel.emit(PanelEnum.UPLOAD);
  }

  resendCode(): void {
    const form = this.formGroupResendCode;
    if (form.status === 'INVALID') {
      return;
    }
    Auth.resendSignUp(form.get('email').value).then(user => {
      this.setForm(UserPanelFormEnum.SIGN_UP_CONFIRM);
      this.cd.detectChanges();
    });
  }

  fetchDatasetsAndShowThem() {

    // console.log('MJ starting fetchDatasetsAndShowThem...');
    let email = window['storedAuthBits'].email;
    let zagerToken = window['storedAuthBits'].idToken.getJwtToken();
    self["zagerToken"] = zagerToken; // MJ window
    this.fetchDatasets(email, zagerToken);
    // this.setForm(UserPanelFormEnum.PROJECT_LIST);
    this.activeForm = UserPanelFormEnum.PROJECT_LIST;
    // console.log('MJ finished fetchDatasetsAndShowThem.');
  }

  signInIfNeeded(): void {
    console.log(`TEMPNOTE:L signInIfNeeded.`);
    this.signIn();
  }

  signIn(): void {
    // console.log('MJ Attempt signin...');
    const form = this.formGroupSignIn;
    if (form.status === 'INVALID') {
      // console.log('MJ Signin status is invalid.');
      return;
    }

    let storedAuthBits: any = {};
    window['storedAuthBits'] = storedAuthBits;

    Auth.signIn(form.get('email').value, form.get('password').value)
      .then(cognitoUser => {
        this.user = cognitoUser;
        // console.log('MJ Signin success, now get session.');
        const a = Auth.currentSession().then(v => {
          storedAuthBits.email = form.get('email').value;
          console.log(`MJ signed in as ${storedAuthBits.email}`);
          storedAuthBits.idToken = v.getIdToken();
          storedAuthBits.accessToken = v.getAccessToken();
          storedAuthBits.refreshToken = v.getRefreshToken();
          storedAuthBits.cognitoUser = cognitoUser;

          this.fetchDatasetsAndShowThem();
          // let zagerToken = v.getIdToken().getJwtToken();
          // self["zagerToken"] = zagerToken; // MJ window
          // this.fetchDatasets(form.get('email').value, zagerToken);
          // this.setForm(UserPanelFormEnum.PROJECT_LIST);

          const auth = Auth;
          const s3 = S3;

          const c = new s3();
          c.config.update({
            credentials: new CognitoIdentityCredentials(
              {
                IdentityPoolId: 'us-west-2:109beda4-7960-4451-8697-bbbbfb0278ea',
                Logins: {
                  'cognito-idp.us-west-2.amazonaws.com/us-west-2_09KsqtrrT': v.getIdToken().getJwtToken()
                }
              },
              { region: 'us-west-2' }
            )
          });
          c.config.credentials['get'](v => {
            if (v != null) {
              console.log(`MJ In cred debug.`);
              console.log(`MJ ${JSON.stringify(v)}`);
            }
          });

          // debugger;
          // const params = {
          //   Bucket: 'oncoquery',
          //   Key: 'test.parquet',
          //   ExpressionType: 'SQL',
          //   Expression: 'SELECT * FROM S3Object LIMIT 5',
          //   InputSerialization: {
          //     CSV: {
          //       FileHeaderInfo: 'USE',
          //       RecordDelimiter: '\n',
          //       FieldDelimiter: ','
          //     }
          //   },
          //   OutputSerialization: {
          //     CSV: {}
          //   }
          // };

          // c.selectObjectContent(params, (err, data) => {
          //   // debugger;
          //   if (err) {
          //     console.log(err.name);
          //     return;
          //   }
          //   const events = data.Payload;
          //   console.log(events);
          // });
        });
      })
      .catch(err => {
        // alert(err.message);
        console.error(`Signin failed., err = ${JSON.stringify(err)} `);
        this.errorMessage = err.message;
        this.cd.detectChanges();
      });
  }

  signUp(): void {
    const form = this.formGroupSignUp;
    // console.log('MJ signUp 1 ');
    if (form.status === 'INVALID') {
      return;
    }
    // console.log('MJ signUp 2 ');
    Auth.signUp({
      username: form.get('email').value,
      password: form.get('password').value,
      attributes: {
        'custom:mailinglist': 'No', // MJ TODO: fix this. Control value is null, throwing.form.get('mailinglist').value.toString(),
        'custom:firstname': form.get('firstName').value,
        'custom:lastname': form.get('lastName').value
      }
    })
      .then(user => {
        // console.log('MJ signUp 3. Got a signup user object.');
        // console.log('MJ signUp 4. user = ' + JSON.stringify(user) +'!');
        this.setForm(UserPanelFormEnum.SIGN_UP_CONFIRM);
        // console.log('MJ signUp 5');
        this.cd.detectChanges();
        // console.log('MJ signUp 6');
      })
      .catch(err => {
        // alert(err.message);
        // console.log('MJ signUp 7');
        this.errorMessage = err.message;
        this.cd.detectChanges();
      });
  }

  signUpConfirm(): void {
    // console.log('MJ singUpConfirm  1 ');
    const form = this.formGroupSignUpConfirm;
    if (form.status === 'INVALID') {
      return;
    }
    Auth.confirmSignUp(form.get('email').value, form.get('code').value)
      .then(data => {
        alert('Congratulations, your account has been set up. You can now upload your own data set if you want to.');
        this.activeForm = UserPanelFormEnum.PROJECT_LIST;
        this.cd.detectChanges();
      })
      .catch(err => {
        // alert(err.message);
        this.errorMessage = err.message;
        this.cd.detectChanges();
      });
  }

  forgotPassword(): void {
    const form = this.formGroupForgotPassword;
    if (form.status === 'INVALID') {
      return;
    }
    Auth.forgotPassword(form.get('email').value)
      .then(data => {
        // alert('Password sent');
        // const user = { username: form.get('email').value };
        this.setForm(UserPanelFormEnum.UPDATE_PASSWORD);
        this.cd.detectChanges();
      })
      .catch(err => {
        const errMsg = err.message.replace('Username', 'Email').replace('username', 'email');
        // alert(errMsg);
        this.errorMessage = errMsg;
        this.cd.detectChanges();
      });
  }

  updatePassword(): void {
    const form = this.formGroupUpdatePassword;
    Auth.forgotPasswordSubmit(form.get('email').value, form.get('code').value, form.get('password').value)
      .then(data => {
        this.setForm(UserPanelFormEnum.SIGN_IN);
      })
      .catch(err => {
        this.errorMessage = err.message;
        this.cd.detectChanges();
      });
  }

  getMyUserId() {
    let email = window['storedAuthBits'].email; 
    return email;
  }

  composeDatasetTooltip(option): string {
    let infoStr: string = 'unknown';
    if (option.studyDetails.studyFileStructure == null) {
      infoStr = '[Missing studyFileStructure]'
    } else {
      let numPatients: number = option.studyDetails.numPatients ? option.studyDetails.numPatients : 0;
      let numSamples: number = option.studyDetails.numSamples ? option.studyDetails.numSamples : 0;
      let numEvents: number = option.studyDetails.numEvents ? option.studyDetails.numEvents : 0;
      let name: string = option.studyDetails.studyFileStructure.study.name;
      if (option.datasetAnnotations) { name = option.datasetAnnotations.name; }
      let description: string = option.studyDetails.studyFileStructure.study.description;
      if (option.datasetAnnotations) { description = option.datasetAnnotations.description; }
      let ownerFromProject = option.project.split('|')[1];  // project is "Filename.zip|joe@company.com"
      let ownerBlurb ='';
      if(ownerFromProject != this.getMyUserId()){
        ownerBlurb =`<b>Owner:</b> ${ownerFromProject}<br />`;
      }
      infoStr = ownerBlurb +
        `<b>Name:</b> ${name}<br />` +
        `<b>Patients:</b> ${numPatients}, <b>Samples:</b> ${numSamples},  <b>Clinical Events:</b> ${numEvents}.` +
        `<hr>` +
        //    `<b>Description:</b> ${option.studyDetails.studyFileStructure.study.description}` +
        `<b>Description:</b> ${description}` +
        `<hr>` +
        `<b>Uploaded File:</b> ${option.project.split('|')[0]}` +
        '';
    }
    // `Patients: ${option.studyDetails.numPatients}, Samples: ${option.studyDetails.numSamples}.  ` +
    // ` ${option.studyDetails.studyFileStructure.study.description}`;

    return infoStr;
  }

  hasSharedDatasets(){
    if (this.sharedDatasets){
      return this.sharedDatasets.length > 0
    } else {
      console.warn('hasSharedDatasets says sharedDatasets is null.')
      return false;
    }
  }

  showInfoDataset(option): void {
    let ownerBlurb = '';
    let ownerFromProject = option.project.split('|')[1];  // project is "Filename.zip|joe@company.com"
    if(ownerFromProject != this.getMyUserId()){
      ownerBlurb =`<b>Owner:</b> ${ownerFromProject}<br />`;
    }

    let infoStr: string = ownerBlurb +
      `<b>Name:</b> ${option.datasetAnnotations.name ? option.datasetAnnotations.name : option.studyDetails.studyFileStructure.name}` +
      `Patients: ${option.studyDetails.numPatients}, Samples: ${option.studyDetails.numSamples}.\n` +
      `----------------\n` +
      //    `Description: ${option.studyDetails.studyFileStructure.study.description}\n` +
      `Description: ${option.datasetAnnotations.description ? option.datasetAnnotations.description : option.studyDetails.studyFileStructure.description}\n` +
      `----------------\n` +
      `Uploaded File: ${option.project.split('|')[0]}\n` +
      '';
    alert(infoStr);
    console.log(`MJ show info ${JSON.stringify(option)}`);
  }

  loadDataset(option): void {
    const itemId = option.project.split('|')[0]; // Michael called this 'bucket'
    const env = this.env;
    //  MJ old:   this.loadPrivate.emit({ bucket: 'zbd' + bucket, token: token });
    const user = option.project.split('|')[1]; // Michael was using this field to hold 'ADMIN'
    this.loadPrivate.emit({
      bucket: `${user}/${itemId}`, env: env
    });
  }

  deleteDataset(option): void {
    const itemId = option.project.split('|')[0]; // Michael called this 'bucket'
    const env = this.env;
    const user = option.project.split('|')[1]; // Michael was using this field to hold 'ADMIN'
    alert('Deleting a dataset is not yet supported. Please email contact@oncoscape.org so we can manually delete your dataset.');
  }

  fetchDatasets(user: string, token: string): void {
    console.log(`About to fetchDatasets from environment '${environment.envName}' with token='${JSON.stringify(token).substring(0, 12) + '...'}'.`)
    let self = this;
    let source = "access"
    self.dataService.getUserDatasets(user, token, source).then(v => {
      self.env = v.env;
      self.sharedDatasets = v.datasets;

      source = "owner";
      self.dataService.getUserDatasets(user, token, source).then(v => {
        self.myDatasets = v.datasets;
        
        self.cd.detectChanges();
        setTimeout(v => {
          tippy('.private-dataset-hastip', {
            theme: 'light-border',
            arrow: true,
            placement: "right" //,
          });
        }, 100);
      });
    });
  }

  constructor(public fb: FormBuilder, public cd: ChangeDetectorRef, public dataService: DataService) {
    // Initialize All Forms
    this.formGroupSignIn = fb.group({
      email: [null, Validators.compose([Validators.required, Validators.email])],
      password: [
        null,
        Validators.compose([
          Validators.required
          // Validators.minLength(8)
          // Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')
        ])
      ]
    });


    this.formGroupSignUp = fb.group({
      password: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&].{8,}')
        ])
      ],

      email: [null, Validators.compose([Validators.required, Validators.email])],
      mailinglist: [null],
      firstName: [null, Validators.required],
      lastName: [null, Validators.required]
    });

    this.formGroupSignUpConfirm = fb.group({
      email: [null, Validators.compose([Validators.required, Validators.email])],
      code: [null, Validators.required]
    });

    this.formGroupResendCode = fb.group({
      email: [null, Validators.compose([Validators.required, Validators.email])]
    });

    this.formGroupForgotPassword = fb.group({
      email: [null, Validators.compose([Validators.required, Validators.email])]
    });

    // Passwords Shold all be
    /*
    *** Create Custom Validator
    Minimum length - 8
    Require numbers
    Require special character
    Require uppercase letters
    Require lowercase letters
    SOLUTION FROM https://stackoverflow.com/questions/48350506/how-to-validate-password-strength-with-angular-5-validator-pattern
    */
    this.formGroupUpdatePassword = fb.group({
      email: [null, Validators.compose([Validators.required, Validators.email])],
      code: [null, Validators.required],
      password: [
        null,
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&].{8,}')
        ])
      ]
    });

    //    this.activeForm = UserPanelFormEnum.SIGN_IN;
    let authedSecondsLeft = DataService.cognitoSessionTimeLeft();
    if (authedSecondsLeft < 120) {
      this.activeForm = UserPanelFormEnum.SIGN_IN;
    } else {
      this.activeForm = UserPanelFormEnum.PROJECT_LIST;
      console.log(`MJ how do we trigger fetch`);
    }

  }
}
