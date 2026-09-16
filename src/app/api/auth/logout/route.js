
import { NextResponse } from "next/server";


// logout api 

export async function POST() {
try {
      const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");

  return response;
} catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to logout",
    });
}
}