import { BaseModel, HalDoc } from 'ngx-prx-styleguide';
import { Observable } from 'rxjs';

export class TargetModel extends BaseModel {
  public id: number;
  public targetType: string;
  public targetCode: string;

  SETABLE = ['targetType', 'targetCode'];

  constructor(parent: HalDoc, target?: HalDoc, loadRelated = false) {
    super();
    this.init(parent, target, loadRelated);
  }

  key() {
    if (this.doc && this.parent) {
      return `prx.flight.${this.parent.id}.target.${this.doc.id}`;
    } else if (this.parent) {
      return `prx.flight.${this.parent.id}.target.new`; // new target
    } else {
      return `prx.target.new`; // new target, no parent?
    }
  }

  related() {
    return {};
  }

  decode() {
    this.id = this.doc['id'];
    this.targetType = this.doc['targetType'];
    this.targetCode = this.doc['targetCode'];
  }

  encode() {
    const data = {} as any;

    data.targetType = this.targetType;
    data.targetCode = this.targetCode;

    return data;
  }

  saveNew(data: {}): Observable<HalDoc> {
    return this.parent.create('prx:target', {}, data);
  }
}
