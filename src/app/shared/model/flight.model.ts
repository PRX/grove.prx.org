import { of, Observable } from 'rxjs';
import { BaseModel, HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../../core/augury.service';
import { ZoneModel } from './zone.model';
import { TargetModel } from './target.model';
import { InventoryModel } from './inventory.model';
import { map } from 'rxjs/operators';

export class FlightModel extends BaseModel {
  public id: number;
  public name: string;
  public startDate: Date;
  public endDate: Date;
  public totalGoal: number;
  public dailyMinimum: number;
  public zones: ZoneModel[];
  public targets: TargetModel[];
  public inventory: InventoryModel;

  SETABLE = ['name', 'startDate', 'endDate', 'totalGoal', 'dailyMinimum'];

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
    let inventory = of();
    const allocations = of([]);

    if (this.doc) {
      inventory = this.doc.follow('prx:inventory').pipe(
        map(doc => new InventoryModel(this.doc, doc))
      );
    }

    return {
      zones,
      targets,
      inventory,
      allocations
    };
  }

  decode() {
    this.id = this.doc['id'];
    this.name = this.doc['name'];
    this.startDate = this.doc['startAt'];
    this.endDate = this.doc['endAt'];
    this.totalGoal = this.doc['totalGoal'];
    this.dailyMinimum = this.doc['dailyMinimum'];
    //this.inventoryId = this.doc['_links']['prx:inventory']['href'].split('/').pop();
  }

  encode() {
    const data = {} as any;

    data.name = this.name;
    data.startAt = this.startDate;
    data.endAt = this.endDate;
    data.totalGoal = this.totalGoal;
    data.dailyMinimum = this.dailyMinimum;
    if (this.changed('inventory', true)) {
      data.set_inventory_uri = `${AuguryService.ROOT_PATH}/inventory/${this.inventory.id}`;
    }

    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:flights', {}, data);
  }
}
