import authenticateAccessToken from "@/lib/authenticateAccessToken";
import { getUserFromToken } from "@/lib/getUserFromToken";
import db from "../../../lib/db";
import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/upload";




// create post 
export async function POST(request) {
  const auth = await authenticateAccessToken(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  let uploadedImage = null;

  try {
    const loggedInUser = await getUserFromToken();
    const loggedInUserId = loggedInUser?.userId;

    if (!loggedInUserId) {
      return NextResponse.json(
        { success: false, message: "Unable to identify logged-in user" },
        { status: 401 }
      );
    }

    // READ FORM DATA

    const formData = await request.formData();
    const caption = (formData.get("caption") || "").toString().trim();
    const image = formData.get("image"); // may be null for text-only post

    // VALIDATION: must have at least caption OR image

    const hasImage = image instanceof File && image.size > 0;

    if (!caption && !hasImage) {
      return NextResponse.json(
        { success: false, message: "Post must have text or an image" },
        { status: 400 }
      );
    }

    // UPLOAD IMAGE (if provided)

    let imageUrl = null;

    if (hasImage) {
      uploadedImage = await uploadImage(image, { folder: "posts" });
      imageUrl = uploadedImage.url;
    }

    // INSERT POST
    const [result] = await db.execute(
      `
        INSERT INTO posts (user_id, caption, image_url)
        VALUES (?, ?, ?)
      `,
      [loggedInUserId, caption || null, imageUrl]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Post created successfully",
        post: {
          id: result.insertId,
          userId: loggedInUserId,
          caption: caption || null,
          username: loggedInUser.username,
          imageUrl,
          likeCount: 0,
          likedByMe: false,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create post error:", error);

    // cleanup uploaded file if DB insert failed
    if (uploadedImage?.path) {
      try {
        const { unlink } = await import("fs/promises");
        await unlink(uploadedImage.path);
      } catch (deleteError) {
        console.error("Failed to delete uploaded image:", deleteError);
      }
    }

    return NextResponse.json(
      { success: false, message: error.message || "Failed to create post" },
      { status: 500 }
    );
  }
}


// get post 
// export async function GET(request) {
//   const auth = await authenticateAccessToken(request);
//   if (auth.error) {
//     return NextResponse.json(
//       { success: false, message: auth.error },
//       { status: auth.status }
//     );
//   }

//   try {
//     const loggedInUser = await getUserFromToken();
//     const loggedInUserId = loggedInUser?.userId;

//     const { searchParams } = new URL(request.url);
//     const page = Math.max(1, Number(searchParams.get("page")) || 1);
//     const limit = Math.min(50, Number(searchParams.get("limit")) || 10);
//     const offset = (page - 1) * limit;

//     const [posts] = await db.execute(
//       `
//         SELECT
//           p.id,
//           p.user_id,
//           p.caption,
//           p.image_url,
//           p.created_at,

//           u.username,
//           u.fullname,
//           u.dp,

//           COUNT(DISTINCT pl.id) AS like_count,

//           MAX(CASE WHEN pl.user_id = ? THEN 1 ELSE 0 END) AS liked_by_me

//         FROM posts p
//         INNER JOIN users u ON u.id = p.user_id
//         LEFT JOIN post_likes pl ON pl.post_id = p.id

//         GROUP BY p.id
//         ORDER BY p.created_at DESC
//         LIMIT ? OFFSET ?
//       `,
//       [loggedInUserId, limit, offset]
//     );

//     const formattedPosts = posts.map((post) => ({
//       id: post.id,
//       caption: post.caption,
//       imageUrl: post.image_url,
//       createdAt: post.created_at,
//       likeCount: Number(post.like_count),
//       likedByMe: Boolean(post.liked_by_me),
//       user: {
//         id: post.user_id,
//         username: post.username,
//         fullName: post.fullname,
//         image: post.dp,
//       },
//     }));

//     return NextResponse.json(
//       { success: true, page, count: formattedPosts.length, posts: formattedPosts },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Get posts error:", error);
//     return NextResponse.json(
//       { success: false, message: error.message || "Failed to load posts" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(request) {
  const auth = await authenticateAccessToken(request);
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  try {
    const loggedInUser = await getUserFromToken();
    const loggedInUserId = loggedInUser?.userId;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Number(searchParams.get("limit")) || 10);

    // cursor = created_at of the last post the client already has
    // null/absent = first page (most recent posts)
    const cursor = searchParams.get("cursor");

    let query = `
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
        MAX(CASE WHEN pl.user_id = ? THEN 1 ELSE 0 END) AS liked_by_me

      FROM posts p
      INNER JOIN users u ON u.id = p.user_id
      LEFT JOIN post_likes pl ON pl.post_id = p.id
    `;

    const queryParams = [loggedInUserId];

    if (cursor) {
      query += ` WHERE p.created_at < ? `;
      queryParams.push(cursor);
    }

    query += `
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ?
    `;
    queryParams.push(limit);

    const [posts] = await db.execute(query, queryParams);

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      caption: post.caption,
      imageUrl: post.image_url,
      createdAt: post.created_at,
      likeCount: Number(post.like_count),
      likedByMe: Boolean(post.liked_by_me),
      isOnline: global.onlineUsers?.has(post?.user_id) ?? false,
      user: {
        id: post.user_id,
        username: post.username,
        fullName: post.fullname,
        image: post.dp,
      },
    }));

    // the cursor for the NEXT page is the created_at of the last post here
    const nextCursor =
      formattedPosts.length > 0
        ? formattedPosts[formattedPosts.length - 1].createdAt
        : null;

    // if we got fewer posts than requested, there's nothing more to load
    const hasMore = formattedPosts.length === limit;

    return NextResponse.json(
      {
        success: true,
        count: formattedPosts.length,
        posts: formattedPosts,
        nextCursor,
        hasMore,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load posts" },
      { status: 500 }
    );
  }
}
