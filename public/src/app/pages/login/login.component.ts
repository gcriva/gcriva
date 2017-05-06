import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { MdSnackBar } from '@angular/material';

@Component({
  selector: 'login',
  styleUrls: ['./login-components.css'],
  templateUrl: './login.components.html'
})
export class LoginComponent {

  public localState: any;
  public loginData: any = {};

  constructor(
    public route: ActivatedRoute,
    public http: Http,
    public snackBar: MdSnackBar
  ) {}

  public login() {
    this.http.post('/login', this.loginData)
        .subscribe((data) => {
            console.log(data);
        }, (error) => {
          console.log(error);
          let response = JSON.parse(error._body);
          this.openSnackBar(response.message.msg, 'OK');
        });
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

}
