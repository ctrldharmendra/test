"use client";

import { useEffect, useState } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";

import {
  FaHeart,
  FaChevronLeft,
  FaChevronRight,
  FaLocationDot,
  FaArrowUpRightFromSquare,
  FaXmark,
  FaRegHeart,
} from "react-icons/fa6";
import ProfileFilters from "./component/filter/ProfileFilter";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { CgSpinner } from "react-icons/cg";
import Image from "next/image";
import ExploreLoading from "./component/ExploreLoading";

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState([]);
const dispatch = useDispatch();

//REDUX  STATES 
  const selectedAge = useSelector( (state) => state?.userState?.selectedAge);

  const selectedDistance = useSelector( (state) => state?.userState?.selectedDistance);

  const selectedGender = useSelector((state) => state?.userState?.selectedGender); 
  const onlineIds = useSelector((state) => state?.onlineUsers?.ids);


    const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [error, setError] = useState("");

//   console.log(selectedAge, "FROM ex")
//   console.log(selectedGender, "FROM ex")
//   console.log(selectedDistance, "FROM ex")

  const currentUser = users[currentIndex];

  const nextUser = () => {
    if (currentIndex < users.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const previousUser = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };






  // WHEN CLICK ON USER"S DP LIKE BUTTON 
  const toggleLike = async() => {

    setLikeLoading(true);
    // call api to toggle like
    try {
        const res = await fetch(`/api/users/${currentUser.username}/dp-likes`, {
          method: "POST",
        });
        const data = await res.json();
        console.log(data, "data")

// show in ui 
if(data?.success){
// now update this like for particular user in setuser 
setLikeLoading(false);
setUsers((prev) =>
      prev.map((item) =>
        item.id === currentUser.id
          ? { ...item, dpLikedByMe: data.liked, dpLikeCount: data.likeCount }
          : item
      )
    );
}

    } catch (error) {
      setLikeLoading(false);
      console.error("Toggle like error:", error);
      return console.error("Toggle like error:", error);
    }
  };

const handleDragEnd = (event, info) => {
  const threshold = 100;

  if (info.offset.x < -threshold) {
    nextUser();
  } else if (info.offset.x > threshold) {
    previousUser();
  }
};


// GET USER 
  useEffect(() => {

    const fetchExploreUsers = async () => {

      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (selectedAge) {
          params.set("age", selectedAge);
        }

        if (selectedDistance) {
          params.set("distance", selectedDistance);
        }

        if (selectedGender) {
          params.set("gender", selectedGender);
        }

        const response = await fetch(
          `/api/explore?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.log(data, "DATA")
          console.log(response, "res")
          throw new Error(data?.message || "Failed to load profiles");
        }
// console.log(response)
        setUsers(data?.users || []);
        setLoading(false);


      } catch (error) {
        setLoading(false);
        console.error("Explore fetch error:", error);

        setError(
          error?.message || "Something went wrong"
        );

      } finally {

        setLoading(false);

      }
    };

    fetchExploreUsers();

  }, [
    selectedAge,
    selectedDistance,
    selectedGender,
  ]);




// console.log(users, "users")

if(loading){
  return (
    <ExploreLoading></ExploreLoading>
  )
}

  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
           <div className="mx-auto flex w-full max-w-[600px] flex-col overflow-hidden bg-neutral-950">

        {/* Header */}
        <header className="relative z-30 flex items-center justify-between px-5 pb-3 pt-[calc(env(safe-area-inset-top)+16px)]">

          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Discover
            </h1>

            <p className="text-xs text-white/50">
              People near you
            </p>
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition active:scale-90"
            aria-label="Close"
          >
            <FaXmark className="text-lg" />
          </button>
        </header>


<ProfileFilters />


   {
    users?.length >0 && (
        <>
        {/* Card Area */}
        <section className="relative flex min-h-0 flex-1 px-3">

          <div className="relative h-full min-h-[560px] w-full overflow-hidden rounded-[30px]">

            {/* Background Image */}
<motion.div
  key={currentUser.id}
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.85}
  onDragEnd={handleDragEnd}
  style={{ touchAction: "pan-y" }}
  initial={{
    opacity: 0,
    scale: 1.04,
  }}
  animate={{
    opacity: 1,
    scale: 1,
  }}
  transition={{
    duration: 0.35,
  }}
  className="absolute inset-0 cursor-grab active:cursor-grabbing"
>

  {/* Background Image */}
  <Image
  width={200}
  height={200}
    src={currentUser?.image}
    alt={currentUser?.fullName}
    className="absolute inset-0 rounded rounded-[30px] h-full w-full select-none object-cover"
    draggable={false}
  />

  {/* Overlay */}
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />

  {/* Top status */}
  <div className="pointer-events-none absolute left-4 right-4 top-4 flex items-center justify-between">
    <div className="rounded-full bg-black/25 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
      {currentIndex + 1} / {users.length}
    </div>

    <div className="flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 text-xs backdrop-blur-md">
      <FaLocationDot className="text-[11px]" />
      {currentUser?.distance} km
    </div>
  </div>

  {/* User Information */}
  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">

    <div className="mb-4 pointer-events-none">
                  {currentUser?.id && onlineIds.includes(currentUser?.id) ? (
                            <div className="mb-2 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />

        <span className="text-xs font-medium text-white/75">
         {currentUser?.gender =="Male" ? "He" : "She"} is Online 
        </span>
      </div>
              ) : null}
      <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
        {currentUser?.fullName}
      </h2>

      <p className="mt-1 text-sm text-white/70">
        @{currentUser?.username}
      </p>

      <div className="mt-3 flex items-center gap-2 text-sm text-white/80">
        <FaLocationDot className="text-xs" />
        {currentUser?.distance} km away
      </div>
    </div>
        {/* Controls */}
        <div className="relative z-30 flex items-center justify-center gap-4 pb-[7px] px-5 pt-1">

          {/* Previous */}
          <button
            onClick={previousUser}
            disabled={currentIndex === 0}
            className="
              flex h-8 w-8 items-center justify-center
              rounded-full border border-white/10
              bg-white/10
              text-white
              shadow-lg
              backdrop-blur-xl
              transition
              active:scale-90
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
            aria-label="Previous user"
          >
            <FaChevronLeft className="text-xl" />
          </button>

          {/* Like */}
          <button
            onClick={toggleLike}
            className="
              flex h-[48px] w-[48px] items-center justify-center
              rounded-full
              bg-white
              text-red-500
              shadow-[0_10px_40px_rgba(0,0,0,0.35)]
              transition
              active:scale-90
            "
            aria-label="Like"
          >
{
  likeLoading ? <CgSpinner className="text-[20px] text-red-500" /> : 
   currentUser?.dpLikedByMe ?  <FaHeart className="text-[20px] text-red-500" /> :<FaRegHeart className="text-[20px]" />
  
}
              
      
                
          </button>

          {/* Next */}
          <button
            onClick={nextUser}
            disabled={currentIndex === users.length - 1}
            className="
              flex h-8 w-8 items-center justify-center
              rounded-full border border-white/10
              bg-white/10
              text-white
              shadow-lg
              backdrop-blur-xl
              transition
              active:scale-90
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
            aria-label="Next user"
          >
            <FaChevronRight className="text-xl" />
          </button>

        </div>
    {/* Profile Button */}
    {/* <Link

    href={`/user/}`}
      className="
        flex w-full items-center justify-center gap-2
        rounded-2xl bg-white/15 py-3.5
        text-sm font-semibold
        backdrop-blur-xl
        transition
        hover:bg-white/25
        active:scale-[0.98]
        cursor-pointer
      "
    > */}
    <Link
  href={`/user/${currentUser?.username}?source=explore`}
  style={{ touchAction: "none" }}
  className="
    flex w-full items-center justify-center gap-2
    rounded-2xl bg-white/15 py-3.5
    text-sm font-semibold
    backdrop-blur-xl
    transition
    hover:bg-white/25
    active:scale-[0.98]
    cursor-pointer
  "
>
      Visit Profile
      <FaArrowUpRightFromSquare className="text-xs" />
    </Link>

  </div>
</motion.div>

            {/* Image Overlay */}
            {/* <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />


            <div className="absolute left-4 right-4 top-4 flex items-center justify-between">

              <div className="rounded-full bg-black/25 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
                {currentIndex + 1} / {users.length}
              </div>

              <div className="flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 text-xs backdrop-blur-md">
                <FaLocationDot className="text-[11px]" />
                {currentUser?.distance} km
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">

              <div className="mb-4">

                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />

                  <span className="text-xs font-medium text-white/75">
                    Nearby
                  </span>
                </div>

                <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
                  {currentUser?.fullName}
                </h2>

                <p className="mt-1 text-sm text-white/70">
                  @{currentUser?.username}
                </p>

                <div className="mt-3 flex items-center gap-2 text-sm text-white/80">
                  <FaLocationDot className="text-xs" />
                  {currentUser?.distance} km away
                </div>
              </div>


              <Link
  href={`/user/${currentUser?.username}`}
  style={{ touchAction: "none" }}
  className="
    flex w-full items-center justify-center gap-2
    rounded-2xl bg-white/15 py-3.5
    text-sm font-semibold
    backdrop-blur-xl
    transition
    hover:bg-white/25
    active:scale-[0.98]
    cursor-pointer
  "
>
                Visit Profile
                <FaArrowUpRightFromSquare className="text-xs" />
              </Link>
            </div>     */}



            {/* _-------------- */}
          </div>
        </section>


        </>
    )
   }
      </div>
    </main>
  );
}