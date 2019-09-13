import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Flight } from '../../core';

@Injectable({
  providedIn: 'root'
})
export class FlightFormService {
  flightsRemote$ = new BehaviorSubject<Flight>(null);
  flightsLocal$ = new BehaviorSubject<Flight>(null);
  flightId: number;

  constructor() {}
}
