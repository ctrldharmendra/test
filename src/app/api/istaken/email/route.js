

// check if  email is already taken
import { NextResponse } from "next/server"
import db from "../../../../lib/db"




export async function GET(request){
// get email from query 
const {searchParams} = new URL(request.url)
const email = searchParams.get("email")


try {
    const [doesUserExists] = await db.execute(
    `SELECT * FROM users WHERE email = ?`,
    [email]
)

if(doesUserExists?.length >0){
    return NextResponse.json({
        success: true,
        message: `email is already taken.`,
        user: doesUserExists,
        taken:true
    })
}


return NextResponse.json({
    success: true,
    message: "Email is available",
    user: doesUserExists,
    taken:false
})
} catch (error) {
        console.error("email API error:", error);

        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to load email",
            },
            { status: 500 }
        );
}
}