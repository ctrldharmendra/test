
"use client";

import { useState } from "react";
import {
  FaHeart,
  FaRegHeart,
  FaPaperPlane,
  FaEllipsis,
} from "react-icons/fa6";

export default function CommentSection({
  comments = [],
  onAddComment,
}) {
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState(comments);

  const submitComment = () => {
    const text = commentText.trim();

    if (!text) return;

    const newComment = {
      id: Date.now(),
      text,
      createdAt: "Just now",
      liked: false,
      likeCount: 0,

      user: {
        id: 999,
        username: "loginuser",
        fullName: "You",
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
      },
    };

    setLocalComments((prev) => [newComment, ...prev]);

    setCommentText("");

    if (onAddComment) {
      onAddComment(newComment);
    }
  };

  const toggleCommentLike = (id) => {
    setLocalComments((prev) =>
      prev.map((comment) => {
        if (comment.id !== id) return comment;

        return {
          ...comment,
          liked: !comment.liked,
          likeCount: comment.liked
            ? Math.max(0, comment.likeCount - 1)
            : comment.likeCount + 1,
        };
      })
    );
  };

  return (
    <section className="mt-2">

      {/* Comments heading */}
      <div className="flex items-center justify-between px-1 pb-3">
        <h2 className="text-sm font-bold text-white">
          Comments
        </h2>

        <span className="text-xs text-white/30">
          {localComments.length}
        </span>
      </div>

      {/* Comment list */}
      <div className="space-y-4">
        {localComments.length > 0 ? (
          localComments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3"
            >
              {/* Avatar */}
              <img
                src={comment.user.image}
                alt={comment.user.fullName}
                className="
                  h-9 w-9
                  shrink-0
                  rounded-full
                  object-cover
                "
              />

              {/* Comment */}
              <div className="min-w-0 flex-1">

                <div className="flex items-start gap-2">
                  <div
                    className="
                      min-w-0
                      rounded-2xl
                      bg-white/[0.06]
                      px-3.5 py-2.5
                    "
                  >
                    <p className="text-xs font-semibold text-white">
                      {comment.user.fullName}
                    </p>

                    <p className="mt-1 break-words text-sm leading-relaxed text-white/75">
                      {comment.text}
                    </p>
                  </div>

                  {/* More */}
                  <button
                    type="button"
                    className="
                      mt-2
                      shrink-0
                      text-white/20
                      transition
                      hover:text-white/50
                    "
                  >
                    <FaEllipsis className="text-[10px]" />
                  </button>
                </div>

                {/* Comment actions */}
                <div className="mt-1.5 flex items-center gap-4 px-2">
                  <span className="text-[10px] text-white/25">
                    {comment.createdAt}
                  </span>

                  {comment.likeCount > 0 && (
                    <span className="text-[10px] text-white/30">
                      {comment.likeCount}{" "}
                      {comment.likeCount === 1
                        ? "like"
                        : "likes"}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      toggleCommentLike(comment.id)
                    }
                    className="
                      text-[10px]
                      font-medium
                      text-white/40
                      transition
                      active:scale-90
                    "
                  >
                    {comment.liked ? (
                      <span className="text-red-500">
                        Liked
                      </span>
                    ) : (
                      "Like"
                    )}
                  </button>

                  <button
                    type="button"
                    className="
                      text-[10px]
                      font-medium
                      text-white/40
                    "
                  >
                    Reply
                  </button>
                </div>
              </div>

              {/* Like */}
              <button
                type="button"
                onClick={() =>
                  toggleCommentLike(comment.id)
                }
                className="
                  mt-3
                  flex h-7 w-7
                  shrink-0
                  items-center justify-center
                  rounded-full
                  transition
                  active:scale-90
                "
              >
                {comment.liked ? (
                  <FaHeart className="text-xs text-red-500" />
                ) : (
                  <FaRegHeart className="text-xs text-white/25" />
                )}
              </button>
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-white/40">
              No comments yet
            </p>

            <p className="mt-1 text-xs text-white/20">
              Be the first to comment
            </p>
          </div>
        )}
      </div>

      {/* Comment input */}
      <div
        className="
          sticky
          bottom-0
          mt-5
          border-t
          border-white/[0.07]
          bg-[#080808]/95
          px-1
          pb-[calc(env(safe-area-inset-bottom)+10px)]
          pt-3
          backdrop-blur-xl
        "
      >
        <div className="flex items-center gap-2">

          <img
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
            alt="You"
            className="
              h-9 w-9
              shrink-0
              rounded-full
              object-cover
            "
          />

          <div
            className="
              flex flex-1
              items-center
              rounded-full
              border border-white/[0.08]
              bg-white/[0.06]
              pl-4 pr-1.5
            "
          >
            <input
              type="text"
              value={commentText}
              onChange={(e) =>
                setCommentText(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  submitComment();
                }
              }}
              placeholder="Write a comment..."
              className="
                min-w-0
                flex-1
                bg-transparent
                py-2.5
                text-sm
                text-white
                outline-none
                placeholder:text-white/25
              "
            />

            <button
              type="button"
              onClick={submitComment}
              disabled={!commentText.trim()}
              className="
                flex h-8 w-8
                shrink-0
                items-center justify-center
                rounded-full
                bg-red-500
                text-white
                transition
                active:scale-90
                disabled:cursor-not-allowed
                disabled:bg-white/10
                disabled:text-white/20
              "
            >
              <FaPaperPlane className="text-[11px]" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
