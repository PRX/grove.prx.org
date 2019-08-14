import { BaseModel, HalDoc } from 'ngx-prx-styleguide';
import { Observable } from 'rxjs';

export class ZoneModel extends BaseModel {
  public id: number;
  public zoneName: string;

  SETABLE = ['zoneName'];

  constructor(parent: HalDoc, zone?: HalDoc, loadRelated = false) {
    super();
    this.init(parent, zone, loadRelated);
  }

  key() {
    if (this.doc && this.parent) {
      return `prx.flight.${this.parent.id}.zone.${this.doc.id}`;
    } else if (this.parent) {
      return `prx.flight.${this.parent.id}.zone.new`; // new zone
    } else {
      return `prx.zone.new`; // new zone, no parent?
    }
  }

  related() {
    return {};
  }

  decode() {
    this.id = this.doc['id'];
    this.zoneName = this.doc['zoneName'];
  }

  encode() {
    const data = {} as any;

    data.zoneName = this.zoneName;

    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:zone', {}, data);
  }
}
