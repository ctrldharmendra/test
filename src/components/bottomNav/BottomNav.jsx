
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PiHouse } from "react-icons/pi";
import {
  FaHouse,
  FaCompass,
  FaRegCompass,
  FaMagnifyingGlass,
  FaMessage,
  FaRegMessage,
  FaPlus,
  FaHeart,
  FaRegHeart,
  FaUser,
  FaRegUser,
} from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { setUnSeenNotificationCount } from "@/redux/slices/stateSlice";



export default function BottomNav() {
  const dispatch = useDispatch();
  const pathname = usePathname();
const notificationCount = useSelector((state) => state?.userState?.unSeenNotificationCount);

const unreadCount = useSelector((state) => state?.unreadCount?.count);

const navItems = [
  {
    name: "Home",
    href: "/explore",
    icon: PiHouse,
    count:"",
    activeIcon: FaHouse,
  },
  {
    name: "Feed",
    href: "/r/feed",
    icon: FaRegCompass,
    count:"",
    activeIcon: FaCompass,
  },
  {
    name: "Search",
    href: "/search",
    icon: FaMagnifyingGlass,
    count:"",
    activeIcon: FaMagnifyingGlass,
  },
  {
    name: "Post",
    href: "/post",
    icon: FaPlus,
    count:"",
    activeIcon: FaPlus,
    isPost: true,
  },
  {
    name: "Chats",
    href: "/chats",
    icon: FaRegMessage,
    count:unreadCount,
    activeIcon: FaMessage,
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: FaRegHeart,
    count:notificationCount,
    activeIcon: FaHeart,
  },
  {
    name: "Profile",
    href: "/profile",
    count:"",
    icon: FaRegUser,
    activeIcon: FaUser,
  },
];

useEffect(() => {
  const socket = getSocket();
  const handleNewNotification = (data) => {
 dispatch(setUnSeenNotificationCount(data?.unSeenNotificationCount))
    console.log(data)

    if(data?.type =="like"){
        toast.success(`${data?.actor?.username} Just liked your post`);
    }
    if(data?.type =="dp_like"){
        toast.success(`${data?.actor?.username} Just liked your DP`);
    }
    if(data?.type =="profile_view"){
        toast.success(`${data?.actor?.username} Just viewed your profile`);
    }
  };

  socket.on("notification:new", handleNewNotification);

  return () => {
    socket.off("notification:new", handleNewNotification);
  };
}, []);


  return (
    <nav
      className="
        pointer-events-none
        fixed
        inset-x-0
        bottom-0
        z-[99]
        flex
        justify-center
      "
    >
      <div
        className="
          pointer-events-auto
          w-full
          bg-[#111111]/95
          backdrop-blur-2xl
          supports-[backdrop-filter]:bg-[#111111]/85
          border-t
          border-white/[0.07]
          pb-[env(safe-area-inset-bottom)]
          shadow-[0_-8px_30px_rgba(0,0,0,0.35)]
          md:max-w-[600px]
          md:border-x
        "
      >
        <div
          className="
            grid
            grid-cols-7
            items-center
            px-1
            py-2
          "
        >
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            const Icon = isActive
              ? item.activeIcon
              : item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                aria-label={item.name}
                className="
                  group
                  relative
                  flex
                  min-w-0
                  flex-col
                  items-center
                  justify-center
                  rounded-xl
                  py-1
                  transition-transform
                  duration-200
                  active:scale-90
                "
              >
                {/* Normal Icons */}
                {!item.isPost && (
                  <span
                    className={`
                      flex
                      h-8
                      relative
                      items-center
                      justify-center
                      transition-all
                      duration-200
                      ${
                        isActive
                          ? "scale-105 text-white"
                          : "text-white/40"
                      }
                    `}
                  >
                    <Icon className="text-[20px]" 
                    /> 
          {Number(item?.count) > 0 && (
  <span
    className="
      absolute
      top-[-5px]
      left-[14px]
      flex
      h-[19px]
      w-[19px]
      items-center
      justify-center
      rounded-full
      bg-red-600
      text-center
      text-[15px]
      text-white
    "
  >
    {item.count}
  </span>
)}
                  </span>
                )}

                {/* Center Post Button */}
                {item.isPost && (
                  <span
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-black
                      shadow-[0_6px_25px_rgba(255,255,255,0.12)]
                      transition-transform
                      duration-200
                      group-active:scale-90
                    "
                  >
                    <Icon className="text-[18px]" />
                  </span>
                )}

                {/* Active Label ONLY */}
                {isActive && !item.isPost && (
                  <span
                    className="
                      absolute
                      top-[30px]
                      whitespace-nowrap
                      text-[8px]
                      font-medium
                      leading-none
                      tracking-wide
                      text-white/90
                    "
                  >
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
