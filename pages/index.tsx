import Image from "next/image";
import localFont from "next/font/local";
import { FaHome, FaTwitter } from "react-icons/fa";
import { BsBell, BsBookmark, BsEnvelope, BsTwitter } from "react-icons/bs";
import { BiHash, BiUser, BiImageAlt } from "react-icons/bi";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import FeedCard from "@/components/FeedCard";
import { SlOptions } from "react-icons/sl";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { graphQLClient } from "@/clients/api";
import { verifyUserGoogleTokenQuery } from "@/graphql/query/user";
import { verify } from "crypto";
import { useCurrentUser } from "@/hooks/user";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateTweet, useGetAllTweets } from "@/hooks/tweet";
import TwitterLayout from "@/components/Layout/layout";
import {
  getAllTweetsQuery,
  getSignedURLForTweetQuery,
  Tweet,
} from "@/graphql/query/tweet";
import { GetServerSideProps } from "next";
import axios from "axios";
import { headers } from "next/headers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

interface TwitterSidebarButton {
  title: string;
  icon: React.ReactNode;
}

const sidebarMenuItems: TwitterSidebarButton[] = [
  {
    title: "Home",
    icon: <FaHome />,
  },
  {
    title: "Explore",
    icon: <BiHash />,
  },
  {
    title: "Notification",
    icon: <BsBell />,
  },
  {
    title: "Messages",
    icon: <BsEnvelope />,
  },
  {
    title: "Bookmarks",
    icon: <BsBookmark />,
  },
  {
    title: "Profile",
    icon: <BiUser />,
  },
  {
    title: "More",
    icon: <SlOptions />,
  },
];

interface HomeProps {
  tweets?: Tweet[];
}

export default function Home(props: HomeProps) {
  const { user } = useCurrentUser();
  const { tweets = props.tweets as Tweet[] } = useGetAllTweets();
  const { mutateAsync } = useCreateTweet();

  const [content, setContent] = useState("");
  const [imageURL, setImageURL] = useState("");
  const handleInputChangeFile = useCallback((input: HTMLInputElement) => {
    return async (event: Event) => {
      event.preventDefault();
      console.log(input.files);
      const file: File | null | undefined = input.files?.item(0);
      if (!file) return;
      const { getSignedURLForTweet } = await graphQLClient.request(
        getSignedURLForTweetQuery,
        {
          imageType: file.type.split("/")[1],
        }
      );
      if (getSignedURLForTweet) {
        toast.loading("Uploading.....", { id: "2" });
        console.log(getSignedURLForTweet);
        await axios.put(getSignedURLForTweet, file, {
          headers: {
            "Content-type": file.type,
          },
        });
        toast.success("Upload complete!", { id: "2" });
        const url = new URL(getSignedURLForTweet);
        const myFilePath = `${url.origin}${url.pathname}`;
        setImageURL(myFilePath);
      }
    };
  }, []);

  const handleSelectImage = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*,application/pdf");
    const handlerFn = handleInputChangeFile(input);
    input.addEventListener("change", handlerFn);
    input.click();
  }, [handleInputChangeFile]);
  const handleCreateTweet = useCallback(async () => {
    await mutateAsync({ content, imageURL });
    setContent("");
    setImageURL("");
  }, [content, mutateAsync, imageURL]);
  return (
    <TwitterLayout>
      <div className="col-span-6 h-screen overflow-scroll no-scrollbar">
        <div>
          <div className="rounded-xl mt-5 border border-cardcol mx-2 md:mx-5 pt-1 px-2 pb-2 md:p-5  hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
            <div className="grid grid-cols-12 gap-1 md:gap-5">
              <div className="hidden md:block md:col-span-1">
                {user && user.profileImageURL && (
                  <Image
                    src={user.profileImageURL}
                    alt="user-img"
                    height={50}
                    width={50}
                    className="rounded-full"
                  />
                )}
              </div>
              <div className=" col-span-12 md:col-span-11  ">
                <textarea
                  className="w-full bg-transparent text-sm md:text-xl p-3 border-b border-gray-400 focus:outline-none"
                  rows={5}
                  placeholder="What's Happening?..."
                  name=""
                  id=""
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>
                {imageURL && (
                  <Image
                    src={imageURL}
                    alt="tweet-img"
                    width={200}
                    height={200}
                  />
                )}
                <div className="text-2xl mt-2 flex justify-between items-center">
                  <BiImageAlt onClick={() => handleSelectImage()} />
                  <button
                    onClick={handleCreateTweet}
                    className="bg-buzzmain  px-4 py-2 text-xs md:text-sm font-bold ml-5  rounded-full"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {tweets &&
          tweets.map((tweet) =>
            tweet ? <FeedCard key={tweet.id} data={tweet as Tweet} /> : null
          )}
      </div>
    </TwitterLayout>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async (
  context
) => {
  const allTweets = await graphQLClient.request(getAllTweetsQuery);
  return {
    props: {
      tweets: allTweets.getAllTweets as Tweet[],
    },
  };
};
