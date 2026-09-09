

"use client";

import { getSocket } from "@/lib/socket";
import { setCurrentPost, setCurrentPosts, setIsViewingPost } from "@/redux/slices/stateSlice";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaXmark,
  FaHeart,
  FaRegHeart,
  FaDownload,
} from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";

export default function PostImageViewer() {
    const dispatch = useDispatch();
    const post = useSelector((state) => state?.userState?.currentPost);  //particular post of user whose profile is being viewed
    const posts = useSelector((state) => state?.userState?.currentPosts);  //all posts of user whose profile is being viewed
  const [liked, setLiked] = useState(post?.likedByMe ?? false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [likedStateLoading, setlikedStateLoading] = useState(false)


  const [likeCount, setLikeCount] = useState(post?.likeCount ?? 0);


  // REAL TIME LISTENER
  useEffect(() => {
    const socket = getSocket();
    const handleLikeUpdate = (data) => {
      // sirf isi post ka update hai to hi UI update karo
      if (data?.postId == post?.id) {
        setLikeCount(data?.likeCount);
        // note: 'liked' state sirf us user ke liye personal hai jisne click kiya,
        // baaki users ke liye sirf count update hoga (unka apna 'liked' state waisa hi rahega)
      }
    };
    socket.on("post:like-updated", handleLikeUpdate);

    return () => {
      socket.off("post:like-updated", handleLikeUpdate); // cleanup
    };
  }, [post?.id]);


  // console.log(post, "current post in child")

// ON CLOSE 
const onClose = () => {
    dispatch(setIsViewingPost(false));
    // now when image viewer closed: so it will sync liked state
    // 1. remove previous post from posts
    // 2. set current post to null  --  current post can be obtained from post

    const index = posts.findIndex((p) => p.id === post.id);
    const newPosts = [...posts];
    newPosts.splice(index, 1);
    newPosts.push(post)
    dispatch(setCurrentPosts(newPosts));

    // console.log(post, "si")
    // console.log(posts, "ALL")
  };
// ON CLOSE END

  // Sync when another post is opened
  useEffect(() => {
    setLiked(post?.likedByMe ?? false);
  }, [post]);

  // Prevent background scrolling
  useEffect(() => {
    if (!post) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [post]);

  // ESC key
  useEffect(() => {
    if (!post) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [post, onClose]);



  
  if (!post) return null;

  // WHen clikck on like in image previewr 
  const handleLike = async () => {

try {
  setlikedStateLoading(true)
  if(!post?.id) return toast.error("Post id not found.")
  const response = await fetch(`/api/post/${post?.id}/like`, {
    method:"POST",
  })
  const data = await response.json();

  if(!response.ok) return toast.error("Something went worng.")
// console.log(data)

  // if particular image like success then, fetch the latest particular post with its latest like values
if(data?.success === true){
  setlikedStateLoading(false)
try {
  const res = await fetch(`/api/post/${post?.id}`)
  const data = await res.json()

dispatch(setCurrentPost(data?.post))
  setLiked(data?.post?.likedByMe);
} catch (error) {
  console.log(error)
  return toast.error("Something went worng.")
}
setLiked(data?.post?.likedByMe);
}


// console.log(post)
} catch (error) {
  console.error("Like error:", error);
  return toast.error("Something went worng.")
}


    // setLiked(newLikedState);
  };

  const handleDownload = async () => {
    if (!post?.imageUrl || isDownloading) return;

    try {
      setIsDownloading(true);

      const response = await fetch(post.imageUrl);

      if (!response.ok) {
        throw new Error("Failed to download image");
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = `post-${post.id || Date.now()}.jpg`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Image download failed:", error);

      // Fallback
      window.open(post.imageUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black
      "
      onClick={onClose}
    >
      {/* Image */}
      <div
        className="
          relative
          flex h-full w-full
          items-center justify-center
          bg-black
        "
        onClick={(e) => e.stopPropagation()}
      >
        <Image
        width={400}
        height={400}
          src={post.imageUrl}
          alt={post.caption || "Post image"}
          className="
            max-h-full
            max-w-full
            select-none
            object-contain
          "
        />

        {/* Top bar */}
        <div
          className="
            absolute
            left-0
            right-0
            top-0
            flex
            items-center
            justify-between
            px-4
            py-4
            pt-[calc(env(safe-area-inset-top)+1rem)]
            bg-gradient-to-b
            from-black/70
            to-transparent
          "
        >
          {/* User info */}
          <div className="flex items-center gap-3">
            {post?.user?.image && (
              <Image
              width={50}
              height={50}
                src={post.user.image || "https://picsum.photos/seed/picsum/50"}
                alt=""
                className="
                  h-9
                  w-9
                  rounded-full
                  object-cover
                "
              />
            )}

            <div>
              {post?.user?.username && (
                <p className="text-sm font-semibold text-white">
                  @{post.user.username}
                </p>
              )}
            </div>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-black/40
              text-white
              backdrop-blur-md
              transition
              active:scale-90
            "
          >
            <FaXmark className="text-lg" />
          </button>
        </div>

        {/* Bottom actions */}
        <div
          className="
            absolute
            bottom-0
            left-0
            right-0
            flex
            items-center
            justify-between
            px-5
            pb-[calc(env(safe-area-inset-bottom)+1.25rem)]
            pt-10
            bg-gradient-to-t
            from-black/80
            to-transparent
          "
        >
          {/* Like */}
          <button
            type="button"
            onClick={handleLike}
            aria-label={liked ? "Unlike" : "Like"}
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-black/45
              backdrop-blur-md
              transition
              active:scale-90
            "
          >
            {likedStateLoading ? (
              <div className="flex items-center justify-center">
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-6 w-6 animate-spin"></div>
              </div>
            ) : liked ? (   
              <FaHeart className="text-[23px] text-red-500" />
            )
            : (
              <FaRegHeart className="text-[23px] text-white" />
              )}
          </button>

          {/* Like count */}
          <div className="flex-1 px-4">
            <p className="text-sm font-semibold text-white">
              {/* {likeCount ?? 0}{" "} */}
              {likeCount}
              {likeCount === 1 ? " like" : " likes"}
            </p>
          </div>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            aria-label="Download image"
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-black/45
              text-white
              backdrop-blur-md
              transition
              active:scale-90
              disabled:opacity-50
            "
          >
            <FaDownload className="text-[20px]" />
          </button>
        </div>
      </div>
    </div>
  );
}


