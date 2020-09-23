import { HalDoc } from 'ngx-prx-styleguide';
import { filterUnderscores } from './haldoc.utils';

export interface InventoryTargetType {
  type: string;
  label: string;
  labelPlural: string;
}

export interface InventoryTarget {
  type: string;
  code: string;
  label: string;
  metadata?: any;
}

export interface InventoryTargets {
  inventoryId: number;
  episodes?: InventoryTarget[];
  countries?: InventoryTarget[];
  types?: InventoryTargetType[];
  targets?: InventoryTarget[];
}

export interface InventoryTargetsMap {
  [k: string]: InventoryTarget[];
}

export const docToInventoryTargets = (doc: HalDoc): InventoryTargets => {
  return filterUnderscores(doc) as InventoryTargets;
};
