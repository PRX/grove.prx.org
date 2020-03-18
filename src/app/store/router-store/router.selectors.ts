import { createSelector, createFeatureSelector } from '@ngrx/store';
import { RouterReducerState } from '@ngrx/router-store';

export const selectRouter = createFeatureSelector('router');
export const selectRouterState = createSelector(selectRouter, (router: RouterReducerState) => router && router.state);
export const selectRouterStateParams = createSelector(selectRouterState, (state: any) => state && state.params);
