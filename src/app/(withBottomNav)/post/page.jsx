
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  FaArrowLeft,
  FaImage,
  FaXmark,
  FaPaperPlane,
} from "react-icons/fa6";

import { useDispatch, useSelector } from "react-redux";

import {
  setSelectedImageToPost,
  setWrittenCaptionToPost,
} from "@/redux/slices/stateSlice";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CreatePostPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const fileInputRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Redux State
  |--------------------------------------------------------------------------
  */

  const selectedImageToPost = useSelector(
    (state) => state?.userState?.selectedImageToPost
  );

  const writtenCaptionToPost = useSelector(
    (state) => state?.userState?.writtenCaptionToPost
  );


  const [isPosting, setIsPosting] = useState(false);



  const selectedFileRef = useRef(null);



  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Only allow images
    if (!file.type.startsWith("image/")) {
      return;
    }


    if (selectedImageToPost?.url) {
      URL.revokeObjectURL(selectedImageToPost.url);
    }

    /*
     * Store actual File outside Redux
     */
    selectedFileRef.current = file;

    /*
     * Create temporary preview URL
     */
    const imageUrl = URL.createObjectURL(file);

    /*
     * Store serializable information in Redux
     */
    dispatch(
      setSelectedImageToPost({
        url: imageUrl,
        name: file.name,
        type: file.type,
        size: file.size,
      })
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Remove Image
  |--------------------------------------------------------------------------
  */

  const removeImage = () => {
    /*
     * Remove object URL
     */
    if (selectedImageToPost?.url) {
      URL.revokeObjectURL(selectedImageToPost.url);
    }

    /*
     * Remove actual file
     */
    selectedFileRef.current = null;

    /*
     * Clear Redux state
     */
    dispatch(setSelectedImageToPost(null));

    /*
     * Reset file input
     */
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Caption
  |--------------------------------------------------------------------------
  */

  const handleCaptionChange = (e) => {
    const value = e.target.value;

    if (value.length > 500) {
      return;
    }

    dispatch(setWrittenCaptionToPost(value));
  };

  /*
  |--------------------------------------------------------------------------
  | Create Post
  |--------------------------------------------------------------------------
  */

  const handlePost = async () => {
    if (!selectedImageToPost || isPosting) {
      return;
    }

    const file = selectedFileRef.current;

    /*
     * This can happen if user refreshes/navigates
     * and Redux still contains the preview data,
     * but the File object is gone.
     */
    if (!file) {
       dispatch(setWrittenCaptionToPost(""));
        dispatch(setSelectedImageToPost(null));
        return toast.error("Kindly try again Selecting  Image again.")
      console.error("Image  is missing.");
      return;
    }

    try {
      setIsPosting(true);

      /*
       * FormData for API
       */
      const formData = new FormData();

      formData.append("image", file);

      formData.append(
        "caption",
        writtenCaptionToPost || ""
      );
    //   | API CALL


      const response = await fetch("/api/post", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to post");
      }
if(data?.success === true){
     toast.success("Posted successfully")
    dispatch(setSelectedImageToPost(null))
    dispatch(setWrittenCaptionToPost(""))
     router.push(`/profile`)
}


    } catch (error) {
      console.error("Post failed:", error);
    } finally {
      setIsPosting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-dvh bg-[#080808] text-white">

      {/* ================================================================
          APP HEADER
      ================================================================= */}

      <header
        className="
          sticky
          top-0
          z-30
          flex
          h-16
          items-center
          justify-between
          border-b
          border-white/[0.06]
          bg-[#080808]/80
          px-4
          backdrop-blur-2xl
        "
      >

        {/* Back Button */}

        <button
          type="button"
          onClick={() => window.history.back()}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-white/[0.06]
            text-white
            transition
            active:scale-90
          "
        >
          <FaArrowLeft className="text-sm" />
        </button>

        {/* Title */}

        <h1 className="text-[17px] font-semibold tracking-tight">
          Create Post
        </h1>

        {/* Right Spacer */}

        <div className="h-10 w-10" />

      </header>

      {/* ================================================================
          MAIN CONTENT
      ================================================================= */}

      <div
        className="
          mx-auto
          w-full
          max-w-xl
          px-4
          pt-5
        "
      >

        {/* ==============================================================
            IMAGE SECTION
        ============================================================== */}

        <section>

          {!selectedImageToPost ? (

            /*
             * ==========================================================
             * NO IMAGE SELECTED
             * ==========================================================
             */

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="
                group
                relative
                flex
                aspect-square
                w-full
                flex-col
                items-center
                justify-center
                overflow-hidden
                rounded-[28px]
                border
                border-dashed
                border-white/15
                bg-white/[0.035]
                transition
                active:scale-[0.985]
                hover:border-white/25
                hover:bg-white/[0.05]
              "
            >

              {/* Glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  h-40
                  w-40
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  bg-white/[0.04]
                  blur-3xl
                "
              />

              {/* Image Icon */}

              <div
                className="
                  relative
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-[22px]
                  bg-white/[0.08]
                  text-white
                  shadow-2xl
                "
              >
                <FaImage className="text-2xl" />
              </div>

              {/* Text */}

              <div className="relative mt-5 text-center">

                <p className="text-[16px] font-semibold">
                  Choose an image
                </p>

                <p className="mt-1.5 text-sm text-white/45">
                  Select a photo to share
                </p>

              </div>

              {/* Choose Button */}

              <div
                className="
                  relative
                  mt-6
                  rounded-full
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-black
                  shadow-lg
                "
              >
                Choose Image
              </div>

            </button>

          ) : (

            /*
             * ==========================================================
             * IMAGE SELECTED
             * ==========================================================
             */

            <div
              className="
                relative
                aspect-square
                w-full
                overflow-hidden
                rounded-[28px]
                bg-black
                shadow-2xl
              "
            >

              {/* Image */}

              <Image
                src={selectedImageToPost.url}
                alt="Selected image"
                fill
                unoptimized
                className="object-cover"
              />

              {/* Bottom Gradient */}

              <div
                className="
                  absolute
                  inset-x-0
                  bottom-0
                  h-32
                  bg-gradient-to-t
                  from-black/70
                  to-transparent
                "
              />

              {/* Remove Button */}

              <button
                type="button"
                onClick={removeImage}
                className="
                  absolute
                  right-3
                  top-3
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-black/55
                  text-white
                  shadow-lg
                  backdrop-blur-xl
                  transition
                  active:scale-90
                "
              >
                <FaXmark />
              </button>

              {/* Change Image */}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="
                  absolute
                  bottom-4
                  left-4
                  flex
                  items-center
                  gap-2
                  rounded-full
                  bg-black/55
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-white
                  backdrop-blur-xl
                  transition
                  active:scale-95
                "
              >
                <FaImage className="text-xs" />
                Change
              </button>

            </div>

          )}

          {/* ============================================================
              FILE INPUT
          ============================================================ */}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

        </section>

        {/* ==============================================================
            CAPTION SECTION
        ============================================================== */}

        <section className="mt-5">

          <div
            className="
              overflow-hidden
              rounded-[24px]
              border
              border-white/[0.07]
              bg-white/[0.035]
              transition
              focus-within:border-white/15
              focus-within:bg-white/[0.045]
            "
          >

            <div className="px-4 pt-4">

              {/* Caption Header */}

              <div className="mb-2 flex items-center justify-between">

                <label
                  htmlFor="caption"
                  className="text-sm font-semibold text-white/80"
                >
                  Caption
                </label>

                <span className="text-xs text-white/30">
                  {writtenCaptionToPost?.length || 0}/500
                </span>

              </div>

              {/* Caption Input */}

              <textarea
                id="caption"
                value={writtenCaptionToPost || ""}
                onChange={handleCaptionChange}
                placeholder="Write something about your post..."
                rows={5}
                className="
                  w-full
                  resize-none
                  bg-transparent
                  pb-4
                  text-[15px]
                  leading-6
                  text-white
                  outline-none
                  placeholder:text-white/25
                "
              />

            </div>

          </div>

        </section>

        {/* ==============================================================
            HELPER TEXT
        ============================================================== */}

        <p className="px-2 pt-3 text-xs leading-5 text-white/30">
          Share something interesting, a moment, or a thought with your
          connections.
        </p>

      </div>

      {/* ================================================================
          BOTTOM POST ACTION
      ================================================================= */}

      <div
        className="

          z-40
          border-t
          border-white/[0.06]
          bg-[#080808]/85
          px-4
          pb-[calc(env(safe-area-inset-bottom)+12px)]
          pt-3
          backdrop-blur-2xl
        "
      >

        <div className="mx-auto max-w-xl">

          <button
            type="button"
            disabled={!selectedImageToPost || isPosting}
            onClick={handlePost}
            className="
              flex
              h-14
              w-full
              items-center
              justify-center
              gap-2.5
              rounded-2xl
              bg-white
              text-[15px]
              font-bold
              text-black
              shadow-xl
              transition
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:bg-white/10
              disabled:text-white/30
              disabled:shadow-none
            "
          >

            {isPosting ? (

              /*
               * ========================================================
               * POSTING
               * ========================================================
               */

              <>
                <span
                  className="
                    h-5
                    w-5
                    animate-spin
                    rounded-full
                    border-2
                    border-black/20
                    border-t-black
                  "
                />

                Posting...
              </>

            ) : (

              /*
               * ========================================================
               * NORMAL
               * ========================================================
               */

              <>
                <FaPaperPlane className="text-sm" />
                Post
              </>

            )}

          </button>

        </div>

      </div>

    </main>
  );
}
