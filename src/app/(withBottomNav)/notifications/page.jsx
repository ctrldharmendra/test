
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import {
  FaArrowLeft,
  FaEllipsis,
  FaHeart,
  FaRegHeart,
  FaUserPlus,
  FaComment,
  FaShare,
  FaCheck,
  FaTrash,
  FaEye,
} from "react-icons/fa6";
import { getSocket } from "@/lib/socket";
import { setUnSeenNotificationCount } from "@/redux/slices/stateSlice";
import { useDispatch, useSelector } from "react-redux";
import { RiDislikeFill } from "react-icons/ri";
import { IoEye } from "react-icons/io5";
import Link from "next/link";
import NotificationLoading from "./NotificationLoading";


export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([{}]);
  // console.log(notifications, "N F")
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
const dispatch = useDispatch();
  const onlineIds = useSelector((state) => state?.onlineUsers?.ids);


  const [loading, setloading] = useState(true)

// T----------------------------
//   useEffect(() => {
// const socket = getSocket();

// // reply sunne ke liye | BACKEND SE
// socket.on("say-hello-reply", (data)=>{
//   console.log("Backend se mila:", data)
// })

//     return () => {
//       socket.off("hello-reply"); // cleanup — component unmount pe listener hatao
//     };
//   }, [])

//   // send in backend | FRONTEND SE
// const sendHello = () =>{
//   const socket = getSocket();
//   socket.emit("say-hello", "Hello from frontend!");  //EVENT
// }
// -0------------------
  


// T 

//   | Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setloading(true)
        const response = await fetch(`/api/notifications`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to load notifications"
          );
        }
        setNotifications(data?.notifications || []);
        setloading(false)
      } catch (error) {
        setloading(false)
        console.error("Failed to fetch notifications:", error);
      }
    };

const makeAllNotificationAsSeen = async () => {
  try {
    const response = await fetch(`/api/notifications/seen-all`, {
      method: "PATCH",
    });
    const data = await response.json();
    console.log(data, "N")
    if (!response.ok) {
      throw new Error(data?.message || "Failed to mark all notifications as seen");
    }
  } catch (error) {
    console.error("Failed to mark all notifications as seen:", error);
  }
};
    fetchNotifications();
    makeAllNotificationAsSeen();
    dispatch(setUnSeenNotificationCount(null))
}, [])


// MAKE ALL NOTIFICATION READ ALL | BACKEND API 
const makeAllNotificationAsRead = async () => {
  try {
    const response = await fetch(`/api/notifications/read-all`, {
      method: "PATCH",
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Failed to mark all notifications as read");
    }
    return data;
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
  }
};
// MAKE ALL NOTIFICATION READ ALL END 

//   | Mark all as read
  const handleMarkAllAsRead = async () => {
    const result = await makeAllNotificationAsRead();
    // console.log(result)
    if(result?.success){
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        is_read: 1,
        is_seen: 1,
      }))
    );

    }


  };

//   | Mark single notification as read
// call api function 
const markASingleNotifiRead = async (notificationId) => {
  try {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: "PATCH",
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Failed to mark single notification as read");
    }
    return data;
  } catch (error) {
    console.error("Failed to mark single notification as read:", error);
  }
};
  const handleMarkAsRead = async (notificationId) => {

    const result = await markASingleNotifiRead(notificationId);
    console.log(result)

    // setNotifications((prev) =>
    //   prev.map((notification) =>
    //     notification.not_id === notificationId
    //       ? {
    //           ...notification,
    //           is_read: 1,
    //           is_seen: 1,
    //         }
    //       : notification
    //   )
    // );

    setOpenMenuId(null);


  };




//   | Delete notification
  const handleDelete = (notificationId) => {
    setNotifications((prev) =>
      prev.filter(
        (notification) =>
          notification.not_id !== notificationId
      )
    );

    setOpenMenuId(null);

    /*
     * API example:
     *
     * await fetch(`/api/notifications/${notificationId}`, {
     *   method: "DELETE",
     * });
     */
  };

