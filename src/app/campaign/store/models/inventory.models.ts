import { HalDoc } from 'ngx-prx-styleguide';
import { filterUnderscores } from './haldoc.utils';

export interface Inventory {
  id: number;
  podcastTitle: string;
  zones: InventoryZone[];
  self_uri: string;
  // targets?: InventoryTargets;
  _doc?: HalDoc;
}

export interface InventoryZone {
  id: string;
  label: string;
}

// export interface InventoryTargetType {
//   type: string;
//   label: string;
//   labelPlural: string;
// }

// export interface InventoryTarget {
//   type: string;
//   code: string;
//   label: string;
//   metadata?: any;
// }

// export interface InventoryTargets {
//   inventoryId: number;
//   episodes?: InventoryTarget[];
//   countries?: InventoryTarget[];
//   types?: InventoryTargetType[];
//   targets?: InventoryTarget[];
// }

// export interface InventoryTargetsMap {
//   [k: string]: InventoryTarget[];
// }

export const docToInventory = (doc: HalDoc): Inventory => {
  const inventory = filterUnderscores(doc) as Inventory;
  inventory.self_uri = doc.expand('self');
  inventory._doc = doc;
  return inventory;
};

// export const docToInventoryTargets = (doc: HalDoc): InventoryTargets => {
//   return filterUnderscores(doc) as InventoryTargets;
// };

// filter zone options to the control at an index
export const filterZones = (allZones: InventoryZone[], selectedFlightZones: InventoryZone[], zoneIndex?: number) => {
  selectedFlightZones = selectedFlightZones || [];

  // if allZones is empty/undefined (hasn't loaded yet,) use the flight.zones as options
  const options = allZones || selectedFlightZones;
  return options.filter(zone => {
    if (selectedFlightZones[zoneIndex] && selectedFlightZones[zoneIndex].id === zone.id) {
      // include currently selected zone
      return true;
    } else {
      // remove zones selected by other controls
      return !selectedFlightZones.find(z => z.id === zone.id);
    }
  });
};
