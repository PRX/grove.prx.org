import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseModel, HalDoc, REQUIRED } from 'ngx-prx-styleguide';
import { AdvertiserModel } from './advertiser.model';
import { FlightModel } from './flight.model';
import { AuguryService } from '../../core/augury.service';

export class CampaignModel extends BaseModel {
  public id: number;
  public accountId: number;
  public name = '';
  public advertiserId: number;
  public advertiser: AdvertiserModel;
  public type: string;
  public status: string;
  public repName: string;
  public notes: string;
  public flights: FlightModel[];

  SETABLE = ['accountId', 'name', 'advertiser', 'advertiserId', 'type', 'status', 'repName', 'notes'];

  VALIDATORS = {
    accountId: [REQUIRED()],
    name: [REQUIRED()],
    advertiserId: [REQUIRED()],
    type: [REQUIRED()],
    status: [REQUIRED()],
    repName: [REQUIRED()]
  };

  constructor(parent: HalDoc, campaign?: HalDoc, loadRelated = false) {
    super();
    this.init(parent, campaign, loadRelated);
  }

  key() {
    if (this.doc) {
      return `prx.campaign.${this.doc.id}`;
    } else {
      return `prx.campaign.new`; // new campaign
    }
  }

  related() {
    let advertiser = of();
    let flights = of([]);
    if (this.doc) {
      advertiser = this.doc.follow('prx:advertiser').pipe(
        map(doc => {
          this.set('advertiserId', doc.id, true);
          return new AdvertiserModel(this.doc, doc);
        })
      );
      flights = this.doc.followItems('prx:flights').pipe(
        map(docs => {
          return docs.map(doc => new FlightModel(this.doc, doc, true));
        })
      );
    }

    return {
      advertiser,
      flights
    };
  }

  decode() {
    this.id = this.doc['id'];
    if (this.doc && this.doc['_links']) {
      const accountUrl = this.doc['_links']['prx:account']['href'].split('/');
      this.accountId = parseInt(accountUrl[accountUrl.length - 1], 10);
    }
    this.name = this.doc['name'] || '';
    this.type = this.doc['type'] || '';
    this.status = this.doc['status'] || '';
    this.repName = this.doc['repName'];
    this.notes = this.doc['notes'];
  }

  encode(): {} {
    const data = {} as any;
    data.name = this.name;
    data.type = this.type;
    data.status = this.status;
    data.repName = this.repName;
    data.notes = this.notes;
    if (this.changed('accountId')) {
      const accountDoc = this.isNew ?
        `${AuguryService.ROOT_PATH}/accounts/${this.accountId}` :
        this.doc.expand('prx:account');
      const parts = accountDoc.split('/');
      const newAccountURI = [...parts.slice(0, parts.length - 1), this.accountId.toString()].join('/');
      data.set_account_uri = newAccountURI;
    }
    if (this.changed('advertiserId')) {
      const advertiserDoc = this.isNew || !this.advertiser ?
        `${AuguryService.ROOT_PATH}/advertisers/${this.advertiserId}` :
        this.advertiser.doc.expand('self');
      const parts = advertiserDoc.split('/');
      const newAdvertiserURI = [...parts.slice(0, parts.length - 1), this.advertiserId.toString()].join('/');
      data.set_advertiser_uri = newAdvertiserURI;
    }
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:campaign', {}, data);
  }
}
