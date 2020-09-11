import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'grove-test-component',
  template: ``
})
export class TestComponent {}
const flightChildRoutes: Routes = [
  { path: 'zone/:zoneId/creative/:id', component: TestComponent },
  { path: 'zone/:zoneId/creative/list', component: TestComponent }
];
const campaignChildRoutes: Routes = [
  { path: '', component: TestComponent },
  { path: 'flight/:flightId', component: TestComponent, children: flightChildRoutes }
];
export const campaignRoutes: Routes = [
  {
    path: 'campaign/new',
    component: TestComponent,
    children: campaignChildRoutes
  },
  {
    path: 'campaign/:id',
    component: TestComponent,
    children: campaignChildRoutes
  }
];