//   | Relative time
  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);

    const now = new Date();

    const diffInSeconds = Math.floor(
      (now.getTime() - date.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return "Just now";
    }

    const diffInMinutes = Math.floor(
      diffInSeconds / 60
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    }

    const diffInHours = Math.floor(
      diffInMinutes / 60
    );

    if (diffInHours < 24) {
      return `${diffInHours}h`;
    }

    const diffInDays = Math.floor(
      diffInHours / 24
    );

    if (diffInDays === 1) {
      return "Yesterday";
    }

    if (diffInDays < 7) {
      return `${diffInDays}d`;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };


//   | Notification text
  const getNotificationContent = (notification) => {
    switch (notification.type) {
      case "like":
        return "liked your post";

      case "comment":
        return "commented on your post";

      case "follow":
        return "started following you";

      case "share":
        return "shared your post";

        case "dp_like":
          return "liked your profile picture";

        case "profile_view":
          return "Viewed your profile";

      default:
        return "interacted with your post";
    }
  };

//   | Notification Icon
  const getNotificationIcon = (ntype, actor) => {
    console.log(actor)
    switch (ntype) {
      case "like":
        return (
          <div
  // href={`/post/${actor?.post_id}`}
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              bg-red-500
            "
          >
            <FaHeart className="text-[16px] text-white" />
          </div>
        );

      case "comment":
        return (
          <div
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              bg-white/15
            "
          >
            <FaComment className="text-[11px] text-white" />
          </div>
        );

      case "follow":
        return (
          <div
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              bg-white
            "
          >
            <FaUserPlus className="text-[11px] text-black" />
          </div>
        );

      case "share":
        return (
          <div
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              bg-white/15
            "
          >
            <FaShare className="text-[11px] text-white" />
          </div>
        );
      case "dp_like":
        return (
          <div
        // href={`/user/${actor?.username}?source=notification`}
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              bg-[white]
            "
          >
            <RiDislikeFill className="text-[20px] text-red-500" />
          </div>
        );
      case "profile_view":
        return (
          <div
            // href={`/user/${actor?.username}?source=notification`}
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              bg-[#0019bf]
            "
          >
            <IoEye className="text-[20px] text-white" />
          </div>
        );

      default:
        return (
          <div
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              bg-white/10
            "
          >
            <FaHeart className="text-[11px] text-white" />
          </div>
        );
    }
  };


//   | Unread count
  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;



  if(loading){
    return (
      <NotificationLoading></NotificationLoading>
    )
  }
  return (
    <main className="min-h-dvh bg-[#080808] text-white">

      {/* ================================================================
          APP HEADER
      ================================================================= */}

      <header
        className="
          sticky
          top-0
          z-40
          border-b
          border-white/[0.06]
          bg-[#080808]/85
          backdrop-blur-2xl
        "
      >
        <div
          className="
            mx-auto
            flex
            h-16
            w-full
            max-w-xl
            items-center
            justify-between
            px-4
          "
        >
{/* <button onClick={sendHello}>
  Send messsage Test
</button> */}
          {/* Back */}

          <button
            type="button"
            onClick={() => window.history.back()}
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-white/[0.06]
              text-white
              transition
              active:scale-90
            "
            aria-label="Go back"
          >
            <FaArrowLeft className="text-sm" />
          </button>

          {/* Title */}

          <div className="flex items-center gap-2">

            <h1 className="text-[17px] font-semibold tracking-tight">
              Notifications
            </h1>

            {unreadCount > 0 && (
              <span
                className="
                  flex
                  h-5
                  min-w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-red-500
                  px-1.5
                  text-[10px]
                  font-bold
                  text-white
                "
              >
                {unreadCount}
              </span>
            )}

          </div>

          {/* Right */}

          <div className="w-10" />

        </div>
      </header>

      {/* ================================================================
          CONTENT
      ================================================================= */}

      <div
        className="
          mx-auto
          w-full
          max-w-xl
          px-3
          pb-8
        "
      >

        {/* ==============================================================
            ACTION BAR
        ============================================================== */}

        {notifications?.length > 0 && (
          <div className="flex items-center justify-end px-1 py-4">

            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="
                flex
                items-center
                gap-2
                rounded-full
                px-3
                py-2
                text-xs
                font-semibold
                text-white/70
                transition
                active:scale-95
                disabled:cursor-default
                disabled:text-white/25
              "
            >
              <FaCheck className="text-[10px]" />
              Mark all as read
            </button>

          </div>
        )}

        {/* ==============================================================
            NOTIFICATION LIST
        ============================================================== */}

        {notifications?.length > 0 ? (

          <div className="space-y-1">

            {notifications?.map((notification, id) => {

              const isUnread =
                Number(notification.is_read) == 0;

              const isMenuOpen =
                openMenuId === notification.not_id;

              return (
                <Link
                // if notification.type == like then  go to /post/[postId] if notification.type == profile_view then got to /user/[username]
                href={`${notification?.type === "like" ? `/post/${notification?.post_id}` : notification?.type === "profile_view" ? `/user/${notification?.username}` : ""}`}
                  key={notification.not_id || id}
                  className={`
                    relative
                    flex
                    items-center
                    gap-3
                    rounded-[20px]
                    px-3
                    py-3
                    transition

                    ${
                      isUnread
                        ? "bg-[#7575756b]"
                        : "bg-transparent"
                    }
                  `}
                >

                  {/* ==================================================
                      PROFILE IMAGE
                  ================================================== */}

                  <div className="relative shrink-0">

                    <div
                      className="
                        h-12
                        w-12
                        relative
                        rounded-full
                        bg-white/10
                        ring-1
                        ring-white/[0.08]
                      "
                    >
                                 {notification?.user_id && onlineIds.includes(notification?.user_id) ? (
                       <span className="text-green-500 text-[17px] absolute top-0 z-[99999] min-w-[10px] min-h-[10px] bg-[#31ff00] right-0 rounded-full"></span>
              ) : null}

                      {notification.dp ? (

                        <Image
                          src={notification.dp}
                          alt={
                            notification.fullname ||
                            notification.username ||
                            "User"
                          }
                          width={20}
                          height={20}
                          className="
                          h-full
                          w-full
                          object-cover
                        rounded-full
                            object-cover
                          "
                        />

                      ) : (

                        <div
                          className="
                            flex
                            h-full
                            w-full
                            items-center
                            justify-center
                            text-sm
                            font-semibold
                            text-white/50
                          "
                        >
                          {(
                            notification.fullname ||
                            notification.username ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                      )}

                    </div>

                    {/* Notification Type Badge */}

                    <div
                      className="
                        absolute
                        -bottom-1
                        -right-1
                        rounded-full
                        border-2
                        border-[#080808]
                      "
                    >
                      {getNotificationIcon(notification?.type, notification)}
                    </div>

                  </div>

                  {/* ==================================================
                      CONTENT
                  ================================================== */}

                  <button
                    type="button"
                    className="
                      min-w-0
                      flex-1
                      text-left
                      outline-none
                    "
                    onClick={() => {
                      if (isUnread) {
                        handleMarkAsRead(
                          notification.not_id
                        );
                      }

                      /*
                       * Later:
                       * navigate to post/profile
                       */
                    }}
                  >

                    <p
                      className="
                        pr-1
                        text-[14px]
                        leading-5
                        text-white/75
                      "
                    >

                      <span className="font-semibold text-white">
                        {notification.fullname ||
                          notification.username}
                      </span>

                      {" "}

                      <span>
                        {getNotificationContent(
                          notification
                        )}
                      </span>

                    </p>

                    <div
                      className="
                        mt-1
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <span className="text-xs text-white">
                        {formatNotificationTime(
                          notification.created_at
                        )}
                      </span>

                      {isUnread && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-white/30" />

                          <span className="text-[10px] font-medium text-[cornsilk]">
                            New
                          </span>
                        </>
                      )}

                    </div>

                  </button>

                  {/* ==================================================
                      MORE BUTTON
                  ================================================== */}

                  <div
                    ref={
                      isMenuOpen
                        ? menuRef
                        : null
                    }
                    className="relative shrink-0"
                  >

                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId(
                          isMenuOpen
                            ? null
                            : notification.not_id
                        )
                      }
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        text-white/40
                        transition
                        hover:bg-white/[0.06]
                        hover:text-white
                        active:scale-90
                      "
                      aria-label="More options"
                    >
                      <FaEllipsis />
                    </button>

                    {/* =================================================
                        MORE MENU
                    ================================================= */}

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

                        {isUnread && (
                          <button
                            type="button"
                            onClick={() =>
                              handleMarkAsRead(
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
                              text-white/80
                              transition
                              hover:bg-white/[0.07]
                              active:bg-white/[0.1]
                            "
                          >
                            <FaCheck className="text-xs text-white/50" />

                            <span>
                              Mark as read
                            </span>
                          </button>
                        )}

                        {/* Delete */}

                        <button
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
                        </button>

                      </div>
                    )}

                  </div>

                </Link>
              );
            })}

          </div>

        ) : (

          /* ============================================================
             EMPTY STATE
          ============================================================ */

          <div
            className="
              flex
              min-h-[60vh]
              flex-col
              items-center
              justify-center
              px-6
              text-center
            "
          >

            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-[22px]
                bg-white/[0.06]
                ring-1
                ring-white/[0.05]
              "
            >
              <FaRegHeart className="text-xl text-white/50" />
            </div>

            <h2 className="mt-5 text-[16px] font-semibold">
              No notifications yet
            </h2>

            <p className="mt-2 max-w-xs text-sm leading-5 text-white/35">
              When someone interacts with you, you'll see
              their activity here.
            </p>

          </div>

        )}

      </div>

    </main>
  );
}
