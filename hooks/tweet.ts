import { graphQLClient } from "@/clients/api";
import { CreateTweetData } from "@/gql/graphql";
import {
  createTweetMutation,
  likeTweetMutation,
  unlikeTweetMutation,
} from "@/graphql/mutation/tweet";
import { getAllTweetsQuery, Tweet } from "@/graphql/query/tweet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface AllTweetsCache {
  getAllTweets: Tweet[];
}

export const useGetAllTweets = () => {
  const query = useQuery({
    queryKey: ["all-tweets"],
    queryFn: () => graphQLClient.request(getAllTweetsQuery),
  });
  return {
    ...query,
    tweets: query.data?.getAllTweets,
  };
};

export const useCreateTweet = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: CreateTweetData) =>
      graphQLClient.request(createTweetMutation, { payload }),
    onMutate: () => toast.loading("Creating Tweet", { id: "1" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["all-tweets"] });
      toast.success("Created Successfully", { id: "1" });
    },
  });
  return mutation;
};

export const useLikeTweet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tweetId,
      isCurrentlyLiked,
    }: {
      tweetId: string;
      isCurrentlyLiked: boolean;
    }) => {
      // Fetch current tweet data from the cache
      const allTweets = queryClient.getQueryData<AllTweetsCache>([
        "all-tweets",
      ]);
      if (!allTweets) return allTweets;
      const tweet = allTweets?.getAllTweets.find((t: any) => t.id === tweetId);
      console.log(tweet);
      // Decide whether to like or unlike based on the current state
      if (isCurrentlyLiked) {
        // Call the unlike mutation
        console.log("tweet liked, so unliking:");
        return graphQLClient.request(unlikeTweetMutation, { tweetId });
      } else {
        // Call the like mutation
        console.log("not liked, so liking:");
        return graphQLClient.request(likeTweetMutation, { tweetId });
      }
    },
    onMutate: async ({
      tweetId,
      isCurrentlyLiked,
    }: {
      tweetId: string;
      isCurrentlyLiked: boolean;
    }) => {
      const previousData = queryClient.getQueryData(["all-tweets"]);

      queryClient.setQueryData(["all-tweets"], (oldData: any) => {
        if (!oldData) {
          console.error("No data found in cache for ['all-tweets']");
          return oldData; // Return as-is if there's nothing to update
        }

        console.log("Old data in setQueryData:", oldData);

        return {
          ...oldData,
          getAllTweets: oldData.getAllTweets.map((tweet: any) =>
            tweet.id === tweetId
              ? {
                  ...tweet,
                  isLiked: !tweet.isLiked, // Toggle the isLiked state
                  likeCount: tweet.isLiked
                    ? tweet.likeCount - 1 // Decrement if unliked
                    : tweet.likeCount + 1, // Increment if liked
                }
              : tweet
          ),
        };
      });

      return { previousData };
    },
    onError: (err, tweetId, context) => {
      // Roll back the cache to the previous state
      queryClient.setQueryData(["all-tweets"], context?.previousData);
    },
    onSuccess: () => {
      // Optionally refetch data
      queryClient.invalidateQueries({ queryKey: ["all-tweets"] });
    },
  });
};
