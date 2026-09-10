"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

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
import PostImageViewer from "./components/PostImageViewer";
import Image from "next/image";
import { useSelector } from "react-redux";
import { setCurrentPost, setCurrentPosts, setIsViewingPost } from "@/redux/slices/stateSlice";
import { useDispatch } from "react-redux";
import DpImageViewer from "./components/DpImageViewer";
import axiosInstance from "@/lib/axiosInstance";
import ProfileLoading from "../../profile/components/ProfileLoading";


export default function UserProfilePage() {
  const onlineIds = useSelector((state) => state?.onlineUsers?.ids);

const [currentUser, setcurrentUser] = useState({})
const [postPage, setpostPage] = useState();
const [postCount, setpostCount] = useState();
  const loggedInUserId = useSelector((state) => state?.userState?.loggedInUserId);

const currentUserPosts = useSelector((state) => state?.userState?.currentPosts);
const [isDpImageViewing, setIsDpImageViewing] = useState(false)


  const searchParams = useSearchParams();
  const source = searchParams.get("source"); // "VALUE" ya null

  const [loading, setloading] = useState(true);

  const params = useParams();
  const router = useRouter();
const [starting, setStarting] = useState(false);
  const username = params.u;

  // fetch current user api call 
useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
       const query = source ? `?source=${source}` : "";
      //  console.log(query, "query")
      const response = await fetch(
        `/api/users/${username}${query}`,
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
// console.log(data?.user)
      if (data?.user) {
        setcurrentUser(data?.user);
        //  set posts in a redux state variabel | this is the post of user whose profile is being viewed
        dispatch(setCurrentPosts(data?.posts));
        setpostCount(data?.count);
        setpostPage(data?.page);
        setloading(false);
      }
    //   setcurrentUser(data?.user);
    // //  set posts in a redux state variabel | this is the post of user whose profile is being viewed
    //   dispatch(setCurrentPosts(data?.posts));
    //   setpostCount(data?.count);
    //   setpostPage(data?.page);

    } catch (error) {
      setloading(false);
      console.error("Error fetching current user:", error);
    }
  };

  fetchCurrentUser();
}, [username]);

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

// WHEN CLICK ON MESSAGE BUTTON
// Profile page ke handleMessageClick me:
const handleMessageClick = async () => {
  if (starting) return;
  setStarting(true);

  try {
    const res = await axiosInstance.post("/api/conversations", {
      targetUserId: currentUser?.id,
    });

    const conversationId = res?.data?.conversationId;

    // otherUser ka data bhi query params me bhej do (encode karke)
    const params = new URLSearchParams({
      conversationId,
      otherUserId: currentUser?.id,
      otherUserName: currentUser?.fullName,
      otherUserUsername: currentUser?.username,
      otherUserImage: currentUser?.image || "",
    });

    router.push(`/chats?${params.toString()}`);
  } catch (error) {
    console.error("Failed to start conversation:", error);
  } finally {
    setStarting(false);
  }
};
// WHEN CLICK ON MESSAGE BUTTONEND
  // WHEN CLICK ON IMAGE SHOW IMAGE VIEWER
  const isViewingPost = useSelector((state) => state?.userState?.isViewingPost);
  const dispatch = useDispatch();
  
  const handleViewImage = (post) => {
dispatch(setCurrentPost(post));
    dispatch(setIsViewingPost(true));
    // console.log(isViewingPost, "isViewingPost")
    
  };
  
  // WHEN CLICK ON IMAGE SHOW IMAGE VIEWER END 
// console.log(currentUser)


// WHEN CLICK ON DP IMAGE 
const handleViewDp = (currrenUser)=>{
 setIsDpImageViewing(true);
} 
// WHEN CLICK ON DP IMAGE END
// console.log(currentUser)

