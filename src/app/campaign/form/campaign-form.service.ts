import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Campaign } from '../../core';

@Injectable({
  providedIn: 'root'
})
export class CampaignFormService {
  campaignRemote$ = new BehaviorSubject<Campaign>(null);
  campaignLocal$ = new BehaviorSubject<Campaign>(null);
  campaignValid: boolean;
  campaignChanged: boolean;
  campaignId: number;

  constructor() {}
}
