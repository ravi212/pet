import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ToastService } from './toast.service';

export type ApiOptions = {
  params?: Record<string, any>;
  headers?: HttpHeaders;
  silent?: boolean;
};

interface ApiResponse {
  message?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  get<T extends ApiResponse>(url: string, options?: ApiOptions): Observable<T> {
    return this.http
      .get<T>(url, {
        params: this.buildParams(options?.params),
        headers: options?.headers,
      })
      .pipe(
        tap((res) => {
          if (res.message) {
            this.toast.show(res.message, 'success');
          }
        }),
        catchError((err) => {
          if (!options?.silent) {
            this.toast.show(err?.error?.message || 'Something went wrong', 'error');
          }
          return throwError(() => err);
        })
      );
  }

  post<T extends ApiResponse>(url: string, body?: unknown, options?: ApiOptions): Observable<T> {
    return this.http
      .post<T>(url, body, {
        params: this.buildParams(options?.params),
        headers: options?.headers,
      })
      .pipe(
        tap((res) => {
          if (res.message) {
            this.toast.show(res.message, 'success');
          }
        }),
        catchError((err) => {
          if (!options?.silent) {
            this.toast.show(err?.error?.message || 'Something went wrong', 'error');
          }
          return throwError(() => err);
        })
      );
  }

  put<T extends ApiResponse>(url: string, body?: unknown, options?: ApiOptions): Observable<T> {
    return this.http
      .put<T>(url, body, {
        params: this.buildParams(options?.params),
        headers: options?.headers,
      })
      .pipe(
        tap((res) => {
          if (res.message) this.toast.show(res.message, 'success');
        }),
        catchError((err) => {
          if (!options?.silent) {
            this.toast.show(err?.error?.message || 'Something went wrong', 'error');
          }
          return throwError(() => err);
        })
      );
  }

  patch<T extends ApiResponse>(url: string, body?: unknown, options?: ApiOptions): Observable<T> {
    return this.http
      .put<T>(url, body, {
        params: this.buildParams(options?.params),
        headers: options?.headers,
      })
      .pipe(
        tap((res) => {
          if (res.message) this.toast.show(res.message, 'success');
        }),
        catchError((err) => {
          if (!options?.silent) {
            this.toast.show(err?.error?.message || 'Something went wrong', 'error');
          }
          return throwError(() => err);
        })
      );
  }

  delete<T extends ApiResponse>(url: string, options?: ApiOptions): Observable<T> {
    return this.http
      .delete<T>(url, {
        params: this.buildParams(options?.params),
        headers: options?.headers,
      })
      .pipe(
        tap((res) => {
          if (res.message) this.toast.show(res.message, 'success');
        }),
        catchError((err) => {
          if (!options?.silent) {
            this.toast.show(err?.error?.message || 'Something went wrong', 'error');
          }
          return throwError(() => err);
        })
      );
  }

  private buildParams(params?: Record<string, any>) {
    if (!params) return undefined;

    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        httpParams = httpParams.set(key, value);
      }
    }

    return httpParams;
  }
}
