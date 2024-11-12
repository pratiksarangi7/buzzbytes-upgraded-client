import { useCurrentUser } from "@/hooks/user";
import { BiHash, BiUser } from "react-icons/bi";
import { BsBell, BsBookmark, BsEnvelope, BsTwitter } from "react-icons/bs";
import { FaHome } from "react-icons/fa";
import { SlOptions } from "react-icons/sl";
import Image from "next/image";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { graphQLClient } from "@/clients/api";
import { verifyUserGoogleTokenQuery } from "@/graphql/query/user";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

interface TwitterLayoutProps {
  children: React.ReactNode;
}

interface TwitterSidebarButton {
  title: string;
  icon: React.ReactNode;
  link: string;
}

const TwitterLayout: React.FC<TwitterLayoutProps> = (props) => {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const sidebarMenuItems: TwitterSidebarButton[] = useMemo(
    () => [
      {
        title: "Home",
        icon: <FaHome />,
        link: "/",
      },
      {
        title: "Explore",
        icon: <BiHash />,
        link: "/",
      },
      {
        title: "Notification",
        icon: <BsBell />,
        link: "/",
      },
      {
        title: "Messages",
        icon: <BsEnvelope />,
        link: "/",
      },
      {
        title: "Bookmarks",
        icon: <BsBookmark />,
        link: "/",
      },
      {
        title: "Profile",
        icon: <BiUser />,
        link: `${user?.id}`,
      },
      {
        title: "More",
        icon: <SlOptions />,
        link: "/",
      },
    ],
    [user]
  );

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

  return (
    <div className="grid grid-cols-12 h-screen w-screen bg-bg gap-0">
      <div className="col-span-12 md:col-span-3 flex flex-col justify-start pl-5 md:pl-24 pr-5 md:pr-10 pt-5 w-full relative">
        <div className="text-4xl h-fit w-fit p-5 hover:bg-gray-800 rounded-full cursor-pointer transition-all">
          <BsTwitter />
        </div>
        <div>
          <ul>
            {sidebarMenuItems.map((item) => (
              <li
                key={item.title}
                className="flex items-center gap-3 text-[20px] font-semibold cursor-pointer hover:bg-gray-700 rounded-3xl w-fit px-2 py-3"
              >
                <Link href={item.link}>
                  <span className="flex items-center gap-3">
                    {item.icon}
                    <span className="hidden md:inline">{item.title}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {user && (
          <div className="mt-5 absolute bottom-5 flex items-center gap-3 bg-cardcol px-3 py-2 rounded-full">
            {user.profileImageURL && (
              <Image
                className="rounded-full"
                src={user.profileImageURL}
                alt="user-img"
                height={50}
                width={50}
              />
            )}
            <div className="flex gap-1">
              <h3 className="text-xl">{user.firstName}</h3>
              <h3 className="text-xl">{user.lastName}</h3>
            </div>
          </div>
        )}
      </div>

      <div className="col-span-12 md:col-span-6  h-screen overflow-scroll no-scrollbar">
        {props.children}
      </div>
      <div className="col-span-12 md:col-span-3 p-5 md:pr-24">
        {!user ? (
          <div className="border p-5 text-xl bg-cardcol rounded-lg text-center flex flex-col items-center">
            <h1 className="text-2xl">New to buzzBytes?</h1>
            <br />
            <GoogleLogin onSuccess={handleLoginWithGoogle} />
          </div>
        ) : (
          <div className="bg-cardcol p-5 rounded-lg">
            <h1 className="text-xl font-bold text-center">
              Users you may know
            </h1>
            <br />
            {user?.recommendedUsers?.map((ele) => (
              <div key={ele?.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {ele?.profileImageURL && (
                    <Image
                      src={ele?.profileImageURL}
                      alt="user-img"
                      className="rounded-full"
                      width={37}
                      height={37}
                    />
                  )}
                  <div className="text-lg">
                    {ele?.firstName + " " + ele?.lastName}
                  </div>
                </div>
                <Link
                  href={`/${ele?.id}`}
                  className="bg-white text-black text-sm px-3 py-2 rounded-xl text-center"
                >
                  view
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TwitterLayout;
