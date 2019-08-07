import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../../core/augury.service';
import { AdvertiserModel } from '../../shared/model/advertiser.model';

@Injectable()
export class AdvertiserService {
  // tslint:disable-next-line: variable-name
  private _advertisers: BehaviorSubject<AdvertiserModel[]> = new BehaviorSubject([]);

  constructor(private augury: AuguryService) {
    this.loadAdvertisers();
  }

  get advertisers(): Observable<AdvertiserModel[]> {
    return this._advertisers.asObservable();
  }

  loadAdvertisers() {
    this.augury.followItems('prx:advertisers').pipe(withLatestFrom(this.augury.root)).subscribe(([advertisers, root]) => {
      this._advertisers.next(advertisers.map(s => new AdvertiserModel(root, s, false)));
    });
  }

  findAdvertiserById(id: number): Observable<AdvertiserModel> {
    return this._advertisers.pipe(
      withLatestFrom(this.augury.root),
      map(([advertisers, rootDoc]) => {
        return advertisers.find(a => a.id === id) || new AdvertiserModel(rootDoc, null, false);
      })
    );
  }

  save(advertiser: AdvertiserModel): Observable<boolean> {
    // TODO: error handling - does save throw an error, return a status?
    const saveAction = advertiser.save();

    saveAction.pipe(
      withLatestFrom(this.advertisers),
    ).subscribe(([saveStatus, advertisers]) => {
      const index = advertisers.findIndex((a: AdvertiserModel) => a.id === advertiser.id);
      if (index > -1) {
        this._advertisers.next([
          ...advertisers.slice(0, index),
          advertiser,
          ...advertisers.slice(index + 1)
        ]);
      } else {
        this._advertisers.next([...advertisers, advertiser]);
      }
    });

    return saveAction;
  }
}
