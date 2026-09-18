import React from 'react'

const ProfileImage = ({profileImage, setProfileImage, profileImagePreview, setProfileImagePreview}) => {
  return (
<>
<div className="flex flex-col items-center pb-2">
  <label className="mb-3 block text-sm font-medium text-slate-700">
    Profile image
  </label>

  <label
    htmlFor="profile-image"
    className="group relative cursor-pointer"
  >
    {/* Preview */}
    <div
      className="
        flex h-28 w-28 items-center justify-center
        overflow-hidden rounded-full
        border-4 border-white
        bg-slate-100
        shadow-md
        ring-1 ring-slate-200
        transition
        group-hover:ring-blue-400
      "
    >
      {profileImagePreview ? (
        <img
          src={profileImagePreview}
          alt="Profile preview"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mb-1 h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0"
            />
          </svg>

          <span className="text-[10px]">
            Add photo
          </span>
        </div>
      )}
    </div>

    {/* Camera button */}
    <div
      className="
        absolute bottom-0 right-0
        flex h-9 w-9 items-center justify-center
        rounded-full
        border-4 border-white
        bg-blue-600
        text-white
        shadow-md
        transition
        group-hover:bg-blue-700
      "
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 7.5h1.5l1.125-1.5h5.25l1.125 1.5h1.5A2.25 2.25 0 0119.5 9.75v7.5a2.25 2.25 0 01-2.25 2.25h-10.5A2.25 2.25 0 014.5 17.25v-7.5A2.25 2.25 0 016.75 7.5z"
        />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 13.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
        />
      </svg>
    </div>

    <input
      id="profile-image"
      type="file"
      accept="image/*"
      // capture="user"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        // Optional validation
        if (!file.type.startsWith("image/")) {
          toast.error("Please select an image");
          return;
        }

        // 5MB limit
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image must be smaller than 5MB");
          return;
        }

        setProfileImage(file);

        // Create preview
        const previewUrl = URL.createObjectURL(file);
        setProfileImagePreview(previewUrl);
      }}
    />
  </label>

  <p className="mt-2 text-xs text-slate-400">
    Tap to upload your profile photo
  </p>
</div>
</>
  )
}

export default ProfileImage