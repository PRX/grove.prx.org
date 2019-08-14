import { Observable, of } from 'rxjs';
import { BaseModel, HalDoc } from 'ngx-prx-styleguide';

export class AdvertiserModel extends BaseModel {
  public id: number;
  public name = '';

  SETABLE = ['name'];

  constructor(parent: HalDoc, advertiser?: HalDoc, loadRelated = false) {
    super();
    this.init(parent, advertiser, loadRelated);
  }

  key() {
    if (this.doc) {
      return `prx.advertiser.${this.doc.id}`;
    } else {
      return `prx.advertiser.new`; // new advertiser
    }
  }

  related() {
    return {};
  }

  decode() {
    this.id = this.doc['id'];
    this.name = this.doc['name'] || '';
  }

  encode(): {} {
    const data = {} as any;
    data.name = this.name;
    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:advertiser', {}, data);
  }
}
