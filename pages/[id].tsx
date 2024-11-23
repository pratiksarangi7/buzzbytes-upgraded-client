import { graphQLClient } from "@/clients/api";
import FeedCard from "@/components/FeedCard";
import TwitterLayout from "@/components/Layout/layout";
import {
  followUserMutation,
  unfollowUserMutation,
} from "@/graphql/mutation/user";
import { Tweet } from "@/graphql/query/tweet";
import { getUserByIdQuery, User } from "@/graphql/query/user";
import { useCurrentUser } from "@/hooks/user";
import { useQueryClient } from "@tanstack/react-query";
import type { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import { useCallback, useMemo } from "react";

interface ServerProps {
  userInfo?: User;
}

const userProfilePage: NextPage<ServerProps> = (props) => {
  const { user: currentUser } = useCurrentUser();
  console.log("props user info tweets logging:", props.userInfo?.tweets);
  const queryClient = useQueryClient();
  const handleFollowUser = useCallback(async () => {
    if (!props.userInfo?.id) return;
    await graphQLClient.request(followUserMutation, { to: props.userInfo?.id });
    await queryClient.invalidateQueries({ queryKey: ["current-user"] });
  }, [queryClient, props.userInfo]);
  const handleunFollowUser = useCallback(async () => {
    if (!props.userInfo?.id) return;
    await graphQLClient.request(unfollowUserMutation, {
      to: props.userInfo?.id,
    });
    await queryClient.invalidateQueries({ queryKey: ["current-user"] });
  }, [queryClient, props.userInfo]);
  const amIFollowing = useMemo(() => {
    if (!props.userInfo || !props.userInfo.followers) return false;
    return (
      (currentUser?.following?.findIndex(
        (el) => el?.id === props.userInfo?.id
      ) ?? -1) >= 0
    );
  }, [currentUser, props.userInfo]);
  return (
    <div>
      <TwitterLayout>
        <div>
          <div className="flex flex-col items-center gap-1 mt-5">
            {props.userInfo?.profileImageURL && (
              <Image
                src={props.userInfo.profileImageURL}
                alt="user-profile-img"
                className="rounded-full"
                width={150}
                height={150}
              />
            )}
            <br />
            {props.userInfo?.firstName && props.userInfo.lastName && (
              <h1 className="text-lg md:text-2xl font-semibold text-center">
                {props.userInfo.firstName + " " + props.userInfo.lastName}
              </h1>
            )}
            <div className="flex text-md gap-3 text-slate-600">
              <span className="text-sm">
                {props.userInfo?.followers?.length} followers
              </span>
              <span className="text-sm">
                {props.userInfo?.following?.length} following
              </span>
            </div>
            <h1 className="text-sm md:text-md text-slate-400 font-semibold">
              {props.userInfo?.tweets?.length} Tweets
            </h1>
            {currentUser?.id !== props.userInfo?.id && (
              <>
                {amIFollowing && (
                  <button
                    onClick={handleunFollowUser}
                    className="bg-white text-sm rounded-full px-2 py-1 md:px-4 md:py-2 text-black"
                  >
                    Unfollow
                  </button>
                )}
                {!amIFollowing && (
                  <button
                    onClick={handleFollowUser}
                    className="bg-white rounded-full px-4 py-2 text-black"
                  >
                    Follow
                  </button>
                )}
              </>
            )}
          </div>
          <div>
            {props.userInfo &&
              props.userInfo.tweets &&
              props.userInfo.tweets.map((twt) => (
                <FeedCard data={twt as Tweet} key={twt?.id} />
              ))}
          </div>
        </div>
      </TwitterLayout>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<ServerProps> = async (
  context
) => {
  const id = context.query.id as string | undefined;
  console.log("user id: ", id);
  if (!id) {
    return { notFound: true, props: { user: undefined } };
  }

  try {
    const userInfo = await graphQLClient.request(getUserByIdQuery, {
      id,
    });

    if (!userInfo?.getUserById) {
      return { notFound: true };
    }
    console.log("user by id data:", userInfo.getUserById);
    return {
      props: { userInfo: userInfo.getUserById as User }, // Pass the fetched user data to the page component as props
    };
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return { notFound: true };
  }
};

export default userProfilePage;
