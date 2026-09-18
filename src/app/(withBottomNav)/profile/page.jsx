"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  FaArrowLeft,
  FaEllipsis,
  FaLocationDot,
  FaEnvelope,
  FaMarsAndVenus,
  FaCakeCandles,
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaUserPlus,
} from "react-icons/fa6";
import { LuMessageSquareMore } from "react-icons/lu";
import PostImageViewer from "../user/[u]/components/PostImageViewer";
import Image from "next/image";
import { useSelector } from "react-redux";
import { setCurrentPost, setCurrentPosts, setIsViewingPost } from "@/redux/slices/stateSlice";
import { useDispatch } from "react-redux";
import PostsGrid from "./components/PostsGrid";
import { IoSettingsSharp } from "react-icons/io5";
import Link from "next/link";
import ProfileLoading from "./components/ProfileLoading";

export default function UserProfilePage() {

const [currentUser, setcurrentUser] = useState({})
const [postPage, setpostPage] = useState();
const [postCount, setpostCount] = useState();

  const dispatch = useDispatch();

const loggedInUserId = useSelector((state) => state?.userState?.loggedInUserId);
// console.log(loggedInUserId)
  const router = useRouter();
  const onlineIds = useSelector((state) => state?.onlineUsers?.ids);

const [profileLoading, setprofileLoading] = useState(true);
  const [isMenuOpen, setisMenuOpen] = useState(false)


  // fetch current user api call 
useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(
        `/api/profile`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to load user"
        );
      }
      setcurrentUser(data?.user);
      // console.log(data)
      // set current all post of user in redux variabel 
