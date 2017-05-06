import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Http } from '@angular/http';
import { MdSnackBar } from '@angular/material';

@Component({
  selector: 'reset-password',
  styleUrls: ['./reset-components.css'],
  templateUrl: './reset.components.html'
})
export class ResetPasswordComponent {

    public currentToken: any;
    public reset: any = {};
    constructor(
        public route: ActivatedRoute,
        public http: Http,
        public snackBar: MdSnackBar,
        private router: Router
    ) {
        this.currentToken = this.route.snapshot.params['token'];
    }

    public resetPassword() {
        this.http.post('/reset/' + this.currentToken, this.reset)
            .subscribe((data) => {
                console.log(data);
            }, (error) => {
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
