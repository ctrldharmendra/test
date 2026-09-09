
"use client";
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
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
import Image from "next/image";
import { setCurrentPost, setIsViewingPost } from '@/redux/slices/stateSlice';

const PostsGrid = () => {
    const dispatch = useDispatch();
    const currentUserPosts = useSelector((state) => state.userState?.currentPosts);


  const handleViewImage = (post) => {
dispatch(setCurrentPost(post));
    dispatch(setIsViewingPost(true));

  };
  


  return (
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
               
                width={50}
                height={50}
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
  )
}

export default PostsGrid