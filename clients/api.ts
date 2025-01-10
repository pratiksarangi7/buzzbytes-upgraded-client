import { GraphQLClient } from "graphql-request";
import { headers } from "next/headers";

const isClient = typeof window !== "undefined";
console.log(isClient);
export const graphQLClient = new GraphQLClient(
  process.env.NEXT_PUBLIC_API_URL as string,
  {
    headers: () => ({
      Authorization: isClient
        ? `Bearer ${window.localStorage.getItem("buzzbytes_token")}`
        : "",
    }),
  }
);
