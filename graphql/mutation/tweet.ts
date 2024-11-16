import { graphql } from "@/gql";

export const createTweetMutation = graphql(
  `
    #graphql
    mutation CreateTweet($payload: CreateTweetData!) {
      createTweet(payload: $payload) {
        id
      }
    }
  `
);
export const likeTweetMutation = graphql(`
  #graphql
  mutation LikeTweet($tweetId: ID!) {
    likeTweet(tweetId: $tweetId)
  }
`);

export const unlikeTweetMutation = graphql(`
  #graphql
  mutation UnlikeTweet($tweetId: ID!) {
    unlikeTweet(tweetId: $tweetId)
  }
`);
