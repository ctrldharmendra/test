
import { NextResponse } from "next/server";
import db from "../../../../lib/db";
import jwt from "jsonwebtoken"
import ms from "ms"


// CREATE ACCESS TOKEN FUNCTION 
const createAccessToken = (user) => {
    const accessToken = jwt.sign(
        {
            userId: user?.[0]?.id,
            email: user?.[0]?.email,
            username: user?.[0]?.username,
            fullname: user?.[0]?.fullname,
            gender: user?.[0]?.gender,
            dob: user?.[0]?.dob,

        },
        process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRATION
    });
    return accessToken;
}

// CREATE REFRESH TOKEN FUNCTION
const createRefreshToken = (user) => {
    const refreshToken = jwt.sign(
        {
            userId: user?.[0]?.id,
            email: user?.[0]?.email,
            username: user?.[0]?.username,
            fullname: user?.[0]?.fullname,
            gender: user?.[0]?.gender,
            dob: user?.[0]?.dob,
        },
        process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION
    });
    return refreshToken;
}

// LOGIN 
export async function POST(request) {
    const { email, password } = await request.json();

    try {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [user] = await connection.query(
                "SELECT * FROM users WHERE email = ? AND password = ?",
                [email, password]
            );

            if (!user.length) {
                return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
            }

     const response  =  NextResponse.json(
            {
                message:"Login successful",
             user: user[0],
             success:true,
            }, 
            { status: 200 }
        );


            const refreshToken = createRefreshToken(user);
            const accessToken = createAccessToken(user);
            //   set token in cookie 
            response.cookies.set('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'lax',
                maxAge: ms(process.env.REFRESH_TOKEN_EXPIRATION)
            });
            response.cookies.set('accessToken', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'lax',
                maxAge: ms(process.env.ACCESS_TOKEN_EXPIRATION)
            });

            return response;
        } catch (error) {
            await connection.rollback();
            return NextResponse.json({ message: error.message }, { status: 401 });
        } finally {
            connection.release();
        }
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}