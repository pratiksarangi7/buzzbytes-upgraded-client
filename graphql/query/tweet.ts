import { Int } from "graphql-request/alpha/schema/scalars";
import { graphql } from "../../gql";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { Tag } from "@/gql/graphql";
import { User } from "./user";

export interface Comment {
  id: string;
  content: string;
  author: User;
}

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
  isLiked: boolean;
  likeCount?: Int;
  tag: Tag;
  comments: Comment[];
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
      isLiked
      likeCount
      tag
      comments {
        id
        content
        author {
          id
          firstName
          lastName
          profileImageURL
        }
      }
    }
  }
`);

export const getSignedURLForTweetQuery = graphql(`
  query Query($imageType: String!) {
    getSignedURLForTweet(imageType: $imageType)
  }
`);
