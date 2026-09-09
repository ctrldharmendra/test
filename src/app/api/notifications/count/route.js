import authenticateAccessToken from "@/lib/authenticateAccessToken";
import { getUserFromToken } from "@/lib/getUserFromToken";
import db from "@/lib/db";
import { NextResponse } from "next/server";


// get notification count for loggedin user only which are not seen
export async function GET(request, {params}){
    const auth = await authenticateAccessToken(request);
    if (auth.error) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status }
      );
    }

    try {
        const loggedInUser = await getUserFromToken();
        const loggedInUserId = loggedInUser?.userId;

        const [count] = await db.execute(
            `SELECT COUNT (id) AS count FROM notifications WHERE recipient_id = ? AND is_seen = 0`, 
            [loggedInUserId]
        )

        return NextResponse.json(
            { success: true, count },
            { status: 200 }
        );
        
    } catch (error) {
        console.error("Get notification count error:", error);
        return NextResponse.json(
          { success: false, message: error.message || "Failed to get notification count" },
          { status: 500 }
        );
    }
}