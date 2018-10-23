import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  myForm: FormGroup;

  usernameControl = new FormControl(null, [Validators.required]);
  emailControl = new FormControl(null, [Validators.required, Validators.email]);
  professionControl = new FormControl(null, [Validators.required]);
  passwordControl = new FormControl(null, [Validators.required]);
  conf_passwordControl = new FormControl(null, [Validators.required]);


  constructor(private router: Router,
              private userService: UserService,
             ) {
    this.myForm = new FormGroup({
      username: this.usernameControl,
      email: this.emailControl,
      profession: this.professionControl,
      password: this.passwordControl,
      conf_password: this.conf_passwordControl
    });
  }

  ngOnInit() {
  }


  register() {
    this.userService.register(this.myForm.value).subscribe(data => {
        if (data.success) {
          this.router.navigate(['/login']);
        }
      },
      error => {
      });
  }
}
