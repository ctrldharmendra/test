
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FaArrowLeft,
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaBookmark,
  FaRegBookmark,
  FaMapMarkerAlt,
} from "react-icons/fa";

import LikeUsersSheet from "./components/LikeUsersSheet";
import CommentSection from "./components/CommentSection";
import { FaEllipsisVertical } from "react-icons/fa6";
import Image from "next/image";
import formatPostDate from "@/lib/formatPostDate";
import Link from "next/link";
import { getSocket } from "@/lib/socket";
import { CgSpinner } from "react-icons/cg";
import toast from "react-hot-toast";





// ============================================================
// DUMMY COMMENTS
// ============================================================

const dummyComments = [
  {
    id: 1,
    text: "This looks absolutely beautiful 😍",
    createdAt: "1h",
    liked: true,
    likeCount: 4,

    user: {
      id: 1,
      username: "sophia",
      fullName: "Sophia Williams",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    },
  },

  {
    id: 2,
    text: "Love this photo ❤️",
    createdAt: "45m",
    liked: false,
    likeCount: 2,

    user: {
      id: 2,
      username: "emma",
      fullName: "Emma Johnson",
      image:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop",
    },
  },

  {
    id: 3,
    text: "Where is this place?",
    createdAt: "30m",
    liked: false,
    likeCount: 0,

    user: {
      id: 3,
      username: "alex",
      fullName: "Alex Anderson",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    },
  },
];

