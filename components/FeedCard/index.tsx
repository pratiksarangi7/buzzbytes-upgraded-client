import React, { useState } from "react";
import Image from "next/image";
import { BiMessageRounded } from "react-icons/bi";
import { FaRetweet } from "react-icons/fa";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { Tweet } from "@/graphql/query/tweet";
import Link from "next/link";
import { useLikeTweet, useCreateComment } from "@/hooks/tweet";

interface FeedCardProps {
  data: Tweet;
}

const FeedCard: React.FC<FeedCardProps> = (props) => {
  const { data } = props;
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const { mutate: likeTweet } = useLikeTweet();
  const { mutate: createComment } = useCreateComment();

  const handleCreateComment = () => {
    createComment({ content: commentContent, tweetId: data.id });
    setCommentContent("");
  };
  const tagMapping = {
    FFCS: "FFCS",
    CABSHARING: "Cab Sharing",
    LOST_AND_FOUND: "Lost and Found",
    CAREER: "Career",
    EVENTS: "Events",
    EXAM_DISCUSSIONS: "Exam Discussions",
  };

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
      <div className="flex flex-col md:px-5">
        <p className="text-sm md:text-lg mt-2">{data.content}</p>

        {data.imageURL && (
          <div className="flex justify-center w-full mt-3">
            <Image
              src={data.imageURL}
              alt="tweet-image"
              height={300}
              width={300}
              className="rounded-lg cursor-pointer max-w-full max-h-full"
              style={{
                maxWidth: "300px",
                maxHeight: "300px",
              }}
            />
          </div>
        )}
      </div>

      <div className="flex w-full md:w-[90%] justify-between text-lg font-light md:text-2xl mt-3 items-center mx-auto">
        <div>
          <div className="py-1 px-2 text-xs md:text-sm border border-gray-500 rounded-lg">
            {tagMapping[data.tag]}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div onClick={() => setShowComments(!showComments)}>
            <BiMessageRounded className="text-sm md:text-xl" />
          </div>
          <span className="text-xs md:text-xl">{data.comments.length}</span>
        </div>
        <div>
          <FaRetweet className="text-sm md:text-xl" />
        </div>
        <div>
          <div
            className="flex items-center gap-1"
            onClick={() =>
              likeTweet({ tweetId: data.id, isCurrentlyLiked: data.isLiked })
            }
          >
            {data.isLiked ? (
              <AiFillHeart className="text-sm md:text-xl" />
            ) : (
              <AiOutlineHeart className="text-sm md:text-xl" />
            )}
            <span className="text-sm md:text-xl">
              {data.likeCount ? `${data.likeCount}` : "0"}
            </span>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="mt-2">
          <div className="mt-2 flex gap-1">
            <input
              type="text"
              className="w-full bg-transparent text-sm p-2 border-b border-gray-400 focus:outline-none"
              placeholder="Add a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
            />
            <button
              onClick={handleCreateComment}
              className="bg-buzzmain px-4 py-2 text-xs md:text-sm font-bold mt-2 rounded-full"
            >
              Comment
            </button>
          </div>
          {data.comments && data.comments.length > 0 && (
            <div>
              <h6 className="text-sm font-semibold mb-1 mt-1 md:mb-2 md:mt-3">
                Comments:
              </h6>
              {data.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="mt-1 md:mt-2 p-3 rounded-lg shadow-sm"
                >
                  <div className="flex items-center">
                    {comment.author.profileImageURL && (
                      <Image
                        src={comment.author.profileImageURL}
                        alt="comment-author-img"
                        height={30}
                        width={30}
                        className="rounded-full"
                      />
                    )}
                    <div className="ml-3">
                      <span className="text-sm font-medium ">
                        {comment.author.firstName} {comment.author.lastName}
                      </span>
                      <p className="text-xs">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedCard;
