
import { NextResponse } from "next/server";
import authenticateAccessToken from "@/lib/authenticateAccessToken";
import db from "@/lib/db";
import { getUserFromToken } from "@/lib/getUserFromToken";

// Get particular post by ID
export async function GET(request, { params }) {
  const auth = await authenticateAccessToken(request);

  if (auth.error) {
    return NextResponse.json(
      {
        success: false,
        message: auth.error,
      },
      {
        status: auth.status,
      }
    );
  }

  const { id } = await params;

  try {
    const loggedInUser = await getUserFromToken();
    const loggedInUserId = loggedInUser?.userId;

    const [posts] = await db.execute(
      `
        SELECT
          p.id,
          p.user_id,
          p.caption,
          p.image_url,
          p.created_at,

          u.username,
          u.fullname,
          u.dp,

          COUNT(DISTINCT pl.id) AS like_count,

          MAX(
            CASE
              WHEN pl.user_id = ? THEN 1
              ELSE 0
            END
          ) AS liked_by_me

        FROM posts p

        INNER JOIN users u
          ON u.id = p.user_id

        LEFT JOIN post_likes pl
          ON pl.post_id = p.id

        WHERE p.id = ?

        GROUP BY
          p.id,
          p.user_id,
          p.caption,
          p.image_url,
          p.created_at,
          u.username,
          u.fullname,
          u.dp

        LIMIT 1
      `,
      [
        loggedInUserId,
        id,
      ]
    );


    // Post not found
    if (posts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Post not found",
        },
        {
          status: 404,
        }
      );
    }

// GET THE TOTAL USER WHO LIKED THE POST | USERNAME 
 const [totalLikedUsers] = await db.execute(
      `
        SELECT u.id, username, dp
        FROM users u 
        INNER JOIN post_likes pl ON pl.user_id = u.id
        WHERE pl.post_id = ?
        GROUP BY u.id
        ORDER BY u.id DESC
      `,
      [id]
    )

    // GET THE TOTAL USER WHO LIKED THE POST | FULLNAME


    const post = posts[0];

    const formattedPost = {
      id: post.id,
      caption: post.caption,
      imageUrl: post.image_url,
      createdAt: post.created_at,

      likeCount: Number(post.like_count),

      likedByMe: Boolean(post.liked_by_me),

      user: {
        id: post.user_id,
        username: post.username,
        fullName: post.fullname,
        image: post.dp,
      },
    };

    return NextResponse.json(
      {
        success: true,
        post: formattedPost,
        totalLikedUsers: totalLikedUsers,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Get particular post error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to load post",
      },
      {
        status: 500,
      }
    );
  }
}

