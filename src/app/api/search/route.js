// id	data	created_at	updated_at	user_id	isActive
import { NextResponse } from "next/server";
import db from "../../../lib/db";
import authenticateAccessToken from "@/lib/authenticateAccessToken";
import { getUserFromToken } from "@/lib/getUserFromToken";


// get search history of a particular user from db | only isActive = 1
export async function GET(request, { params }) {


  try {
    // const { username } = await params;

    // Logged-in user
    const loggedInUser = await getUserFromToken();
    const loggedInUserId = loggedInUser?.userId;

    if (!loggedInUserId) {
      return NextResponse.json(
        { success: false, message: "Unable to identify logged-in user" },
        { status: 401 }
      );
    }

    // get search history of a particular user from db 
   const [searchHistory] = await db.execute(
    `SELECT * FROM search_history WHERE user_id = ? AND isActive = 1 ORDER BY created_at DESC LIMIT 10`,
    [loggedInUserId]
   )

    return NextResponse.json(
      {
        success: true,
        data: searchHistory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get user posts error:", error);

    return NextResponse.json(
      { success: false, message: error.message || "Failed to load search history" },
      { status: 500 }
    );
  }
}


// create a search history of a particular user in db
export async function POST(request, { params}){
    //   get search value from body 
     const { search } = await request.json();

     console.log(search, "CONTROLLER")

  try {
    const loggedInUser = await getUserFromToken();
    const loggedInUserId = loggedInUser?.userId;

    if (!loggedInUserId) {
      return NextResponse.json(
        { success: false, message: "Unable to identify logged-in user" },
        { status: 401 }
      );
    }

    // check if search history already exists, if yes, update it, else create a new one
const [searchHistory] = await db.execute(
    `SELECT id 
     FROM search_history 
     WHERE LOWER(data) = LOWER(?) 
       AND user_id = ?`,
    [search, loggedInUserId]
);

// update if found
if (searchHistory.length > 0){
    const [updatedHistory] = await db.execute(
        `UPDATE search_history SET data = ?, isActive=1 
         WHERE id =?`,
        [search, searchHistory[0].id]
    )
    return NextResponse.json(
      {
        success: true,
        data: updatedHistory,
        mode: "update",
      },
      { status: 200 }
    );
}

// if not found, create a new one
const [newHistory] = await db.execute(
    `INSERT INTO search_history (data, user_id) VALUES (?, ?)`,
    [search, loggedInUserId]
)

return NextResponse.json(
  {
    success: true,
    data: newHistory,
    mode: "create",
  },
  { status: 200 }
);
   
  } catch (error) {
    console.log(error)
     return NextResponse.json(
      { success: false, message: error.message || "Failed to post search history" },
      { status: 500 }
    );
  }
}

// soft delete all search history of a particular user from db
export async function PATCH(request, { params}){

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
        `UPDATE search_history SET isActive = 0 WHERE user_id = ?`,
        [loggedInUserId]
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

