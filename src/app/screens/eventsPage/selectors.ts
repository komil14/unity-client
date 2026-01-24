import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../../libs/types";

const selectEventsPageState = (state: RootState) => state.eventsPage;

export const selectEventsFilters = createSelector(
  [selectEventsPageState],
  (state) => ({
    search: state.search,
    startDate: state.startDate,
    endDate: state.endDate,
    showLikedOnly: state.showLikedOnly,
  }),
);

export const selectEventsOrdering = createSelector(
  [selectEventsPageState],
  (state) => ({
    order: state.order,
    direction: state.direction,
  }),
);

export const selectEventsPagination = createSelector(
  [selectEventsPageState],
  (state) => ({
    page: state.page,
    limit: state.limit,
  }),
);

export const selectEventsView = selectEventsPageState;
