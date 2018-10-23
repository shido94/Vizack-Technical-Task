import { Component, OnInit } from '@angular/core';
import {UserService} from '../services/user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  users = [];

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    this.userService.getUser().subscribe(user => {
      this.users = user.user;
    });
  }

  deleteUser(id: string) {
    this.userService.deleteAcc(id).subscribe(user => {
      this.router.navigate(['/new']);
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/']);
  }


}
