import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AuguryService } from '../augury.service';
import { HalDoc } from 'ngx-prx-styleguide';

@Injectable()
export class AdvertiserService {
  constructor(private auguryService: AuguryService) {}

  loadAdvertisers(): Observable<HalDoc[]> {
    return this.auguryService.followItems(`prx:advertisers`, { per: 999 });
  }

  addAdvertiser(name: string): Observable<HalDoc> {
    return this.auguryService.root.pipe(mergeMap(root => root.create('prx:advertiser', {}, { name })));
  }
}
