import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errors = '';


  usernameControl = new FormControl(null, [Validators.required]);
  passwordControl = new FormControl(null, [Validators.required]);

  constructor(private router: Router,
              private userService: UserService
             ) {
    this.loginForm = new FormGroup({
      username: this.usernameControl,
      password: this.passwordControl
    });
  }

  ngOnInit() {
  }

  onLogin() {
    const obs = this.userService.login(this.loginForm.value);
    obs.subscribe(data => {
        if (data.success) {
          localStorage.setItem('USER_TOKEN', data.token);
          if (data.role === 'admin'){
            this.router.navigate(['/admin']);
          }
          else{
            this.router.navigate(['/profile']);
          }
        }
      },
      error => {
      this.errors = error.error.message;
    });
  }

}
