"use client";

import { getSocket } from "@/lib/socket";
import { fetchPosts } from "@/redux/slices/posts/postsSlice";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaHeart,
  FaRegHeart,
  FaEllipsis,
  FaRegComment,
  FaArrowUpFromBracket, 
  FaUser,
} from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";

export default function FeedPosts({  onProfileClick }) {
  const dispatch = useDispatch();
  
  const { posts, nextCursor, hasMore, status, loadingMore } = useSelector((state) => state?.posts);
  
  const onlineIds = useSelector((state) => state?.onlineUsers?.ids);
// console.log(onlineIds, "onlineIds")

  const [feedPosts, setFeedPosts] = useState(posts || []);
  useEffect(() => {
    setFeedPosts(posts || []);
  }, [posts]);
  
  // console.log(feedPosts, "POfeedPostsST")
  // initial load
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);
  
  // SYNC REAL TIME LIKE FOR EVERY POST 
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handleNewNotification = (data) => {
      // console.log(data, "data")
      
      // console.log(feedPosts, "FEEDPOSTS")
      const likedPost = data?.likedPost;
      
      // now update feedPosts
      setFeedPosts((currentPosts) =>
        currentPosts?.map((item) =>
          Number(item.id) === Number(likedPost?.id)
      ? { ...item, likeCount: likedPost?.likeCount }
      : item
    )
  );
};
socket.on("post:like-updated", handleNewNotification);
return () => {
  socket.off("post:like-updated", handleNewNotification);
};
}, []);
// SYNC REAL TIME LIKE FOR EVERY POST END 

// ---------------------------------------
const observerRef = useRef(null);
const sentinelRef = useRef(null);
const scrollContainerRef = useRef(null); // ref to the actual scrolling ancestor



const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      dispatch(fetchPosts({ cursor: nextCursor }));
    }
  }, [dispatch, hasMore, loadingMore, nextCursor]);


useEffect(() => {
  if (!sentinelRef.current) return; // sentinel not in DOM yet, skip

  observerRef.current = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    },
    { threshold: 0, rootMargin: "300px" }
  );

  observerRef.current.observe(sentinelRef.current);

  return () => {
    observerRef.current?.disconnect();
  };
}, [loadMore, feedPosts.length]); // <-- re-run once feedPosts actually has items
useEffect(() => {
observerRef.current = new IntersectionObserver(
  (entries) => {
    console.log("Sentinel intersecting:", entries[0].isIntersecting); // temp debug
    if (entries[0].isIntersecting) {
      loadMore();
    }
  },
  { threshold: 0, rootMargin: "300px" }
);

  const currentSentinel = sentinelRef.current;
  if (currentSentinel) observerRef.current.observe(currentSentinel);

  return () => {
    if (currentSentinel) observerRef.current.unobserve(currentSentinel);
  };
}, [loadMore]);
  // ---------------------------------------
  if (!feedPosts?.length) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 text-white/20">
          <FaRegComment className="text-3xl" />
        </div>

        <h3 className="text-sm font-medium text-white/70">No posts yet</h3>

        <p className="mt-1 text-xs text-white/30">
          New posts will appear here.
        </p>
      </div>
    );
  }

  // when click on like
  const onLike = async (post) => {
    // console.log(post, "UPPER")
    const oldLiked = post.likedByMe;
    const oldCount = post.likeCount || 0;
    const newLiked = !oldLiked;
    const newCount = oldLiked ? Math.max(0, oldCount - 1) : oldCount + 1;
    // console.log(oldLiked)

    // Optimistic update — from here on, THIS is the source of truth.
    // We only touch state again to roll back on failure, or to sync
    // with the server IF (and only if) its response actually has the
    // shape we expect. We never blindly overwrite a correct optimistic
    // value with something that might be undefined/mis-shaped.
    setFeedPosts((currentPosts) =>
      currentPosts.map((item) =>
        item.id === post.id
          ? { ...item, likedByMe: newLiked, likeCount: newCount }
          : item
      )
    );

    try {
      const res = await fetch(`/api/post/${post.id}/like`, {
        method: "POST",
      });

      const data = await res.json();
// console.log(data)
      // console.log("LIKE RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to like post");
      }

      // Only trust the server's numbers if they're actually present
      // and the right type. If your backend wraps responses like
      // { data: { likedByMe, likeCount } } (matching your other
      // endpoints' ApiResponse shape) rather than flat top-level
      // fields, `data.likedByMe` here will be undefined — that
      // mismatch was exactly what was corrupting the heart's color
      // after a successful like. Check the console log above to
      // confirm the actual shape and adjust the destructuring below
      // if it's nested (e.g. `data?.data?.likedByMe`).
      const serverLiked = data?.likedByMe;
      const serverCount = data?.likeCount;

      if (typeof serverLiked === "boolean" && typeof serverCount === "number") {
        setFeedPosts((currentPosts) =>
          currentPosts.map((item) =>
            item.id === post.id
              ? { ...item, likedByMe: serverLiked, likeCount: serverCount }
              : item
          )
        );
      }
      // else: silently keep the optimistic value — don't let a
      // malformed response overwrite a correct UI state.
    } catch (error) {
      console.error("Like error:", error);

      // Rollback to pre-optimistic state
      setFeedPosts((currentPosts) =>
        currentPosts.map((item) =>
          item.id === post.id
            ? { ...item, likedByMe: oldLiked, likeCount: oldCount }
            : item
        )
      );
    }
  };
  // when click on like end

