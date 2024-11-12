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
    <div className="bg-cardcol hover:shadow-lg hover:scale-105 border rounded-xl mt-5 mx-5 p-5 border-l-0 border-b-0 border-gray-700  transition-all cursor-pointer">
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-1">
          {data.author.profileImageURL && (
            <Image
              src={data.author.profileImageURL}
              alt="user-img"
              height={50}
              width={50}
              className="rounded-full"
            />
          )}
        </div>
        <div className="col-span-11">
          <h5 className="text-xl font-bold">
            <Link href={`/${data.author.id}`}>
              {data.author.firstName + " " + data.author.lastName}
            </Link>
          </h5>
          <br />
          <p className="text-lg">{data.content}</p>

          {data.imageURL && (
            <div className="flex justify-center w-full">
              <Image src={data.imageURL} alt="img" height={400} width={400} />
            </div>
          )}
          <div className="flex justify-between text-2xl mt-3 items-center w-[90%]">
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
      </div>
    </div>
  );
};

export default FeedCard;
