import { Component } from '@angular/core';

@Component({
  template: `
  <div class="error">
    <h1>Sorry</h1>
    <p>You don't have permission to use this application.</p>
  </div>
  `,
  styleUrls: ['authorization.component.css']
})

export class AuthorizationComponent {}
