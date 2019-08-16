import { of, Observable } from 'rxjs';
import { BaseModel, HalDoc } from 'ngx-prx-styleguide';
import { AuguryService } from '../../core/augury.service';
import { ZoneModel } from './zone.model';
import { TargetModel } from './target.model';
import { InventoryModel } from './inventory.model';

export class FlightModel extends BaseModel {
  public id: number;
  public name: string;
  public startDate: Date;
  public endDate: Date;
  public totalGoal: number;
  public weeklyGoal: number;
  public zones: ZoneModel[];
  public targets: TargetModel[];
  public inventory: InventoryModel;

  SETABLE = ['name', 'startDate', 'endDate', 'totalGoal', 'weeklyGoal'];

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
    const inventory = of();
    const allocations = of([]);

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
    this.startDate = this.doc['startDate'];
    this.endDate = this.doc['endDate'];
    this.totalGoal = this.doc['totalGoal'];
    this.weeklyGoal = this.doc['weeklyGoal'];
  }

  encode() {
    const data = {} as any;

    data.name = this.name;
    data.startDate = this.startDate;
    data.endDate = this.endDate;
    data.totalGoal = this.totalGoal;
    data.weeklyGoal = this.weeklyGoal;

    data.set_inventory_uri = `${AuguryService.ROOT_PATH}/inventory/${1}`;

    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:flights', {}, data);
  }
}
