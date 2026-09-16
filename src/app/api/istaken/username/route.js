

// check if username, email is already taken
import { NextResponse } from "next/server"
import db from "../../../../lib/db"




export async function GET(request){
// get username from query 
const {searchParams} = new URL(request.url)
const username = searchParams.get("username")
const email = searchParams.get("email")


try {
    const [doesUserExists] = await db.execute(
    `SELECT * FROM users WHERE username = ?`,
    [username]
)

if(doesUserExists?.length >0){
    return NextResponse.json({
        success: true,
        message: `Username is already taken.`,
        user: doesUserExists,
        taken:true
    })
}


return NextResponse.json({
    success: true,
    message: "Username is available",
    user: doesUserExists,
    taken:false
})
} catch (error) {
        console.error("Username API error:", error);

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to load username",
            },
            { status: 500 }
        );
}
}