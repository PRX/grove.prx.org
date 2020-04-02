import { createSelector } from '@ngrx/store';
import { Dictionary } from '@ngrx/entity';
import { CampaignStoreState } from '..';
import { selectCampaignStoreState } from './campaign.selectors';
import { selectRoutedLocalFlight } from './flight.selectors';
import { selectIds } from '../reducers/availability.reducer';
import { Availability } from '../models';

export const selectAvailabilityState = createSelector(
  selectCampaignStoreState,
  (state: CampaignStoreState) => state && state.availability
);
export const selectAvailabilityIds = createSelector(
  selectAvailabilityState,
  selectIds
);
export const selectAvailabilityEntities = createSelector(
  selectAvailabilityState,
  (state): Dictionary<Availability> => state && state['entities']
);
export const selectRoutedFlightAvailabilityEntities = createSelector(
  selectRoutedLocalFlight,
  selectAvailabilityEntities,
  (flight, entities): Dictionary<Availability> =>
    // only the entities with zones on routed
    entities &&
    flight &&
    flight.zones.reduce(
      (acc, zone) => ({
        ...acc,
        ...(entities[`${flight.id}_${zone.id}`] && { [`${flight.id}_${zone.id}`]: entities[`${flight.id}_${zone.id}`] })
      }),
      {}
    )
);

export const selectAvailabilityError = createSelector(
  selectAvailabilityState,
  state => state && state.error
);
