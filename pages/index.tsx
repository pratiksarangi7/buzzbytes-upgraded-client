import React, { useCallback, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { BiImageAlt } from "react-icons/bi";
import { Tag } from "@/gql/graphql";
import { useCreateTweet, useGetAllTweets } from "@/hooks/tweet";
import TwitterLayout from "@/components/Layout/layout";
import FeedCard from "@/components/FeedCard";
import { graphQLClient } from "@/clients/api";
import {
  getAllTweetsQuery,
  getSignedURLForTweetQuery,
  Tweet,
} from "@/graphql/query/tweet";
import { GetServerSideProps } from "next";
import axios from "axios";
import toast from "react-hot-toast";
import { useCurrentUser } from "@/hooks/user";

const tagDisplayNames: { [key in Tag]: string } = {
  [Tag.Ffcs]: "FFCS",
  [Tag.Cabsharing]: "Cab Sharing",
  [Tag.LostAndFound]: "Lost and Found",
  [Tag.Career]: "Career",
  [Tag.Events]: "Events",
  [Tag.ExamDiscussions]: "Exam Discussions",
};

interface HomeProps {
  tweets?: Tweet[];
}

export default function Home(props: HomeProps) {
  const { user } = useCurrentUser();
  const { tweets = props.tweets as Tweet[] } = useGetAllTweets();
  const { mutateAsync } = useCreateTweet();

  const [content, setContent] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<Tag | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  const handleTagSelect = (tag: Tag) => {
    setSelectedTag(tag);
    setShowDropdown(false);
  };

  const handleFilterTagSelect = (tag: Tag) => {
    setFilterTag(tag);
    setShowFilterDropdown(false);
  };

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
    if (!selectedTag) {
      toast.error("Please select a tag");
      return;
    }
    if (content.trim().length == 0) {
      toast.error("Your post can't be empty");
    }

    await mutateAsync({ content, imageURL, tag: selectedTag });
    setContent("");
    setImageURL("");
    setSelectedTag(null);
  }, [content, mutateAsync, imageURL, selectedTag]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, filterDropdownRef]);

  const filteredTweets = tweets
    ? tweets.filter((tweet) => {
        const searchLower = searchQuery.toLowerCase();
        const matchesQuery =
          tweet &&
          (tweet.content.toLowerCase().includes(searchLower) ||
            (tweet.author &&
              (tweet.author.firstName.toLowerCase().includes(searchLower) ||
                (tweet.author.lastName &&
                  tweet.author.lastName.toLowerCase().includes(searchLower)))));
        const matchesFilterTag =
          !filterTag || (tweet && tweet.tag === filterTag);
        return matchesQuery && matchesFilterTag;
      })
    : [];

  return (
    <TwitterLayout>
      <div className="col-span-6 h-screen overflow-scroll no-scrollbar">
        <div>
          <div className="rounded-xl mt-5 border border-cardcol mx-2 md:mx-5 pt-1 px-2 pb-2 md:p-5 cursor-pointer">
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
              <div className="col-span-12 md:col-span-11">
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
                <div className="text-2xl mt-2 flex justify-between items-center relative">
                  <div className="flex">
                    <BiImageAlt onClick={() => handleSelectImage()} />
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="ml-2 bg-gray-200 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded"
                    >
                      {selectedTag
                        ? `${tagDisplayNames[selectedTag]}`
                        : "Select Tag"}
                    </button>
                    {showDropdown && (
                      <div
                        ref={dropdownRef}
                        className="absolute mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10"
                      >
                        {Object.values(Tag).map((tag) => (
                          <div
                            key={tag}
                            className="px-4 py-2 text-sm md:text-base hover:bg-gray-100 cursor-pointer text-gray-700 font-medium"
                            onClick={() => handleTagSelect(tag)}
                          >
                            {tagDisplayNames[tag]}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleCreateTweet}
                    className="bg-buzzmain px-4 py-2 text-xs md:text-sm font-bold ml-5 rounded-full"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex  rounded-xl py-2 px-1 border-2 border-cardcol pr-5 gap-3 items-center justify-between  mt-5 mx-2 md:mx-5 relative">
          <div className="relative flex items-center font-semibold text-white rounded-full p-1">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="ml-2 text-white font-semibold rounded text-sm md:text-lg"
            >
              {filterTag ? `${tagDisplayNames[filterTag]}` : "Filter"}
            </button>
            {showFilterDropdown && (
              <div
                ref={filterDropdownRef}
                className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10"
              >
                {Object.values(Tag).map((tag) => (
                  <div
                    key={tag}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 font-medium"
                    onClick={() => handleFilterTagSelect(tag)}
                  >
                    {tagDisplayNames[tag]}
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            className="w-full bg-transparent text-sm md:text-lg  border-none focus:outline-none"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredTweets &&
          filteredTweets.map((tweet) =>
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
