// app/api/auth/google/route.js
import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import db from "../../../../lib/db";
import jwt from "jsonwebtoken"; // aapke existing login route me jo use hota hai wahi

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(request) {
  try {
    const { credential } = await request.json(); // Google se mila hua ID token

    if (!credential) {
      return NextResponse.json(
        { success: false, message: "No credential provided" },
        { status: 400 }
      );
    }

    // 1. VERIFY TOKEN — confirm karo ye genuinely Google se hai

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Google account has no email" },
        { status: 400 }
      );
    }

    // 2. CHECK — kya ye user already exist karta hai

    const [existingRows] = await db.execute(
      `SELECT id, username, email FROM users WHERE email = ? OR google_id = ? LIMIT 1`,
      [email, googleId]
    );

    if (existingRows.length > 0) {
      // USER EXISTS — LOGIN

      const user = existingRows[0];

      const accessToken = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "30d" } 
      );

      const response = NextResponse.json(
        { success: true, isNewUser: false, message: "Logged in successfully" },
        { status: 200 }
      );

      response.cookies.set("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return response;
    }


    // USER NAYA HAI — DB me abhi kuch mat banao,
    // sirf verified Google data ek short-lived token me daalo


    const pendingSignupToken = jwt.sign(
      { email, name, picture, googleId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // 15 min ke andar profile complete karna hoga
    );

    return NextResponse.json(
      {
        success: true,
        isNewUser: true,
        pendingSignupToken,
        prefill: { email, name, picture },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { success: false, message: "Google authentication failed" },
      { status: 500 }
    );
  }
}




export async function GET(request){
    return NextResponse.json({ message: "Hello World", code:process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID });
}