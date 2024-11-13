import React from "react";
import Image from "next/image";
import { BiMessageRounded, BiUpload } from "react-icons/bi";
import { FaRetweet } from "react-icons/fa";
import { AiOutlineHeart } from "react-icons/ai";
import { Tweet } from "@/graphql/query/tweet";
import Link from "next/link";

interface FeedCardProps {
  data: Tweet;
}

const FeedCard: React.FC<FeedCardProps> = (props) => {
  const { data } = props;
  return (
    <div className="bg-cardcol hover:shadow-lg hover:scale-105 border rounded-xl mt-5 mx-2 md:mx-5 p-3 md:p-5 border-l-0 border-b-0 border-gray-700 transition-all cursor-pointer">
      <div className="grid grid-cols-12 gap-2 md:gap-5">
        <div className="col-span-2 md:col-span-1">
          {data.author.profileImageURL && (
            <Image
              src={data.author.profileImageURL}
              alt="user-img"
              height={40}
              width={40}
              className="rounded-full"
            />
          )}
        </div>
        <div className="col-span-10 md:col-span-11">
          <h5 className="text-base md:text-xl font-semibold">
            <Link href={`/${data.author.id}`}>
              {data.author.firstName + " " + data.author.lastName}
            </Link>
          </h5>
        </div>
      </div>
      <div className="flex flex-col md:px-5 ">
        <p className="text-sm md:text-lg mt-2">{data.content}</p>

        {data.imageURL && (
          <div className="flex  justify-center w-full mt-3">
            <Image
              src={data.imageURL}
              alt="img"
              height={300}
              width={300}
              className="rounded-lg"
            />
          </div>
        )}
      </div>

      <div className="flex w-[90%] justify-between text-lg md:text-2xl mt-3 items-center mx-auto">
        <div>
          <BiMessageRounded />
        </div>
        <div>
          <FaRetweet />
        </div>
        <div>
          <AiOutlineHeart />
        </div>
        <div>
          <BiUpload />
        </div>
      </div>
    </div>
  );
};

export default FeedCard;
