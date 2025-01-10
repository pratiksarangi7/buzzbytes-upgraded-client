import React, { useState, useCallback } from "react";
import TwitterLayout from "@/components/Layout/layout";
import { useCurrentUser } from "@/hooks/user";
import Image from "next/image";
import Link from "next/link";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import toast from "react-hot-toast";
import { graphQLClient } from "@/clients/api";
import { verifyUserGoogleTokenQuery } from "@/graphql/query/user";
import { useQueryClient } from "@tanstack/react-query";

export default function Connections() {
  const { user: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<"followers" | "following">(
    "followers"
  );

  const handleTabClick = (tab: "followers" | "following") => {
    setSelectedTab(tab);
  };
  const handleLoginWithGoogle = useCallback(
    async (cred: CredentialResponse) => {
      const googleToken = cred.credential;
      if (!googleToken) return toast.error(`Google token not found!`);
      const { verifyGoogleToken } = await graphQLClient.request(
        verifyUserGoogleTokenQuery,
        {
          token: googleToken,
        }
      );
      toast.success("verified successfully!");
      if (verifyGoogleToken) {
        window.localStorage.setItem("buzzbytes_token", verifyGoogleToken);
        await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      }
    },
    []
  );

  if (!currentUser) {
    return (
      <TwitterLayout>
        <div className="p-5 w-full">
          <div className="block lg:hidden">
            <div className=" p-5 text-sm  rounded-lg text-center flex flex-col items-center">
              <h1 className="text-sm font-semibold ">New to buzzBytes?</h1>
              <br />
              <GoogleLogin onSuccess={handleLoginWithGoogle} />
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="text-center text-lg md:text-xl pt-5">
              You must log in to view connections.
            </div>
          </div>
        </div>
      </TwitterLayout>
    );
  }

  return (
    <TwitterLayout>
      <div className="p-5 w-full">
        <div className="flex justify-center mb-5 w-full">
          <div className="relative flex bg-gray-200 rounded-full p-1">
            <button
              onClick={() => handleTabClick("followers")}
              className={`px-4 py-2 rounded-full text-sm md:text-lg z-10 transition-colors duration-300 font-semibold ${
                selectedTab === "followers" ? "text-white" : "text-gray-800"
              }`}
            >
              Followers
            </button>
            <button
              onClick={() => handleTabClick("following")}
              className={`px-4 py-2 rounded-full z-10 text-sm md:text-lg  transition-colors duration-300 font-semibold ${
                selectedTab === "following" ? "text-white" : "text-gray-800"
              }`}
            >
              Following
            </button>
            <div
              className={`absolute top-0 bottom-0 left-0 w-1/2 bg-buzzmain font-bold rounded-full transition-transform duration-300 ${
                selectedTab === "following" ? "transform translate-x-full" : ""
              }`}
            ></div>
          </div>
        </div>
        <div className="flex flex-col items-center w-full">
          {selectedTab === "followers" && currentUser?.followers && (
            <div className="w-full py-5">
              {currentUser.followers.map((follower) => (
                <div
                  key={follower?.id}
                  className="flex items-center justify-between w-full mb-4 bg-cardcol px-2 py-1 rounded-xl"
                >
                  <div className="flex items-center">
                    {follower?.profileImageURL && (
                      <Image
                        src={follower.profileImageURL}
                        alt="follower-img"
                        height={40}
                        width={40}
                        className="rounded-full"
                      />
                    )}
                    <div className="ml-3">
                      <span className="font-medium text-sm md:text-base">
                        {follower?.firstName}{" "}
                        <span className="hidden md:inline">
                          {follower?.lastName}
                        </span>
                      </span>
                    </div>
                  </div>
                  <Link href={`/${follower?.id}`}>
                    <button className="ml-3 bg-white text-black px-2 py-1 md:px-3 md:py-1 rounded text-sm md:text-base">
                      View
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
          {selectedTab === "following" && currentUser?.following && (
            <div className="w-full py-5">
              {currentUser.following.map((following) => (
                <div
                  key={following?.id}
                  className="flex items-center justify-between w-full mb-4 bg-cardcol px-2 py-1 rounded-xl"
                >
                  <div className="flex items-center">
                    {following?.profileImageURL && (
                      <Image
                        src={following.profileImageURL}
                        alt="following-img"
                        height={40}
                        width={40}
                        className="rounded-full"
                      />
                    )}
                    <div className="ml-3">
                      <span className="font-medium text-sm md:text-base">
                        {following?.firstName}{" "}
                        <span className="hidden md:inline">
                          {following?.lastName}
                        </span>
                      </span>
                    </div>
                  </div>
                  <Link href={`/${following?.id}`}>
                    <button className="ml-3 bg-white text-black px-2 py-1 md:px-3 md:py-1 rounded text-sm md:text-base">
                      View
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TwitterLayout>
  );
}
