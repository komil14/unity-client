import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include", // backend uses authToken cookie
    prepareHeaders: (headers) => {
      // Headers are set here if needed
      return headers;
    },
  }),
  tagTypes: [
    "Event",
    "Me",
    "Application",
    "Group",
    "Organizer",
    "Like",
    "Comment",
  ],
  endpoints: () => ({}),
});
