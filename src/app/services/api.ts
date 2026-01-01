import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include", // backend uses authToken cookie
  }),
  tagTypes: ["Event", "Me", "Application", "Group", "Organizer"],
  endpoints: () => ({}),
});
