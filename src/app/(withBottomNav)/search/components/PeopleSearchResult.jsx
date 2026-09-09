
"use client";

import formatPostDate from "@/lib/formatPostDate";
import Image from "next/image";
import Link from "next/link";
import { FaBirthdayCake, FaMapMarkerAlt } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa6";
import { useSelector } from "react-redux";

export default function PeopleSearchResults({ search }) {  //search has list of users, its a arrray

  if(!search?.length){
    return null
  }
// console.log(search)

  const onlineIds = useSelector((state) => state?.onlineUsers?.ids);

  return (
    <div className="space-y-1">
      {search?.map((profile) => (
        <Link
        href={`/user/${profile?.username ? profile?.username : "sd"}?source=search`}
          key={profile?.id+"laedjkal"}
          className="
            group flex items-center gap-3
            rounded-2xl  py-3
            transition
            active:scale-[0.98]
            hover:bg-white/[0.05]
          "
        >
          {/* Profile image */}
          <div className="relative shrink-0">
        
            <Image
              width={30}
              height={30}
              src={profile?.image}
              alt={profile?.fullName}
              className="
                h-14 w-14
                rounded-full
                object-cover
                ring-2 ring-white/10
              "
            />

            {/* Online indicator */}


                                  {profile?.id && onlineIds.includes(profile?.id) ? (
                                   <span
              className="
                absolute bottom-0 right-0
                h-3.5 w-3.5
                rounded-full
                border-2 border-[#080808]
                bg-green-500
              "
            />
              ) : null}
          </div>

          {/* Profile information */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-white">
              {profile?.fullName}
            </h3>

            <p className="mt-0.5 truncate text-xs text-[#d9d9d9]">
              @{profile?.username}
            </p>

            <div className="mt-1 flex items-center gap-2 text-[11px] text-[#d9d9d9]">
             <FaBirthdayCake ></FaBirthdayCake>  {formatPostDate(profile?.dob)}

              <span className="h-1 w-1 rounded-full bg-[#d9d9d9]" />

              {/* <span className="flex items-center gap-1">
                <FaMapMarkerAlt className="text-[9px]" />
                {profile.distance} km
              </span> */}
            </div>
          </div>

          {/* Action */}
          <button
            type="button"
            className="
              flex 
              w-auto
              text-[11px]
              px-[7px]
              py-[5px]
              shrink-0
              items-center justify-center
              rounded-full
              bg-[#313131]
              text-[#f9f9f9]
              transition
              hover:bg-[#424141]
              active:scale-90
            "
            aria-label={`View ${profile?.fullName}`}
          >
           View {profile?.gender === "Male" ? "His" : "Her"} Profile
          </button>
        </Link>
      ))}

      {/* No result placeholder for later API integration */}
      {search?.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-white/50">
            No people found
          </p>

          <p className="mt-1 text-xs text-white/25">
            Try changing your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
