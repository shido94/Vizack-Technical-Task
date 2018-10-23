import { Component, OnInit } from '@angular/core';
import {UserService} from '../services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  data = '';
  constructor(private router: Router,
              private userService: UserService) { }

  ngOnInit() {
    this.userService.userdata().subscribe(user => {
      this.data = user.user;
      console.log(this.data);

    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/']);
  }

}
