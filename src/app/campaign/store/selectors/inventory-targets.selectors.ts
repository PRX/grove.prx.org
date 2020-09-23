import { createSelector } from '@ngrx/store';
import { CampaignStoreState } from '..';
import { selectCampaignStoreState } from './campaign.selectors';
import { selectCurrentInventory } from './inventory.selectors';
import { InventoryTargetType, InventoryTarget, InventoryTargetsMap, InventoryTargets } from '../models';
import { selectIds, selectEntities, selectAll } from '../reducers/inventory-targets.reducer';

export const selectInventoryTargetsState = createSelector(
  selectCampaignStoreState,
  (state: CampaignStoreState) => state && state.inventoryTargets
);
export const selectInventoryTargetsIds = createSelector(selectInventoryTargetsState, selectIds);
export const selectInventoryTargetsEntities = createSelector(selectInventoryTargetsState, selectEntities);
export const selectAllInventoryTargets = createSelector(selectInventoryTargetsState, selectAll);

export const selectCurrentInventoryTargets = createSelector(
  selectCurrentInventory,
  selectInventoryTargetsEntities,
  (inventory, targets): InventoryTargets => targets && targets[inventory.id]
);

export const selectCurrentInventoryTargetTypes = createSelector(
  selectCurrentInventoryTargets,
  (targets): InventoryTargetType[] => targets && targets.types
);

export const selectCurrentInventoryAllTargets = createSelector(
  selectCurrentInventoryTargets,
  (targets): InventoryTarget[] => targets && targets.targets
);

export const selectCurrentInventoryTargetsTypeMap = createSelector(
  selectCurrentInventoryAllTargets,
  (targets): InventoryTargetsMap =>
    targets &&
    targets.reduce(
      (a, target) => ({
        ...a,
        [target.type]: [...(a[target.type] || []), target]
      }),
      {}
    )
);
