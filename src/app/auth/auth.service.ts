import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

import { User } from './auth.model';

const BACKEND_URL = environment.apiUrl + '/users/';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private token: string;
  private tokenTimer: any;
  private isAuthenticated = false;
  private userId: string;
  private isVerified = false;
  private authStatusListener = new Subject<boolean>();
  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getUserId() {
    return this.userId;
  }

  getVerifiedStatus() {
    return this.isVerified;
  }

  //listener value is quite not updated earlier while sharing in component as it is synchronous
  //hence, need to set isAuthenticated value to update the dom
  getAuthenticatedStatus() {
    return this.isAuthenticated;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const userData: User = { email: email, password: password };
    this.http.post(BACKEND_URL + 'signup', userData).subscribe(
      (response) => {
        this.router.navigate(['/']);
      },
      (error) => {
        this.authStatusListener.next(false);
      }
    );
  }

  login(email: string, password: string) {
    const userData: User = { email: email, password: password };
    this.http
      .post<{
        token: string;
        expiresIn: number;
        userId: string;
        isVerified: boolean;
      }>(BACKEND_URL + 'login', userData)
      .subscribe(
        (response) => {
          const token = response.token;
          this.token = token;
          if (token) {
            const authExpiration = response.expiresIn;
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.isVerified = response.isVerified;
            this.setAuthTimer(authExpiration);
            this.authStatusListener.next(true);
            const now = new Date();
            const expirationDate = new Date(
              now.getTime() + authExpiration * 1000
            );
            this.saveAuthData(this.token, expirationDate, this.userId);
            this.router.navigate(['/']);
          }
        },
        (error) => {
          this.authStatusListener.next(false);
        }
      );
  }

  autoAuthUser() {
    //here we can't validate the token as that part should be of server but we can validate the time
    const authInfo = this.getAuthData();
    if (!authInfo) {
      return;
    }
    const now = new Date();
    const expiresIn = authInfo.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInfo.token;
      this.userId = authInfo.userId;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  //set the values in local storage and removing it so even
  //server restarts we store the token and expiration value in browser
  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expirationDate', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expirationDate');
    const userId = localStorage.getItem('userId');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
    };
  }
}
