import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  authState,
  createUserWithEmailAndPassword,
  updateProfile,
} from '@angular/fire/auth';
import { concatMap, from, Observable, of, switchMap } from 'rxjs';
import { openDB } from 'idb';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser$ = authState(this.auth);
  private dbPromise: any;

  constructor(private auth: Auth) {
    this.dbPromise = this.initDB();
  }

  private async initDB() {
    return openDB('auth-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('auth')) {
          db.createObjectStore('auth', { keyPath: 'id' });
        }
      },
    });
  }

  async isAuthenticated(): Promise<boolean> {
    const db = await this.dbPromise;
    const authToken = await db.get('auth', 'authToken');
    return !!authToken;
  }

  async setAuthToken(token: string): Promise<void> {
    const db = await this.dbPromise;
    await db.put('auth', { id: 'authToken', value: token });
  }

  async removeAuthToken(): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('auth', 'authToken');
  }

  signUp(name: string, email: string, password: string): Observable<any> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      switchMap(({ user }) =>
        updateProfile(user, { displayName: name }).then(() =>
          this.setAuthToken(user.refreshToken)
        )
      )
    );
  }

  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(({ user }) => {
        this.setAuthToken(user.refreshToken);
        return of(user);
      })
    );
  }

  logout(): Observable<any> {
    return from(this.auth.signOut()).pipe(
      switchMap(() => {
        this.removeAuthToken();
        return of(null);
      })
    );
  }
}
