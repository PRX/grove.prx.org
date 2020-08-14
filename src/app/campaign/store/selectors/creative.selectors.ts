import { createSelector } from '@ngrx/store';
import { selectRouterStateParams } from '../../../store/router-store/router.selectors';

export const selectRoutedCreativeId = createSelector(selectRouterStateParams, (params): string | number => {
  if (params) {
    const id = +params.creativeId;
    if (Number.isNaN(id)) {
      return params.creativeId;
    } else {
      return id;
    }
  }
});
