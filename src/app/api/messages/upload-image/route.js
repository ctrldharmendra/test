// app/api/messages/upload-image/route.js
import { NextResponse } from "next/server";
import authenticateAccessToken from "@/lib/authenticateAccessToken";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { uploadImage } from "@/lib/upload";

export async function POST(request) {
  const auth = await authenticateAccessToken(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  try {
    const loggedInUser = await getUserFromToken();
    if (!loggedInUser?.userId) {
      return NextResponse.json(
        { success: false, message: "Unable to identify logged-in user" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json(
        { success: false, message: "No image provided" },
        { status: 400 }
      );
    }

    const uploadedImage = await uploadImage(image, { folder: "messages" });

    return NextResponse.json(
      { success: true, imageUrl: uploadedImage.url },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload message image error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}