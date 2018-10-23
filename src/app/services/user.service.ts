import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  register(userForm) {
    return this.http.post<any>('/user/register', userForm);
  }

  login(userForm) {
    return this.http.post<any>('/user/login', userForm);
  }

  userdata(): Observable<any> {
    const token = localStorage.getItem('USER_TOKEN');
    return this.http.get<any>('/user/data', {
      headers: {Authorization: 'Bearer ' + token}
    }).pipe(
      map((post) => {
        return post;
      })
    );
  }

  getUser(): Observable<any> {
    // const token = localStorage.getItem('USER_TOKEN');
    return this.http.get<any>('/admin/admin').pipe(
      map((post) => {
        return post;
      })
    );
  }

  deleteAcc(id: string) {
    return this.http.post<any>('/admin/deleteUser', {id});
  }

  updateAcc(data) {
    return this.http.post<any>('/admin/updateUser', {data});
  }

  getdata(id): Observable<any> {
    return this.http.get<any>('/admin/getdata?id=' + id).pipe(
      map((post) => {
        return post;
      })
    );
  }

}
