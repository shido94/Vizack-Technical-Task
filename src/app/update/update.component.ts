import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../services/user.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.css']
})
export class UpdateComponent implements OnInit {
  public path: string;

  userData = '';



  constructor(private router: Router,
              private route: ActivatedRoute,
              private userService: UserService) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.path = params['id'];
      this.userService.getdata(this.path).subscribe(user => {
        this.userData = user.user;
      });
    });
  }

  register(name, email) {
    const user = {
      name: name,
      email: email,
      id: this.path
    };
    this.userService.updateAcc(user).subscribe(data => {
        if (data.success) {
          this.router.navigate(['/admin']);
        }
      },
      error => {
      });
  }
}
