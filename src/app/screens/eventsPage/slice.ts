import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { EventsPageState } from "../../../libs/types";

const initialState: EventsPageState = {
  search: "",
  startDate: "",
  endDate: "",
  order: "createdAt",
  direction: "desc",
  showLikedOnly: false,
  page: 1,
  limit: 8,
};

const eventsPageSlice = createSlice({
  name: "eventsPage",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 1;
    },
    setStartDate(state, action: PayloadAction<string>) {
      state.startDate = action.payload;
      state.page = 1;
    },
    setEndDate(state, action: PayloadAction<string>) {
      state.endDate = action.payload;
      state.page = 1;
    },
    setOrder(state, action: PayloadAction<string>) {
      state.order = action.payload;
      state.page = 1;
    },
    setDirection(state, action: PayloadAction<"asc" | "desc">) {
      state.direction = action.payload;
      state.page = 1;
    },
    setShowLikedOnly(state, action: PayloadAction<boolean>) {
      state.showLikedOnly = action.payload;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
    },
    resetFilters(state) {
      state.search = "";
      state.startDate = "";
      state.endDate = "";
      state.order = "createdAt";
      state.direction = "desc";
      state.showLikedOnly = false;
      state.page = 1;
      state.limit = 8;
    },
    hydrateFromUrl(_state, action: PayloadAction<EventsPageState>) {
      return action.payload;
    },
  },
});

export const {
  setSearch,
  setStartDate,
  setEndDate,
  setOrder,
  setDirection,
  setShowLikedOnly,
  setPage,
  setLimit,
  resetFilters,
  hydrateFromUrl,
} = eventsPageSlice.actions;

export default eventsPageSlice.reducer;
