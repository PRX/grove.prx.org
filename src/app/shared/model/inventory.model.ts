import { BaseModel, HalDoc } from 'ngx-prx-styleguide';
import { Observable } from 'rxjs';

export class InventoryModel extends BaseModel {
  public id: number;
  public title: string;

  SETABLE = ['title'];

  constructor(parent: HalDoc, zone?: HalDoc, loadRelated = false) {
    super();
    this.init(parent, zone, loadRelated);
  }

  key() {
    if (this.doc) {
      return `prx.inventory.${this.doc.id}`;
    } else {
      return `prx.inventory.new`; // new zone, no parent?
    }
  }

  related() {
    return {};
  }

  decode() {
    this.id = this.doc['id'];
    this.title = this.doc['title'];
  }

  encode() {
    const data = {} as any;

    data.title = this.title;

    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:inventory', {}, data);
  }
}
