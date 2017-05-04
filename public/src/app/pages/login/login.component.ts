import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http'

@Component({
  selector: 'about',
  styles: [`
  `],
  templateUrl:'./login.components.html'
})
export class LoginComponent {

  public localState: any;
  constructor(
    public route: ActivatedRoute,
    public http: Http
  ) {}
  public loginData: any = {};
  
  public login() {
    this.http.post('/login', this.loginData)
        .subscribe((data) => {
            console.log(data);
        });
  }

}
