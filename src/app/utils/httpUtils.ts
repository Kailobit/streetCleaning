import { HttpHeaders, HttpParams } from "@angular/common/http";
import { AliaDateRequestPayload } from "../models/aliaModels";

export function createHeaders(key: string, value: string): HttpHeaders {
    return new HttpHeaders().set(key, value);
}

export function createBaseBodyURLSearch(key: string, value: string): URLSearchParams {
    const body = new URLSearchParams();
    body.set(key, value);
    return body;
}

export function createBaseBodyHttp(key: string, query: string): HttpParams {
    return new HttpParams().set(key, query);
}

export function createDateRequestBodyURLSearch(payload: AliaDateRequestPayload): URLSearchParams {
    const body = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => body.set(key, value));
    return body;
}