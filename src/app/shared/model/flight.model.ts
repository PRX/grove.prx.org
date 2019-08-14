import { BaseModel, HalDoc } from 'ngx-prx-styleguide';
import { of, Observable } from 'rxjs';

export class FlightModel extends BaseModel {
  public id: number;
  public name: string;

  SETABLE = ['name'];

  constructor(parent: HalDoc, flight?: HalDoc, loadRelated = false) {
    super();
    this.init(parent, flight, loadRelated);
  }

  key() {
    if (this.doc && this.parent) {
      return `prx.campaign.${this.parent.id}.flight.${this.doc.id}`;
    } else if (this.parent) {
      return `prx.campaign.${this.parent.id}.flight.new`; // new flight
    } else {
      return `prx.flight.new`; // new flight, no parent?
    }
  }

  related() {
    const zones = of([]);
    const targets = of([]);
    const allocations = of([]);

    return {
      zones,
      targets,
      allocations
    };
  }

  decode() {
    this.id = this.doc['id'];
    this.name = this.doc['name'];
  }

  encode() {
    const data = {} as any;

    data.name = this.name;

    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:flight', {}, data);
  }
}
