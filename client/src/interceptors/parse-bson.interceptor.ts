import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { EJSON } from "bson";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class EJsonHttpInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    httpRequest: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return httpRequest.responseType === "json"
      ? this.handleJsonResponses(httpRequest, next)
      : next.handle(httpRequest);
  }

  private handleJsonResponses(
    httpRequest: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next
      .handle(httpRequest.clone({ responseType: "text" }))
      .pipe(map(event => this.parseResponse(event)));
  }

  private parseResponse(event: HttpEvent<any>): HttpEvent<any> {
    return event instanceof HttpResponse
      ? event.clone({ body: EJSON.parse(event.body) })
      : event;
  }
}

