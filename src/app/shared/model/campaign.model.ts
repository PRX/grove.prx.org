import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseModel, HalDoc } from 'ngx-prx-styleguide';
import { AdvertiserModel } from './advertiser.model';

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
  // public flights: FlightModel[]

  SETABLE = ['accountId', 'name', 'advertiser', 'advertiserId', 'type', 'status', 'repName', 'notes'];

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
    const advertiser = this.doc ? this.doc.follow('prx:advertiser').pipe(map(doc => new AdvertiserModel(this.doc, doc))) : of();
    const flights = of([]);

    return {
      advertiser,
      flights
    };
  }

  decode() {
    this.id = this.doc['id'];
    this.accountId = this.doc['accountId'];
    this.name = this.doc['name'] || '';
    this.type = this.doc['type'] || '';
    this.status = this.doc['status'] || '';
    this.repName = this.doc['repName'];
    this.notes = this.doc['notes'];
  }

  encode(): {} {
    const data = {} as any;
    // data.accountId = this.accountId;
    data.name = this.name;
    data.type = this.type;
    data.status = this.status;
    data.repName = this.repName;
    data.notes = this.notes;
    if (this.changed('accountId')) {
      // TODO: this.parent.expand('self') is the augury root, nope
      // Seems like this should be the id account self? nope, it's a CMS link. I do not like that.
      const accountDoc = this.isNew ? '/api/v1/accounts/' + this.accountId : this.doc.expand('prx:account');
      const newAccountURI = accountDoc.replace(`${this.original['accountId']}`, `${this.accountId}`);
      data.set_account_uri = newAccountURI;
    }
    if (this.changed('advertiser') || this.changed('advertiserId')) {
      console.log(this.advertiser, this.advertiserId);
      data.set_advertiser_uri = '/api/v1/advertisers/' + this.advertiserId;
    }
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:campaign', {}, data);
  }
}
