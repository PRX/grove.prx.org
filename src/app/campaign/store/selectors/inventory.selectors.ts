import { createSelector } from '@ngrx/store';
import { CampaignStoreState } from '..';
import { selectCampaignStoreState } from './campaign.selectors';
import { selectCurrentInventoryUri } from './flight.selectors';
import { Inventory, InventoryZone, InventoryTargets } from '../models';
import { selectIds, selectEntities, selectAll } from '../reducers/inventory.reducer';
import { InventoryTargetType, InventoryTarget, InventoryTargetsMap } from '../models/inventory.models';

export const selectInventoryState = createSelector(selectCampaignStoreState, (state: CampaignStoreState) => state && state.inventory);
export const selectInventoryIds = createSelector(selectInventoryState, selectIds);
export const selectInventoryEntities = createSelector(selectInventoryState, selectEntities);
export const selectAllInventory = createSelector(selectInventoryState, selectAll);

export const selectAllInventoryOrderByName = createSelector(
  selectAllInventory,
  inventory => inventory && inventory.sort((a, b) => a.podcastTitle.localeCompare(b.podcastTitle))
);

export const selectCurrentInventory = createSelector(
  selectCurrentInventoryUri,
  selectAllInventory,
  (uri, allInventory): Inventory => (allInventory || []).find(i => i.self_uri === uri)
);

export const selectCurrentInventoryZones = createSelector(
  selectCurrentInventory,
  (inventory): InventoryZone[] => inventory && inventory.zones
);

export const selectCurrentInventoryTargets = createSelector(
  selectCurrentInventory,
  (inventory): InventoryTargets => inventory && inventory.targets
);

export const selectCurrentInventoryTargetTypes = createSelector(
  selectCurrentInventoryTargets,
  (targets): InventoryTargetType[] => targets && targets.types
);

export const selectCurrentInventoryAllTargets = createSelector(selectCurrentInventoryTargets, (targets): InventoryTarget[] => {
  console.log('selectCurrentInventoryAllTargets >> targets', targets);
  return targets && targets.targets;
});

export const selectCurrentInventoryTargetsTypeMap = createSelector(
  selectCurrentInventoryAllTargets,
  (targets): InventoryTargetsMap => {
    const map =
      targets &&
      targets.reduce(
        (a, target) => ({
          ...a,
          [target.type]: [...(a[target.type] || []), target]
        }),
        {}
      );
    console.log('selectCurrentInventoryTargetsTypeMap >> map', map);
    return map;
  }
);
