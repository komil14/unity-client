// Redux store state types for screens
export interface EventsPageState {
  search: string;
  startDate: string;
  endDate: string;
  order: string;
  direction: "asc" | "desc";
  showLikedOnly: boolean;
  page: number;
  limit: number;
}

// Root state (keep in sync with store reducers)
export interface RootState {
  eventsPage: EventsPageState;
}
