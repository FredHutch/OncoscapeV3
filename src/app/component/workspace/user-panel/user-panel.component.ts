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

@Component({
  selector: 'app-workspace-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class UserPanelComponent {
  datasets: Array<any>;
  user: any;
  activeForm = UserPanelFormEnum.BLANK.toString();
  errorMessage = '';
  formGroupSignUp: FormGroup;
  formGroupSignUpConfirm: FormGroup;
  formGroupSignIn: FormGroup;
  formGroupSignInConfirm: FormGroup;
  formGroupResendCode: FormGroup;
  formGroupForgotPassword: FormGroup;
  formGroupUpdatePassword: FormGroup;

  @Output() showPanel = new EventEmitter<PanelEnum>();

  addDataSet(): void {
    this.showPanel.emit(PanelEnum.UPLOAD);
  }
  setForm(form: UserPanelFormEnum): void {
    this.activeForm = form.toString();
    this.cd.detectChanges();
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
  signIn(): void {
    const form = this.formGroupSignIn;
    if (form.status === 'INVALID') {
      return;
    }

    Auth.signIn(form.get('email').value, form.get('password').value)
      .then(user => {
        this.user = user;
        if (user.challengeName === 'SMS_MFA' || user.challengeName === 'SOFTWARE_TOKEN_MFA') {
          // this.amplifyService.setAuthState({ state: 'confirmSignIn', user: user });
        } else if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
          // this.amplifyService.setAuthState({ state: 'requireNewPassword', user: user });
        } else {
          // // this.amplifyService.setAuthState({ state: 'signedIn', user: user });
          // debugger;
          // const a = Auth.currentSession().then(v => {
          //   v.idToken.jwtToken
          //   this.fetchDatasets();
          //   this.setForm(UserPanelFormEnum.PROJECT_LIST);
          // });
        }
      })
      .catch(err => {
        alert(err.message);
        this.errorMessage = err.message;
        this.cd.detectChanges();
      });
  }

  signUp(): void {
    const form = this.formGroupSignUp;
    if (form.status === 'INVALID') {
      return;
    }
    Auth.signUp({
      username: form.get('email').value,
      password: form.get('password').value,
      attributes: {
        'custom:mailinglist': form.get('mailinglist').value.toString(),
        'custom:firstname': form.get('firstName').value,
        'custom:lastname': form.get('lastName').value
      }
    })
      .then(user => {
        this.setForm(UserPanelFormEnum.SIGN_UP_CONFIRM);
        this.cd.detectChanges();
      })
      .catch(err => {
        alert(err.message);
        this.errorMessage = err.message;
        this.cd.detectChanges();
      });
  }
  signUpConfirm(): void {
    const form = this.formGroupSignUpConfirm;
    if (form.status === 'INVALID') {
      return;
    }
    Auth.confirmSignUp(form.get('email').value, form.get('code').value)
      .then(data => {
        this.activeForm = UserPanelFormEnum.PROJECT_LIST;
        this.cd.detectChanges();
      })
      .catch(err => {
        alert(err.message);
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
        alert('Password sent');
        // const user = { username: form.get('email').value };
        this.setForm(UserPanelFormEnum.UPDATE_PASSWORD);
        this.cd.detectChanges();
      })
      .catch(err => {
        const errMsg = err.message.replace('Username', 'Email').replace('username', 'email');
        alert(errMsg);
        this.errorMessage = errMsg;
        this.cd.detectChanges();
      });
  }

  updatePassword(): void {
    const form = this.formGroupUpdatePassword;
    Auth.forgotPasswordSubmit(
      form.get('email').value,
      form.get('code').value,
      form.get('password').value
    )
      .then(data => {
        alert('Password updated');
        this.setForm(UserPanelFormEnum.SIGN_IN);
      })
      .catch(err => {
        alert(err);
      });
  }

  fetchDatasets(): void {
    API.get('dataset', '/dataset', {}).then(datasets => {
      this.datasets = datasets;
      this.cd.detectChanges();
    });
  }

  constructor(public fb: FormBuilder, public cd: ChangeDetectorRef) {
    this.formGroupSignIn = fb.group({
      email: [null, Validators.compose([Validators.required, Validators.email])],
      password: [null, Validators.required]
    });

    this.formGroupSignUp = fb.group({
      password: [null, Validators.compose([Validators.required, Validators.minLength(8)])],
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

    this.formGroupUpdatePassword = fb.group({
      email: [null, Validators.compose([Validators.required, Validators.email])],
      code: [null, Validators.required],
      password: [null, Validators.compose([Validators.required, Validators.minLength(8)])]
    });

    this.activeForm = UserPanelFormEnum.SIGN_IN;
  }
}
