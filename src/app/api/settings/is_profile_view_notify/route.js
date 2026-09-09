import { NextResponse } from "next/server";
import db from "@/lib/db";
import authenticateAccessToken from "@/lib/authenticateAccessToken";
import { getUserFromToken } from "@/lib/getUserFromToken";

// update is_profile_view_notify | it is in user table | toggle it when this api runs 
export async function PATCH(request) {
    try {
    const loggedInUser = await getUserFromToken();
    const loggedInUserId = loggedInUser?.userId;

    if (!loggedInUserId) {
      return NextResponse.json(
        { success: false, ok:false, message: "Unable to identify logged-in user" },
        { status: 401 }
      );
    }
        

    // SET THE OPPOSITE VALUE
const [updateProfile] = await db.execute(
    `UPDATE users
      SET is_profile_view_notify = NOT COALESCE(is_profile_view_notify, 0)
      WHERE id = ?`,
    [loggedInUserId]
)

return NextResponse.json(
  {
    success: true,
    data: updateProfile,
  },
  { status: 200 }
);

    } catch (error) {
        console.log(error, "FROM is_profile_view_notify")
        return NextResponse.json(
          { success: false, ok: false, message: error.message || "Failed to load profile" },
          { status: 500 }
        );
    }
}


// get 
export async function GET(request) {
    try {
    const loggedInUser = await getUserFromToken();
    const loggedInUserId = loggedInUser?.userId;

    if (!loggedInUserId) {
      return NextResponse.json(
        { success: false, ok:false, message: "Unable to identify logged-in user" },
        { status: 401 }
      );
    }

        

const [is_profile_view_notify] = await db.execute(
    `SELECT is_profile_view_notify
      FROM users
      WHERE id = ?`,
    [loggedInUserId]
)

return NextResponse.json(
  {
    success: true,
    data: is_profile_view_notify,
  },
  { status: 200 }
);

    } catch (error) {
        console.log(error, "FROM is_profile_view_notify")
        return NextResponse.json(
          { success: false, ok: false, message: error.message || "Failed to load profile" },
          { status: 500 }
        );
    }
} 