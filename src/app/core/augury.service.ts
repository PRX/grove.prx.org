
import { Injectable } from '@angular/core';
import { HalBaseService, HalDoc, HalObservable } from 'ngx-prx-styleguide';
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

  get auth(): HalObservable<HalDoc> {
    return this.follow('prx:authorization');
  }

}
