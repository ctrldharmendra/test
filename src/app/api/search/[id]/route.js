// id	data	created_at	updated_at	user_id	isActive
import { NextResponse } from "next/server";
import db from "../../../../lib/db";
import authenticateAccessToken from "@/lib/authenticateAccessToken";
import { getUserFromToken } from "@/lib/getUserFromToken";




// soft delete a particular search history from db
export async function PATCH (request, {params}){
// get id
const { id } = await params;


try {
            const loggedInUser = await getUserFromToken();
    const loggedInUserId = loggedInUser?.userId;

    if (!loggedInUserId) {
      return NextResponse.json(
        { success: false, message: "Unable to identify logged-in user" },
        { status: 401 }
      );
    }

// delete 
const [deleteHistory] = await db.execute(
    `UPDATE search_history SET isActive = 0 WHERE id = ?`,
    [id]
)


return NextResponse.json(
  {
    success: true,
    data: deleteHistory,
  },
  { status: 200 }
);


} catch (error) {
    console.log(error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete search history" },
      { status: 500 }
    );
}
}