dispatch(setCurrentPosts(data?.posts))
      setpostCount(data?.count);
      setpostPage(data?.page);
      setprofileLoading(false);

    } catch (error) {
      setprofileLoading(false);
      console.error("Error fetching current user:", error);
    }
  };

  fetchCurrentUser();
}, []);
// calling user api end 


  if (!currentUser) {
    return (
      <main className="min-h-dvh bg-[#080808] text-white">
        <div className="mx-auto flex min-h-dvh max-w-[600px] items-center justify-center px-6">
          <div className="text-center">
            <p className="text-lg font-semibold">
              User not found
            </p>

            <button
              onClick={() => router.back()}
              className="
                mt-4
                rounded-xl
                bg-white
                px-5
                py-2.5
                text-sm
                font-semibold
                text-black
                active:scale-95
              "
            >
              Go back
            </button>
          </div>
        </div>
      </main>
    );
  }



  const formatDob = (dob) => {
    return new Date(dob).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };



  // WHEN CLICK ON IMAGE SHOW IMAGE VIEWER
  const isViewingPost = useSelector((state) => state?.userState?.isViewingPost);
  // WHEN CLICK ON IMAGE SHOW IMAGE VIEWER END 

  if(profileLoading) {
    return (
        <ProfileLoading />
);
  }

  return (
    <main className="min-h-dvh bg-[#080808] text-white">

    {isViewingPost && (
      <PostImageViewer
        onClose={() => {
          dispatch(setIsViewingPost(false));
        }}
      />
    )}

      <div className="mx-auto min-h-dvh w-full max-w-[600px] overflow-hidden">

        {/* =========================================
            TOP BAR
        ========================================= */}

        <header
          className="
            sticky
            top-0
            z-40
            flex
            h-14
            items-center
            justify-between
            border-b
            border-white/[0.06]
            bg-[#080808]/90
            px-4
            backdrop-blur-xl
          "
        >
          <button
            onClick={() => router.back()}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              text-white/80
              transition
              active:scale-90
            "
            aria-label="Go back"
          >
            <FaArrowLeft className="text-base" />
          </button>

          <div className="text-center">
            <p className="text-sm font-semibold">
              {currentUser?.username}
            </p>
          </div>

          <button
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              text-white/70
              transition
              active:scale-90
            "
            aria-label="More options"
          >
            <FaEllipsis className="text-lg" 
              onClick={()=>{
                setisMenuOpen(!isMenuOpen)
              }}
            />
          </button>
                              {isMenuOpen && (
                                <div
                                  className="
                                    absolute
                                    right-0
                                    top-11
                                    z-50
                                    w-48
                                    overflow-hidden
                                    rounded-2xl
                                    border
                                    border-white/[0.08]
                                    bg-[#171717]/95
                                    p-1.5
                                    shadow-2xl
                                    backdrop-blur-2xl
                                  "
                                >
          
                                  {/* Mark as read */}
          
                             
                                    <Link
                                      href={`/settings`}
                                      className="
                                        flex
                                        w-full
                                        items-center
                                        gap-3
                                        rounded-xl
                                        px-3
                                        py-3
                                        text-left
                                        text-sm
                                        text-white/80
                                        transition
                                        hover:bg-white/[0.07]
                                        active:bg-white/[0.1]
                                      "
                                    >
                                      <IoSettingsSharp className="text-xs text-white/50" />
          
                                      <span>
                                        Settings
                                      </span>
                                    </Link>
                            
          
                                  {/* Delete */}
          
                                  {/* <button
                                    type="button"
                                    onClick={() =>
                                      handleDelete(
                                        notification.not_id
                                      )
                                    }
                                    className="
                                      flex
                                      w-full
                                      items-center
                                      gap-3
                                      rounded-xl
                                      px-3
                                      py-3
                                      text-left
                                      text-sm
                                      text-red-400
                                      transition
                                      hover:bg-red-500/[0.08]
                                      active:bg-red-500/[0.12]
                                    "
                                  >
                                    <FaTrash className="text-xs" />
          
                                    <span>
                                      Delete
                                    </span>
                                  </button> */}
          
                                </div>
                              )}
          
        </header>

        {/* =========================================
            PROFILE HEADER
        ========================================= */}

        <section className="px-5 pb-5 pt-6">

          <div className="flex items-start gap-5">

            {/* Profile Image */}

            <div
              className="
                shrink-0
                rounded-full
                bg-gradient-to-tr
                from-fuchsia-500
                via-pink-500
                to-orange-400
                p-[2px]
              "
            >
              <div className="rounded-full bg-[#080808] relative p-[3px]">
                                  {currentUser?.id && onlineIds.includes(currentUser?.id) ? (
                       <span className="text-green-500 text-[17px] absolute top-[19px] z-[99999] min-w-[10px] min-h-[10px] bg-[#31ff00] right-0 rounded-full"></span>
              ) : null}
                <Image
                width={64}
                height={64}
                  src={currentUser?.image}
                  alt={currentUser?.fullName}
                  className="
                    h-24
                    w-24
                    rounded-full
                    object-cover
                    sm:h-28
                    sm:w-28
                  "
                   preload
                />
              </div>
            </div>

            {/* Stats */}

            <div className="flex items-center justify-center pt-3">

              <div className="text-center">
                <p className="text-lg font-bold">
                  {postCount}
                </p>

                <p className="text-[11px] text-white/45">
                  Posts
                </p>
              </div>

              <div className="h-8 w-px bg-white/[0.08]" />

              {/* <div className="text-center">
                <p className="text-lg font-bold">
                  {currentUser?.distance}
                </p>

                <p className="text-[11px] text-white/45">
                  km away
                </p>
              </div> */}
            </div>
          </div>

          {/* Name */}

          <div className="mt-5">
            <h1 className="text-xl font-bold">
              {currentUser?.fullName}  (You)
            </h1>

            <p className="mt-0.5 text-sm text-white/45">
              @{currentUser?.username}
            </p>
          </div>

          {/* Action */}

          <button
            className="
              mt-4
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-white
              py-3
              text-sm
              font-semibold
              text-black
              transition
              active:scale-[0.98]
            "
          >
            <LuMessageSquareMore className="text-sm" />
            Message Yourself
          </button>

       

          <div className="mt-3 grid grid-cols-2 gap-2">

            {/* Email */}

            <div
              className="
                rounded-xl
                border
                border-white/[0.06]
                bg-white/[0.035]
                p-3
              "
            >
              <FaEnvelope className="mb-2 text-xs text-white/40" />

              <p className="truncate text-xs text-white/80">
                {currentUser?.email}
              </p>

              <p className="mt-0.5 text-[9px] text-white/30">
                Email
              </p>
            </div>

            {/* Gender */}

            <div
              className="
                rounded-xl
                border
                border-white/[0.06]
                bg-white/[0.035]
                p-3
              "
            >
              <FaMarsAndVenus className="mb-2 text-xs text-white/40" />

              <p className="text-xs text-white/80">
                {currentUser?.gender}
              </p>

              <p className="mt-0.5 text-[9px] text-white/30">
                Gender
              </p>
            </div>

            {/* DOB */}

            <div
              className="
                rounded-xl
                border
                border-white/[0.06]
                bg-white/[0.035]
                p-3
              "
            >
              <FaCakeCandles className="mb-2 text-xs text-white/40" />

              <p className="text-xs text-white/80">
                {formatDob(currentUser?.dob)}
              </p>

              <p className="mt-0.5 text-[9px] text-white/30">
                Birthday · {currentUser?.age} years
              </p>
            </div>

            {/* Username */}

            <div
              className="
                rounded-xl
                border
                border-white/[0.06]
                bg-white/[0.035]
                p-3
              "
            >
              <p className="mb-2 text-xs font-bold text-white/40">
                @
              </p>

              <p className="truncate text-xs text-white/80">
                {currentUser?.username}
              </p>

              <p className="mt-0.5 text-[9px] text-white/30">
                Username
              </p>
            </div>
          </div>
        </section>

        {/* =========================================
            POSTS HEADER
        ========================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            border-y
            border-white/[0.06]
            px-5
            py-3
          "
        >
          <div>
            <p className="text-sm font-semibold">
              Posts
            </p>

            <p className="text-[10px] text-white">
              {postCount} posts
            </p>
          </div>
        </div>

        {/* =========================================
            POSTS GRID
        ========================================= */}
{/* appears all posts grid by grid  */}

<PostsGrid />
      </div>
    </main>
  );
}