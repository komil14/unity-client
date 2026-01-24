import { configureStore } from "@reduxjs/toolkit";
import { api } from "../services/api";
import eventsPageReducer from "../screens/eventsPage/slice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    eventsPage: eventsPageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
