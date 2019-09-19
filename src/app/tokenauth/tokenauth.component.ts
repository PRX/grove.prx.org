import { Component, OnInit } from '@angular/core';
import { AuthService } from 'ngx-prx-styleguide';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'grove-tokenauth',
  template: ''
})
export class TokenAuthComponent implements OnInit {
  authToken: string;

  constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.authToken = this.route.snapshot.queryParamMap.get('authToken');
    this.authService.setToken(this.authToken);
    this.router.navigate(['/']);
  }
}
