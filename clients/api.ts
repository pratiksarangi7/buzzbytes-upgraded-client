import { GraphQLClient } from "graphql-request";
import { headers } from "next/headers";

const isClient = typeof window !== "undefined";
console.log(isClient);
export const graphQLClient = new GraphQLClient(
  "http://localhost:8000/graphql",
  {
    headers: () => ({
      Authorization: isClient
        ? `Bearer ${window.localStorage.getItem("buzzbytes_token")}`
        : "",
    }),
  }
);
