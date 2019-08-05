
import { Injectable } from '@angular/core';
import { HalBaseService } from 'ngx-prx-styleguide';
import { Env } from './core.env';

@Injectable()
export class AuguryService extends HalBaseService {

  get host(): string {
    return Env.AUGURY_HOST;
  }

  get path(): string {
    return '/api/v1';
  }

  get ttl(): number {
    return Env.AUGURY_TTL;
  }

}
