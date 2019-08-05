import { Observable, of } from 'rxjs';
import { BaseModel, HalDoc } from 'ngx-prx-styleguide';

export class CampaignModel extends BaseModel {
  public id: number;
  public accountId: number;
  public name = '';
  // public advertiser: Advertiser;
  public type: string;
  public status: string;
  public repName: string;
  public notes: string;
  // public flights: Flight[]

  SETABLE = ['name', 'type', 'status', 'repName', 'notes'];

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
    const advertiser = of('');
    const flights = of([]);

    return {
      advertiser,
      flights
    };
  }

  decode() {
    this.id = this.doc['id'];
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
      const accountDoc = this.isNew ? this.parent.expand('self') : this.doc.expand('prx:account');
      const newAccountURI = accountDoc.replace(`${this.original['accountId']}`, `${this.accountId}`);
      data.set_account_uri = newAccountURI;
    }
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:campaign', {}, data);
  }
}
