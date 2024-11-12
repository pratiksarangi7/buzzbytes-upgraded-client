import { graphql } from "../../gql";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

export interface Tweet {
  id: string;
  content: string;
  imageURL?: string | null;
  author: {
    firstName: string;
    lastName?: string | null;
    profileImageURL?: string | null;
    id: string;
  };
}

export const getAllTweetsQuery = graphql(`
  query GetAllTweets {
    getAllTweets {
      id
      content
      imageURL
      author {
        firstName
        lastName
        profileImageURL
        id
      }
    }
  }
`);

export const getSignedURLForTweetQuery = graphql(`
  query Query($imageType: String!) {
    getSignedURLForTweet(imageType: $imageType)
  }
`);
