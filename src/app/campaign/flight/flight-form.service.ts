import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Flight } from '../../core';

@Injectable({
  providedIn: 'root'
})
export class FlightFormService {
  flightsRemote$ = new Observable<{ [id: string]: Flight }>({});
  flightsLocal$ = new BehaviorSubject<{ [id: string]: { flight: Flight; valid: boolean; changed: boolean } }>({});
  campaignId: number;

  constructor() {}
}