export default function SinglePostPage() {
  const router = useRouter();
  const params = useParams();



    const postId = params.pId;
 if(!postId){
   return null
 }

const [likeLoading, setlikedStateLoading] = useState(false)
  const [post, setPost] = useState();
  const [totalLikedUsers, settotalLikedUsers] = useState([])
  const [postOwner, setpostOwner] = useState(null)

  const [showLikes, setShowLikes] = useState(false);

  const [saved, setSaved] = useState(false);


// WHEN CLICK ON LIKE BTN OF THIS POST 
const toggleLike = async () => {
  // call api to toggle like
  try {
  setlikedStateLoading(true)
  if(!post?.id) return toast.error("Post id not found.")
  const response = await fetch(`/api/post/${post?.id}/like`, {
    method:"POST",
  })
  const data = await response.json();

  if(!response.ok) return toast.error("Something went worng.")
// console.log(data)
  setlikedStateLoading(false)
  setPost((prev) => ({
    ...prev,
    likedByMe:data?.liked
  }));
} catch (error) {
  setlikedStateLoading(false)
  console.error("Like error:", error);
  return toast.error("Something went worng.")
}


};
// WHEN CLICK ON LIKE BTN OF THIS POST END 



  const handleAddComment = (comment) => {
    console.log("New comment:", comment);
  };
  

  // CAL API TO GET PARTICULAR POST 
  useEffect(() => {
    const fetchPost = async () => {
      try {

        //  console.log(query, "query")
        const response = await fetch(
          `/api/post/${postId}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );
  
        const data = await response.json();
  console.log(data, "DATA I")
        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to load user"
          );
        }
  
        setPost(data?.post);
        settotalLikedUsers(data?.totalLikedUsers)
        setpostOwner(data?.post?.user)
  
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
  
    fetchPost();
  }, [postId]);
  
  // console.log(post, "POST")
  // CAL API TO GET PARTICULAR POST END


// REAL TIM LIKE VALUE 
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handleNewNotification = (data) => {
      console.log(data, "data")
      

      // console.log(feedPosts, "FEEDPOSTS")
      const likedPost = data?.likedPost;
      
      // now update this post state | post is obect not array
      setPost((prev) =>
        prev.id === likedPost?.id
          ? { ...prev, likeCount: likedPost?.likeCount }
          : prev
      );
      

};
socket.on("post:like-updated", handleNewNotification);
return () => {
  socket.off("post:like-updated", handleNewNotification);
};
}, []);
// REAL TIM LIKE VALUE  END

// console.log(postOwner)

  if(!post){
    return null
  }

  return (
    <main
      className="
        min-h-dvh
        bg-[#080808]
        text-white
      "
    >
      <div
        className="
          mx-auto
          min-h-dvh
          w-full
          max-w-[600px]
          overflow-x-hidden
        "
      >

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <header
          className="
            sticky top-0 z-40
            flex items-center
            justify-between
            border-b border-white/[0.06]
            bg-[#080808]/90
            px-4
            pb-3
            pt-[calc(env(safe-area-inset-top)+12px)]
            backdrop-blur-xl
          "
        >
          <button
            type="button"
            onClick={() => router.back()}
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-full
              bg-white/[0.06]
              text-white/80
              transition
              active:scale-90
            "
          >
            <FaArrowLeft className="text-sm" />
          </button>

          <div className="text-center">
            <h1 className="text-sm font-bold">
              Post
            </h1>

            <p className="text-[10px] text-white/30">
              @{post.user.username}
            </p>
          </div>

          <button
            type="button"
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-full
              bg-white/[0.06]
              text-white/60
              transition
              active:scale-90
            "
          >
            <FaEllipsisVertical className="text-sm" />
          </button>
        </header>

        {/* ================================================== */}
        {/* USER */}
        {/* ================================================== */}

        <div className="flex items-center gap-3 px-4 py-4">

          <button
            type="button"
            className="shrink-0"
          >
  {
    postOwner?.image && (
          <Image
            width={10}
            height={10}
              src={postOwner?.image}
              alt={ "akj"}
              className="
                h-11 w-11
                rounded-full
                object-cover
                ring-2
                ring-white/10
              "
            />
    )
  }
          </button>

          <div className="min-w-0 flex-1">
            <Link href="/profile" className="truncate text-sm font-bold">
             {
              postOwner?.fullName  ? postOwner?.fullName : ""
             }
            </Link>

            <div className="mt-0.5 flex items-center gap-2">
              <Link href="/profile" className="text-xs text-white/80">
                @{postOwner?.username ? postOwner?.username : ""}
              </Link>

              <span className="h-1 w-1 rounded-full bg-[#5eff5e]" />
{/* 
              <span className="flex items-center gap-1 text-[11px] text-white/35">
                <FaMapMarkerAlt className="text-[9px]" />
                {post.user.distance} km
              </span> */}
            </div>
          </div>

          <span className="text-[10px] text-white/80">
            {post?.createdAt ? formatPostDate(post?.createdAt) : ""}
          </span>
        </div>

        {/* ================================================== */}
        {/* POST IMAGE */}
        {/* ================================================== */}

        <div
          className="
            relative
            w-full
            overflow-hidden
            bg-black
          "
        >
    {
      post?.imageUrl && (
          <Image
            width={200}
            height={200}
            src={post?.imageUrl}
            alt={post?.caption || "akj"}
            className="
              block
              max-h-[75dvh]
              min-h-[320px]
              w-full
              object-cover
            "
          />
      )
    }
        </div>

        {/* ================================================== */}
        {/* ACTION BAR */}
        {/* ================================================== */}

        <div className="px-4 pt-3">

          <div className="flex items-center">

            {/* Like */}
            <button
              type="button"
              onClick={toggleLike}
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-full
                transition
                active:scale-90
              "
              aria-label="Like post"
            >
              {
                likeLoading ? <CgSpinner className="text-[20px] animate-spin text-red-500" /> : post?.likedByMe ? (
                <FaHeart className="text-[22px] text-red-500" />
              ) : (
                <FaRegHeart className="text-[22px] text-white" />
              )
              }
              {/* {post?.likedByMe ? (
                <FaHeart className="text-[22px] text-red-500" />
              ) : (
                <FaRegHeart className="text-[22px] text-white" />
              )} */}
            </button>

            {/* Comment */}
            {/* <button
              type="button"
              onClick={() => {
                document
                  .getElementById("comments")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
              }}
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-full
                transition
                active:scale-90
              "
              aria-label="Comments"
            >
              <FaComment className="text-[20px] text-white" />
            </button> */}

            {/* Share */}
            <button
              type="button"
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-full
                transition
                active:scale-90
              "
              aria-label="Share"
            >
              <FaShare className="text-[19px] text-white" />
            </button>

            {/* Save */}
            <button
              type="button"
              onClick={() =>{
                setSaved((prev) => !prev)
                toast.success("This is Under Development.")
              }}
              className="
                ml-auto
                flex h-10 w-10
                items-center justify-center
                rounded-full
                transition
                active:scale-90
              "
              aria-label="Save post"
            >
              {saved ? (
                <FaBookmark className="text-[19px] text-white" />
              ) : (
                <FaRegBookmark className="text-[19px] text-white" />
              )}
            </button>
          </div>

          {/* LIKES */}

          <button
            type="button"
            onClick={() => setShowLikes(true)}
            className="
              mt-1
              flex items-center gap-2
              text-left
              active:opacity-60
            " 
          >
            {/* Like avatars */}
            <div className="flex -space-x-2">
    {
      totalLikedUsers && (
                      totalLikedUsers?.slice(0, 3).map((user, index) => (
                <Image
                width={5}
                height={5}
                  key={user.id || index+"ldk"}
                  src={user?.dp}
                  alt=""
                  className="
                    h-6 w-6
                    rounded-full
                    border-2
                    border-[#080808]
                    object-cover
                  "
                />
              ))
              )
    }
            </div>

            <span className="text-xs font-semibold">
              {post.likeCount} likes
            </span>
          </button>

          {/* LIKED USERS PREVIEW */}


          <div
            type="button"
          
            className="
              mt-2
              text-left
              text-xs
              leading-relaxed
              text-white/55
            "
          >
         <Link  href={`/user/${totalLikedUsers?.[0]?.username}`}>

            <span className="text-white/80">
              {totalLikedUsers?.[0]?.username}
            </span>
         </Link>

            {totalLikedUsers?.length > 1 && (
              <>
              <span>, </span>

         <Link  href={`/user/${totalLikedUsers?.[1]?.username}`}>
                <span className="text-white/80">
                 {totalLikedUsers?.[1]?.username}
                </span>
         </Link>
              </>
            )}

            {post?.likeCount > 2 && (
              <>
                <span> and </span>

                <span className="font-semibold text-white/75"   onClick={() => setShowLikes(true)}>
                  {post.likeCount - 2} others
                </span>
              </>
            )}
          </div>

          {/* ================================================= */}
          {/* CAPTION */}
          {/* ================================================= */}

          <div className="mt-3">
            <p className="text-sm leading-relaxed text-white/80">
              <span className="mr-1 font-bold text-white">
                {postOwner?.username}
              </span>

              {post?.caption}
            </p>
          </div>
        </div>

        {/* ================================================== */}
        {/* COMMENTS */}
        {/* ================================================== */}

        <div
          id="comments"
          className="
            mt-6
            border-t
            border-white/[0.06]
            px-4
            pt-5
          "
        >
          {/* <CommentSection
            comments={dummyComments}
            onAddComment={handleAddComment}
          /> */}
        </div>

        {/* Bottom spacing */}
        <div className="h-20" />

      </div>

{
  totalLikedUsers &&  totalLikedUsers.length > 0 && (

      <LikeUsersSheet
        open={showLikes}
        onClose={() => setShowLikes(false)}
        users={totalLikedUsers}
      />
)
}
    </main>

  );
}
