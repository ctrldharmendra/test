// app/api/auth/google/complete/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "../../../../../lib/db";

export async function POST(request) {
  let connection;

  try {
    const body = await request.json();
    const {
      pendingSignupToken,
      username,
      gender,
      dob,
      location_source,
      display_name,
      latitude,
      longitude,
    } = body;


    // 1. PENDING TOKEN VERIFY KARO (Google data yahi se milega)


    let googleData;
    try {
      googleData = jwt.verify(pendingSignupToken, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Signup session expired, please try again" },
        { status: 401 }
      );
    }

    const { email, name, picture, googleId } = googleData;

    // ==========================================
    // 2. VALIDATION (aapke existing register route jaisa)
    // ==========================================

    if (!username || !gender || !dob) {
      return NextResponse.json(
        { success: false, message: "Required fields are missing" },
        { status: 400 }
      );
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // double-check email/googleId dobara exist to nahi karta (race condition safety)
    const [existingCheck] = await connection.execute(
      `SELECT id FROM users WHERE email = ? OR google_id = ? LIMIT 1`,
      [email, googleId]
    );

    if (existingCheck.length > 0) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, message: "Account already exists, please login" },
        { status: 409 }
      );
    }

    // ==========================================
    // 3. INSERT USER (password NULL — Google user kabhi password use nahi karega)
    // ==========================================

    const [userResult] = await connection.execute(
      `
        INSERT INTO users
          (email, password, fullname, username, dob, gender, dp, google_id)
        VALUES (?, "NULL", ?, ?, ?, ?, ?, ?)
      `,
      [email, name, username, dob, gender, picture || null, googleId]
    );

    const userId = userResult.insertId;

    // ==========================================
    // 4. INSERT LOCATION
    // ==========================================

    const [locationResult] = await connection.execute(
      `
        INSERT INTO user_locations
          (user_id, latitude, longitude, location_source, display_name)
        VALUES (?, ?, ?, ?, ?)
      `,
      [userId, latitude, longitude, location_source, display_name]
    );

    if (locationResult.affectedRows === 0) {
      throw new Error("Failed to create location");
    }

    await connection.commit();

    // ==========================================
    // 5. TURANT LOGIN KARO (JWT issue karo)
    // ==========================================

    const accessToken = jwt.sign(
      { userId, username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      { success: true, message: "Account created successfully" },
      { status: 201 }
    );

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (_) {}
    }

    console.error("Complete Google signup error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { success: false, message: "Username already taken" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || "Failed to complete signup" },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}