// console.log(feedPosts, "FEEDPOST")




  return (
    <div className="mx-auto w-full max-w-xl pb-24">
      {feedPosts?.map((post, id) => (
        <article key={`${id}index`} className="border-b border-[#4d4d4d59]">
          {/* =================================
              USER HEADER
          ================================= */}
          <div className="flex items-center px-4 py-4">
            <button
              type="button"
              onClick={() => onProfileClick?.(post.user)}
              className="
              flex min-w-0
                items-center
                text-left
                active:opacity-70
                transition
              "
            > 
              {/* Avatar */}
               {/* show online status  */}
        

{/* <h1 className="text-white">{post?.user?.id} {onlineIds?.includes(post?.user?.id) ? "online" : "offline"}</h1> */}
              <div
                className="
                  relative
                  h-10 w-10
                  shrink-0
  
                  rounded-full
                "
              >
       {post?.user?.id && onlineIds.includes(post?.user?.id) ? (
                       <span className="text-green-500 text-[17px] absolute top-0 z-[99999] min-w-[10px] min-h-[10px] bg-[#31ff00] right-0 rounded-full"></span>
              ) : null}

                {post.user?.image ? (
                  <Image
                    src={post.user.image}
                    alt={post.user.fullName || "User"}
                    fill
                    sizes="40px"
                    className="object-cover        rounded-full"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FaUser className="text-sm text-white/25" />
                  </div>
                )}
              </div>

              {/* User */}

              <div className="ml-3 min-w-0">
                <Link  href={`/user/${post?.user?.username}?source=feed`} className="truncate text-sm font-semibold text-white">
                  {post.user?.fullName || "Unknown User"}
                </Link>

                <div className="mt-0.5 truncate text-[11px] text-[#afafaf]">
            
                  <Link  href={`/user/${post?.user?.username}?source=feed`}>
                        @{post.user?.username || "user"}
                  </Link>

    
                </div>
              </div>
            </button>

            {/* More */}

            <button
              type="button"
              className="
                ml-auto
                flex 
                flex-col
                gap-[11px]
                items-center justify-center
                rounded-full
                text-white/35
                transition
                hover:text-white/70
                active:scale-90
              "
            >
              <FaEllipsis />
                                        <p className="text-[10px] uppercase tracking-[0.08em] text-white">
              {formatPostDate(post.createdAt)}
            </p>
            </button>

          </div>
      

          {/* =================================
              IMAGE
          ================================= */}

          {post?.imageUrl && (
            <button
              type="button"
              onDoubleClick={() => onLike?.(post)}
              className="
                relative
                block
                aspect-[4/5]
                w-full
                overflow-hidden
                bg-[#080808]
              "
            >
              <Image
                src={post?.imageUrl}
                alt={post?.caption || "Post"}
                fill
                priority={post?.id === feedPosts?.[0]?.id}
                sizes="(max-width: 640px) 100vw, 576px"
                className="object-cover"
              />
            </button>
          )}

          {/* =================================
              ACTIONS
          ================================= */}

          <div className="flex items-center px-4 pt-3">
            {/* Like */}

            <button
              type="button"
              onClick={() => onLike(post)}
              className="
                flex
                items-center
                gap-2
                text-white/60
                transition
                active:scale-90
              "
            >
              {post?.likedByMe ? (
                <FaHeart className="text-[20px] text-red-500" />
              ) : (
                <FaRegHeart className="text-[20px]" />
              )}

              {post?.likeCount > 0 && (
                <span className="text-xs text-white/45">
                  {post?.likeCount}
                </span>
              )}
            </button>

            {/* Comment */}

            <button
              type="button"
              className="
                ml-5
                flex h-8 w-8
                items-center justify-center
                text-white/55
                transition
                active:scale-90
              "
            >
              <FaRegComment className="text-[18px]" />
            </button>

            {/* Share */}

            <button
              type="button"
              className="
                ml-3
                flex h-8 w-8
                items-center justify-center
                text-white/55
                transition
                active:scale-90
              "
            >
              <FaArrowUpFromBracket className="text-[17px]" />
            </button>
          </div>

          {/* =================================
              CAPTION
          ================================= */}

          {post.caption && (
            <div className="px-4 pt-3">
              <p className="text-[13px] leading-5 text-white/75">
                <button
                  type="button"
                  onClick={() => onProfileClick?.(post.user)}
                  className="
                    mr-1
                    font-semibold
                    text-white
                  "
                >
                  {post.user?.username}
                </button>

                {post.caption}
              </p>
            </div>
          )}

          {/* =================================
              DATE
          ================================= */}

          <div className="px-4 pb-5 pt-2">
            <p className="text-[10px] uppercase tracking-[0.08em] text-white">
              {formatPostDate(post.createdAt)}
            </p>
          </div>
        </article>
      ))}
        {/* sentinel — triggers loadMore() when scrolled into view */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {loadingMore && (
        <p className="py-4 text-center text-xs text-white/40">Loading more...</p>
      )}

      {!hasMore && feedPosts.length > 0 && (
        <p className="py-4 text-center text-xs text-white/30">You're all caught up</p>
      )}
   
    </div>
  );
}

/* =========================================
   DATE FORMATTER
========================================= */

function formatPostDate(date) {
  if (!date) return "";

  const created = new Date(date);

  if (Number.isNaN(created.getTime())) {
    return "";
  }

  const now = new Date();

  const diff = Math.max(0, now.getTime() - created.getTime());

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return created.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}