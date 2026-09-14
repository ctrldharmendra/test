

import jwt from "jsonwebtoken";
import db from "./db"


export default async function authenticateAccessToken(request){
    let token = null;
// 1. check authorizatoin header 
    const authHeader = request.headers.get("authorization") || "";

  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }
// 2. if token xaina vhanne cookie ma checks garne 
    if (!token) {
    token = request.cookies.get("accessToken")?.value;
  }


    // 3. No token
  if (!token) {
    return {
      error: "accessToken not found",
      status: 401,
      ok: false,
    };
  }

  try {
     // 4. Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
// console.log(decoded, "DEC")
    // 5. Get user from database
    const [rows] = await db.query(
      "SELECT * FROM users WHERE id = ?",
      [decoded.userId]
    );

    if (!rows.length) {
      return {
        error: "Token Invalid",
        status: 401,
      };
    }
    // 6. Remove password
    const { password: _, ...user } = rows[0];

    return {
      user,
      error: null,
    };
    
  } catch (error) {
// delete old cookkie
  // cookieStore.delete('accessToken');

     return {
       ok: false,
       success:false,
      error: "Invalid or expired token..",
      status: 401,
    };
  }

}