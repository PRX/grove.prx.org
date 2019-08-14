import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, withLatestFrom, share, mergeMap } from 'rxjs/operators';
import { AuguryService } from '../../core/augury.service';
import { AdvertiserModel } from '../../shared/model/advertiser.model';

@Injectable()
export class AdvertiserService {
  // tslint:disable-next-line: variable-name
  private _advertisers: BehaviorSubject<AdvertiserModel[]> = new BehaviorSubject([]);
  error: Error;

  constructor(private augury: AuguryService) {
    this.loadAdvertisers();
  }

  get advertisers(): Observable<AdvertiserModel[]> {
    return this._advertisers.asObservable();
  }

  loadAdvertisers() {
    this.augury.followItems('prx:advertisers').pipe(withLatestFrom(this.augury.root)).subscribe(([advertisers, root]) => {
      this._advertisers.next(advertisers.map(s => new AdvertiserModel(root, s, false)));
    },
    err => this.error = err);
  }

  findAdvertiserById(id: number): Observable<AdvertiserModel> {
    return this._advertisers.pipe(
      map((advertisers) => {
        return advertisers.find(a => a.id === id);
      }),
      withLatestFrom(this.augury.root),
      mergeMap(([advertiser, rootDoc]) => {
        if (!advertiser) {
          return this.augury.follow('prx:advertisers', {id}).pipe(
            map(doc => {
              return new AdvertiserModel(rootDoc, doc, false);
            })
          );
        } else {
          return of(advertiser);
        }
      })
    );
  }

  save(advertiser: AdvertiserModel): Observable<boolean> {
    const saveAction = advertiser.save().pipe(share());

    saveAction.pipe(
      withLatestFrom(this.advertisers),
    ).subscribe(([saveStatus, advertisers]) => {
      // any errors are thrown to the ErrorService and raised to the whole app, so ok to ignore here
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
