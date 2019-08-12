
import { Injectable } from '@angular/core';
import { HalBaseService } from 'ngx-prx-styleguide';
import { Env } from './core.env';

@Injectable()
export class AuguryService extends HalBaseService {
  static ROOT_PATH = '/api/v1';

  get host(): string {
    return Env.AUGURY_HOST;
  }

  get path(): string {
    return AuguryService.ROOT_PATH;
  }

  get ttl(): number {
    return Env.AUGURY_TTL;
  }

}
