import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function getUserFromToken() {
    try {
        const cookieStore = await cookies();

        const accessToken = cookieStore.get("accessToken")?.value;

        if (!accessToken) {
            return null;
        }

        const decoded = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET
        );

        return decoded;
    } catch (error) {
        return null;
    }
}
