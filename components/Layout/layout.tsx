import { useCurrentUser } from "@/hooks/user";
import { BiHash, BiUser } from "react-icons/bi";
import { FaHome } from "react-icons/fa";
import Image from "next/image";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { graphQLClient } from "@/clients/api";
import { verifyUserGoogleTokenQuery } from "@/graphql/query/user";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Logo from "../Logo";

interface LayoutProps {
  children: React.ReactNode;
}

interface SidebarButton {
  title: string;
  icon: React.ReactNode;
  link: string;
}

const TwitterLayout: React.FC<LayoutProps> = (props) => {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const sidebarMenuItems: SidebarButton[] = useMemo(
    () => [
      {
        title: "Home",
        icon: <FaHome />,
        link: "/",
      },
      {
        title: "Profile",
        icon: <BiUser />,
        link: `${user?.id}`,
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
      <div className="col-span-2 md:col-span-3 flex flex-col pl-4 md:pl-20 pt-8 items-center md:items-start justify-start w-full relative">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-xl md:text-2xl font-bold hidden md:block">
            BuzzBytes
          </span>
        </div>
        <div className="md:pl-5">
          <ul>
            {sidebarMenuItems.map((item) => (
              <li
                key={item.title}
                className="flex items-center gap-3 text-lg md:text-[20px] font-semibold cursor-pointer hover:bg-gray-700 rounded-3xl w-fit px-2 py-3"
              >
                <Link href={item.link}>
                  <span className="flex items-center gap-3">
                    {item.icon}
                    <span className="hidden md:block">{item.title}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {user && (
          <div className="mt-5 absolute bottom-5 flex items-center gap-3 bg-cardcol md:px-3 md:py-2 rounded-full">
            {user.profileImageURL && (
              <Image
                className="rounded-full"
                src={user.profileImageURL}
                alt="user-img"
                height={40}
                width={40}
              />
            )}
            <div className="hidden md:flex gap-1">
              <h3 className="text-lg md:text-xl">{user.firstName}</h3>
              <h3 className="text-lg md:text-xl">{user.lastName}</h3>
            </div>
          </div>
        )}
      </div>

      <div className="col-span-10 md:col-span-6 h-screen overflow-scroll no-scrollbar">
        {props.children}
      </div>

      <div className="col-span-12 md:col-span-3 p-4 md:p-5 md:pr-24">
        {!user ? (
          <div className="border p-5 text-lg md:text-xl bg-cardcol rounded-lg text-center flex flex-col items-center">
            <h1 className="text-xl md:text-2xl">New to buzzBytes?</h1>
            <br />
            <GoogleLogin onSuccess={handleLoginWithGoogle} />
          </div>
        ) : (
          <div className="bg-cardcol p-5 rounded-lg hidden md:block">
            <h1 className="text-lg md:text-xl font-bold text-center">
              Users you may know
            </h1>
            <br />
            {user.recommendedUsers?.length == 0 ? (
              <div className="text-center w-full">
                No recommendations for now
              </div>
            ) : (
              user?.recommendedUsers?.map((ele) => (
                <div
                  key={ele?.id}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    {ele?.profileImageURL && (
                      <Image
                        src={ele?.profileImageURL}
                        alt="user-img"
                        className="rounded-full"
                        width={32}
                        height={32}
                      />
                    )}
                    <div className="text-sm md:text-lg">
                      {ele?.firstName + " " + ele?.lastName}
                    </div>
                  </div>
                  <Link
                    href={`/${ele?.id}`}
                    className="bg-white text-black text-xs md:text-sm px-3 py-2 rounded-xl text-center"
                  >
                    view
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TwitterLayout;
