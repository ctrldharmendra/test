
"use client";

import { useEffect, useState } from "react";

import {
  FaGear,
  FaLock,
  FaShieldHalved,
  FaBell,
  FaUserShield,
  FaEye,
  FaLocationDot,
  FaEnvelope,
  FaCommentDots,
  FaHeart,
  FaCircleInfo,
  FaCircleQuestion,
  FaRightFromBracket,
  FaUserXmark,
} from "react-icons/fa6";

import SettingsSection from "./components/SettingSections";
import SettingItem from "./components/SettingItems";
import ConfirmationModal from "./components/ConfirmationModal";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setLoggedInUserId } from "@/redux/slices/stateSlice";

export default function SettingsPage() {
  const dispatch = useDispatch();
  // SETTINGS STATE
  const [settings, setSettings] = useState({
    // Profile View Notification: false,
    hideDistance: false,
    showOnlineStatus: true,

    allowMessages: true,
    messageRequests: true,

    notifications: true,
    likeNotifications: true,
    commentNotifications: true,

    profileVisibility: true,
    showEmail: false,

    locationAccess: true,
  });

  // CONFIRMATION STATE

  const [confirmation, setConfirmation] = useState({
    open: false,
    key: null,
    nextValue: false,
    title: "",
    description: "",
  });

  // REQUEST TO CHANGE TOGGLE
  const requestToggle = (key, title, description) => {
    const currentValue = settings[key];
    const nextValue = !currentValue;
    setConfirmation({open: true, key, nextValue, title, description});
  };

  // CONFIRM CHANG
  const confirmToggle = () => {
    const {key, nextValue, } = confirmation;

    if (!key) return;

    setSettings((prev) => ({
      ...prev,
      [key]: nextValue,
    }));

    console.log(`${key}:`, nextValue);
    if(key === "Profile View Notification"){
      toggleProfileViewNotify();
    }

    if(key === "Log out?"){
      handleLogout();
    }

    setConfirmation({
      open: false,
      key: null,
      nextValue: false,
      title: "",
      description: "",
    });
  };

  // CANCEL CHANGE

  const cancelToggle = () => {
    setConfirmation({
      open: false,
      key: null,
      nextValue: false,
      title: "",
      description: "",
    });
  };

  // RENDER


  // calling is_profile_view_notify api || GET
  const [is_profile_view_notify, setis_profile_view_notify] = useState(true);
  useEffect(() => {
    const fetchIsProfileViewNotify = async () => {
      try {
        const response = await fetch(
          `/api/settings/is_profile_view_notify`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to load profile"
          );
        }
        setis_profile_view_notify(data?.data?.[0]?.is_profile_view_notify);
      } catch (error) {
        console.error("Error fetching is_profile_view_notify:", error);
      }
    };

    fetchIsProfileViewNotify();
  }, []);


  // calling is_profile_view_notify api || PATCH
  const toggleProfileViewNotify = async () => {
      try {
        const response = await fetch(
          `/api/settings/is_profile_view_notify`,
          {
            method: "PATCH",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to load profile"
          );
        }
        if(data?.success){
          toast.success("Applied Successfully.");
          setis_profile_view_notify((prev) => !prev);
        }
        // console.log(data, "PATCH DATA")
        // setis_profile_view_notify(data?.data?.[0]?.is_profile_view_notify);
      } catch (error) {
        console.error("Error fetching is_profile_view_notify:", error);
      }
    };

    // log out api 
    const handleLogout = async () => {
      try {
        const response = await fetch(
          `/api/auth/logout`,
          {
            method: "POST",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to log out"
          );
        }
        if(data?.success == true){
          toast.success("Logged out successfully.");
          dispatch(setLoggedInUserId(null));

          // wait 2 sec 
          setTimeout(() => {
            window.location.href = "/";
          }, 3000);
        }

        console.log(data, "LOGOUT DATA")
      } catch (error) {
        console.error("Error fetching log out:", error);
      }
    };

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
          px-4
        "
      >
        {/* HEADER */}
   <header
          className="
            flex items-center gap-3
            pb-5
            pt-[calc(env(safe-area-inset-top)+20px)]
          "
        >
          <div
            className="
              flex h-11 w-11
              items-center justify-center
              rounded-2xl
              bg-red-500/10
              text-red-500
            "
          >
            <FaGear className="text-lg" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Settings 

            </h1>

            <p className="mt-0.5 text-xs text-white/30">
              Manage your account and preferences
            </p>
          </div>
        </header>

        {/* SETTINGS */}

        <div className="space-y-3 pb-28">

          {/* PRIVACY */}
          <SettingsSection
            icon={FaLock}
            title="Privacy"
            description="Control who can see and interact with you"
            defaultOpen={true}
          >
            <SettingItem
              icon={FaUserShield}
              title="Profile View Notification"
              description="
                See who views your profile. Notifications are only sent when both users have Profile View Notifications enabled. If either user turns it off, profile views remain private for both.
              "
              value={is_profile_view_notify}
              onToggle={() =>
                requestToggle(
                  "Profile View Notification",
                  "Are you sure ?",
                  "When this is turned on, you can see who views your profile, and others can see when you view theirs — only if both of you have this feature turned on. If you keep it off, you won’t know who views your profile, and people you view won’t know that you viewed theirs."
                )
              }
            />

            <SettingItem
              icon={FaLocationDot}
              title="Hide my distance"
              description="
                Other users won't see how far away you are.
              "
              value={settings.hideDistance}
              onToggle={() =>
                requestToggle(
                  "hideDistance",
                  "Hide your distance?",
                  "Your exact distance will no longer be shown to other users."
                )
              }
            />

            <SettingItem
              icon={FaEye}
              title="Show online status"
              description="
                Let other users know when you're active.
              "
              value={settings.showOnlineStatus}
              onToggle={() =>
                requestToggle(
                  "showOnlineStatus",
                  settings.showOnlineStatus
                    ? "Hide online status?"
                    : "Show online status?",
                  settings.showOnlineStatus
                    ? "Other users will no longer see when you're active."
                    : "Other users will be able to see when you're active."
                )
              }
            />
          </SettingsSection>

          {/* SECURITY */}
          {/* <SettingsSection
            icon={FaShieldHalved}
            title="Security"
            description="Protect your account"
          >
            <SettingItem
              icon={FaShieldHalved}
              title="Login alerts"
              description="
                Get notified when someone logs into your account.
              "
              value={true}
              onToggle={() =>
                console.log(
                  "Login alerts clicked"
                )
              }
            />

            <SettingItem
              icon={FaLock}
              title="Two-factor authentication"
              description="
                Add an extra layer of security to your account.
              "
              type="navigation"
              onClick={() =>
                console.log(
                  "Open 2FA settings"
                )
              }
            />
          </SettingsSection> */}


          {/* MESSAGES */}
          {/* <SettingsSection
            icon={FaCommentDots}
            title="Messages"
            description="Manage who can contact you"
          >
            <SettingItem
              icon={FaEnvelope}
              title="Allow messages"
              description="
                Allow other users to send you messages.
              "
              value={settings.allowMessages}
              onToggle={() =>
                requestToggle(
                  "allowMessages",
                  settings.allowMessages
                    ? "Turn off messages?"
                    : "Allow messages?",
                  settings.allowMessages
                    ? "Other users will no longer be able to send you new messages."
                    : "Other users will be able to send you messages."
                )
              }
            />

            <SettingItem
              icon={FaCommentDots}
              title="Message requests"
              description="
                Messages from people you don't follow will appear as requests.
              "
              value={settings.messageRequests}
              onToggle={() =>
                requestToggle(
                  "messageRequests",
                  settings.messageRequests
                    ? "Turn off message requests?"
                    : "Turn on message requests?",
                  settings.messageRequests
                    ? "New messages from unknown users will no longer appear as message requests."
                    : "Messages from people you don't follow will appear as requests."
                )
              }
            />
          </SettingsSection> */}


          {/* NOTIFICATIONS */}
          {/* <SettingsSection
            icon={FaBell}
            title="Notifications"
            description="Choose what you want to be notified about"
          >
            <SettingItem
              icon={FaBell}
              title="Push notifications"
              description="
                Receive notifications about activity on your account.
              "
              value={settings.notifications}
              onToggle={() =>
                requestToggle(
                  "notifications",
                  settings.notifications
                    ? "Turn off notifications?"
                    : "Turn on notifications?",
                  settings.notifications
                    ? "You won't receive push notifications from the app."
                    : "You'll receive push notifications about activity on your account."
                )
              }
            />

            <SettingItem
              icon={FaHeart}
              title="Likes"
              description="
                Get notified when someone likes your posts.
              "
              value={settings.likeNotifications}
              onToggle={() =>
                requestToggle(
                  "likeNotifications",
                  settings.likeNotifications
                    ? "Turn off like notifications?"
                    : "Turn on like notifications?",
                  settings.likeNotifications
                    ? "You won't receive notifications when someone likes your posts."
                    : "You'll receive notifications when someone likes your posts."
                )
              }
            />

            <SettingItem
              icon={FaCommentDots}
              title="Comments"
              description="
                Get notified when someone comments on your posts.
              "
              value={settings.commentNotifications}
              onToggle={() =>
                requestToggle(
                  "commentNotifications",
                  settings.commentNotifications
                    ? "Turn off comment notifications?"
                    : "Turn on comment notifications?",
                  settings.commentNotifications
                    ? "You won't receive notifications about new comments."
                    : "You'll receive notifications when someone comments on your posts."
                )
              }
            />
          </SettingsSection> */}


          {/* PROFILE */}
          {/* <SettingsSection
            icon={FaUserShield}
            title="Profile"
            description="Control how your profile appears"
          >
            <SettingItem
              icon={FaEye}
              title="Profile visibility"
              description="
                Allow your profile to appear in search and discovery.
              "
              value={settings.profileVisibility}
              onToggle={() =>
                requestToggle(
                  "profileVisibility",
                  settings.profileVisibility
                    ? "Hide your profile?"
                    : "Show your profile?",
                  settings.profileVisibility
                    ? "Your profile will no longer appear in search and discovery."
                    : "Your profile will be visible in search and discovery."
                )
              }
            />

            <SettingItem
              icon={FaEnvelope}
              title="Show email address"
              description="
                Allow other users to see your email address.
              "
              value={settings.showEmail}
              onToggle={() =>
                requestToggle(
                  "showEmail",
                  settings.showEmail
                    ? "Hide email address?"
                    : "Show email address?",
                  settings.showEmail
                    ? "Your email address will be hidden from other users."
                    : "Your email address will be visible on your profile."
                )
              }
            />
          </SettingsSection> */}

          {/* LOCATION */}
          {/* <SettingsSection
            icon={FaLocationDot}
            title="Location"
            description="Manage location-based features"
          >
            <SettingItem
              icon={FaLocationDot}
              title="Location access"
              description="
                Use your location to show people nearby.
              "
              value={settings.locationAccess}
              onToggle={() =>
                requestToggle(
                  "locationAccess",
                  settings.locationAccess
                    ? "Turn off location access?"
                    : "Turn on location access?",
                  settings.locationAccess
                    ? "Nearby people and distance-based features may stop working."
                    : "Your location can be used to show nearby people and calculate distance."
                )
              }
            />
          </SettingsSection> */}

          {/* HELP */}
          {/* <SettingsSection
            icon={FaCircleQuestion}
            title="Help & About"
            description="Information and support"
          >
            <SettingItem
              icon={FaCircleQuestion}
              title="Help center"
              description="Get help with using the application."
              type="navigation"
              onClick={() =>
                console.log("Open help center")
              }
            />

            <SettingItem
              icon={FaCircleInfo}
              title="About"
              description="Learn more about this application."
              type="navigation"
              onClick={() =>
                console.log("Open about")
              }
            />
          </SettingsSection> */}

          {/* LOGOUT */}

          <div
            className="
              mt-5
              overflow-hidden
              rounded-2xl
              border border-red-500/10
              bg-red-500/[0.025]
            "
          >
            <SettingItem
              icon={FaRightFromBracket}
              title="Log out"
              description="Sign out from this device."
              danger
              type="navigation"
                     onClick={() =>
                requestToggle(
                  "Log out?",
                  "Are you sure, you want to log out?",
                  "You need your credentials to log in next time again."
                )
              }
            />

            <SettingItem
              icon={FaUserXmark}
              title="Delete account"
              description="Permanently delete your account and data."
              danger
              type="navigation"
              onClick={() =>
                console.log("Delete account")
              }
            />
          </div>

          {/* Version */}
          <div className="pt-3 text-center">
            <p className="text-[10px] text-white/15">
              Your App
            </p>

            <p className="mt-1 text-[10px] text-white/10">
              Version 1.0.0
            </p>
          </div>
        </div>
      </div>

      {/* REUSABLE CONFIRMATION */}

      <ConfirmationModal
        open={confirmation.open}
        title={confirmation.title}
        description={confirmation.description}
        confirmText="Yes"
        cancelText="No"
        onConfirm={confirmToggle}
        onCancel={cancelToggle}
      />
    </main>
  );
}
