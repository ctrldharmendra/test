import { NextResponse } from "next/server";
import db from "../../../lib/db";
import authenticateAccessToken from "@/lib/authenticateAccessToken";

export async function GET(request) {
 const auth = await authenticateAccessToken(request);


  if (auth.error) {
console.log(auth, "error")
    return NextResponse.json(
      { message: auth.error },
      { status: auth.status }
    );
  }


try {
    const [users] = await db.query("SELECT * FROM users");

    return NextResponse.json(users);
} catch (error) {
    return NextResponse.json({ message: error.message });
}
}