import { graphql } from "../../gql";
import { Tweet } from "./tweet";

export interface User {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  profileImageURL?: string;
  tweets?: Tweet[];
  followers?: User[];
  following?: User[];
}

export const verifyUserGoogleTokenQuery = graphql(`
  #graphql
  query VerifyUserGoogleToken($token: String!) {
    verifyGoogleToken(token: $token)
  }
`);

export const getCurrentUserQuery = graphql(
  `
    #graphql
    query GetCurrentUser {
      getCurrentUser {
        id
        profileImageURL
        email
        firstName
        lastName
        following {
          firstName
          lastName
          profileImageURL
          id
        }
        followers {
          firstName
          lastName
          profileImageURL
          id
        }
        recommendedUsers {
          id
          firstName
          lastName
          profileImageURL
        }
        tweets {
          id
          content
          imageURL
          author {
            firstName
            lastName
            profileImageURL
          }
        }
      }
    }
  `
);

export const getUserByIdQuery = graphql(`
  #graphql
  query GetUserById($id: ID!) {
    getUserById(id: $id) {
      email
      firstName
      id
      lastName
      profileImageURL
      tweets {
        author {
          firstName
          lastName
          profileImageURL
        }
        content
        id
      }
      following {
        firstName
        lastName
        profileImageURL
        id
      }
      followers {
        firstName
        lastName
        profileImageURL
        id
      }
    }
  }
`);
