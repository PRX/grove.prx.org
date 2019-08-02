import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../core/augury.service';
import { CampaignModel } from '../shared/model/campaign.model';

@Injectable()
export class CampaignService {
  // tslint:disable-next-line: variable-name
  private _campaigns: BehaviorSubject<CampaignModel[]> = new BehaviorSubject([]);

  constructor(private augury: AuguryService) {
    this.loadCampaigns();
  }

  get campaigns(): Observable<CampaignModel[]> {
    return this._campaigns.asObservable();
  }

  loadCampaigns() {
    this.augury.followItems('prx:campaigns').subscribe((campaigns: HalDoc[]) => {
      this._campaigns.next(campaigns.map(s => new CampaignModel(null, s, false)));
      console.log(this._campaigns.getValue());
    });
  }

  findCampaignById(id: number): Observable<CampaignModel> {
    return this._campaigns.pipe(
      map(campaigns => campaigns.find(c => c.id === id))
    );
  }
}
