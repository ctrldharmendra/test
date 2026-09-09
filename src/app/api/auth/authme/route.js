import authenticateAccessToken from "@/lib/authenticateAccessToken";
import { NextResponse } from "next/server";
import db from "@/lib/db";


export async function GET(request) {
 const auth = await authenticateAccessToken(request);


  if (auth.error) {
console.log(auth, "errorEEEEEE")
    return NextResponse.json(auth);
  }
try {
    // const [users] = await db.query("SELECT * FROM users");

    return NextResponse.json({
        success: true,
        data: auth,
        ok:true, 
        error:null
        
    });
} catch (error) {
    return NextResponse.json(auth);
}
}