// if loading 
if(loading){
  return (
<ProfileLoading></ProfileLoading>

  )
  }


  return (
    <main className="min-h-dvh bg-[#080808] text-white">

{/* this is to show particular post image  */}
    {isViewingPost && (
      <PostImageViewer
        onClose={() => {
          dispatch(setIsViewingPost(false));
        }}
      />
    )}

{/* this is to show dp image of a user  */}
    {isDpImageViewing && (
      <DpImageViewer
        dpImage={currentUser}
        setIsDpImageViewing={setIsDpImageViewing}
        isDpImageViewing={isDpImageViewing}
        onClose={() => {
          setIsDpImageViewing(false);
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
            <FaEllipsis className="text-lg" />
          </button>
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
              <div className="rounded-full relative bg-[#080808] p-[3px]">
           

                             {currentUser?.id && onlineIds.includes(currentUser?.id) ? (
                       <span className="text-green-500 text-[17px] absolute top-[19px] z-[99999] min-w-[10px] min-h-[10px] bg-[#31ff00] right-0 rounded-full"></span>
              ) : null}

 {typeof currentUser?.image === "string" && currentUser.image.trim() !== "" && (
                   <Image
                   onClick={()=>{
                     handleViewDp(currentUser)
                   }}
                width={50}
                height={50}
                  src={currentUser?.image }
                  alt={currentUser?.fullName}
                  className="
                    h-24
                    w-24
                    rounded-full
                    object-cover
                    sm:h-28
                    sm:w-28
                  "
                />
            )
           }
              </div>
            </div>

            {/* Stats */}

            <div className="flex flex-1 items-center justify-around pt-3">

              <div className="text-center">
                <p className="text-lg font-bold">
                  {postCount}
                </p>

                <p className="text-[11px] text-white/45">
                 {loggedInUserId == currentUser?.id ? "Your Posts" :  "Posts"}
                </p>
              </div>

              <div className="h-8 w-px bg-white/[0.08]" />

   {
     loggedInUserId == currentUser?.id ? null :
                <div className="text-center">
                <p className="text-lg font-bold">
                  {currentUser?.distance}
                </p>

                <p className="text-[11px] text-white/45">
                  km away
                </p>
              </div>
   }
            </div>
          </div>

          {/* Name */}

          <div className="mt-5">
            <h1 className="text-xl font-bold">
              {currentUser?.fullName} {loggedInUserId == currentUser?.id ? <span className="text-green-500 text-sm">(You)</span> : null}
            </h1>

            <p className="mt-0.5 text-sm text-white/45">
              @{currentUser?.username}
            </p>
          </div>

          {/* Action */}
          {
            loggedInUserId == currentUser?.id ? null :           <button
            type="button"
  onClick={handleMessageClick}
  disabled={starting}
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
         {starting ? "Opening..." : "Message"}
          </button>

          }




          {/* Distance */}

          <div
            className="
              mt-4
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-white/[0.06]
              bg-white/[0.035]
              px-4
              py-3
            "
          >
            <div
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-white/[0.07]
              "
            >
              <FaLocationDot className="text-xs text-white/70" />
            </div>

            <div>
              <p className="text-[10px] text-[#c1c1c1]">
                Address
              </p>

              <p className="text-sm font-medium">
                {currentUser?.location}
              </p>
            </div>
          </div>

      {
        loggedInUserId == currentUser?.id ? null :         
            <div
            className="
              mt-4
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-white/[0.06]
              bg-white/[0.035]
              px-4
              py-3
            "
          >
            <div
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-white/[0.07]
              "
            >
              <FaLocationDot className="text-xs text-white/70" />
            </div>

            <div>
              <p className="text-[10px] text-[#c1c1c1]">
                Distance
              </p>

              <p className="text-sm font-medium">
                {currentUser?.distance} km away
              </p>
            </div>
          </div>

      }
          {/* =========================================
              USER INFORMATION
          ========================================= */}

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

              <p className="mt-0.5 text-[9px] text-[#c1c1c1]">
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

              <p className="mt-0.5 text-[9px] text-[#c1c1c1]">
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

              <p className="mt-0.5 text-[9px] text-[#c1c1c1]">
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

              <p className="mt-0.5 text-[9px] text-[#c1c1c1]">
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
              {postCount}
            </p>
          </div>
        </div>

        {/* =========================================
            POSTS GRID
        ========================================= */}

        <section className="grid grid-cols-3 gap-[2px] pb-24">

          {currentUserPosts?.map((post) => {


            return (
              <button
              onClick={()=>{
                handleViewImage(post)
              }}
                key={post.id}
                className="
                  group
                  relative
                  aspect-square
                  overflow-hidden
                  bg-white/[0.03]
                "
              >
                <Image
               
                width={500}
                height={500}
                  src={post.imageUrl}
                  alt=""
                  className="
                    h-full
                    w-full
                    object-cover
                    transition
                    duration-500
                    group-hover:scale-105
                  "
                />

                {/* Hover / tap overlay */}

                <div
                  className="
                    absolute
                    inset-0
                    flex
                    items-end
                    justify-center
                    bg-gradient-to-t
                    from-black/70
                    via-transparent
                    to-transparent
                    opacity-0
                    transition
                    group-hover:opacity-100
                  "
                >
                  <div
                    className="
                      mb-3
                      flex
                      items-center
                      gap-4
                      text-xs
                      font-medium
                    "
                  >
                    <span className="flex items-center gap-1">
                      <FaHeart />
                      {post.likeCount}
                    </span>

                    <span className="flex items-center gap-1">
                      <FaComment />
                      {/* {post.comments} */}
                    </span>
                  </div>
                </div>

                {/* Like indicator */}

                {/* {post?.likedByMe && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaHeart className="text-4xl text-white drop-shadow-lg" />
                  </div>
                )} */}
              </button>
            );
          })}
        </section>
      </div>
    </main>
  );
}