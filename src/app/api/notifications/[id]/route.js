
import { NextResponse } from "next/server";
import authenticateAccessToken from "@/lib/authenticateAccessToken";
import db from "@/lib/db";
import { getUserFromToken } from "@/lib/getUserFromToken";

// READ PARTICULAR NOTIFICATION | READ = 1, SEEN = 1
export async function PATCH(request, { params }) {
  const auth = await authenticateAccessToken(request);

  if (auth.error) {
    return NextResponse.json(
      {
        success: false,
        message: auth.error,
      },
      {
        status: auth.status,
      }
    );
  }

  const { id } = await params;
//   console.log(id, "SELECTED ID")

  try {
    const loggedInUser = await getUserFromToken();
    const loggedInUserId = loggedInUser?.userId;


    const [particularNotification] = await db.execute(
        `UPDATE notifications SET is_read = 1, is_seen = 1 WHERE id = ? AND recipient_id = ?`,
        [id, loggedInUserId]
      );



        return NextResponse.json(
    {
      success: true,
      notification: particularNotification,
    },
    {
      status: 200,
    }
  );


  } catch (error) {
    console.error("Read particular Notification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to Read particular Notification",
      },
      {
        status: 500,
      }
    );
  }
}

