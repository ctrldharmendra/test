import { NextResponse } from "next/server";
import db from "../../../../lib/db";
import { uploadImage } from "@/lib/upload";


export async function POST(request){
  let connection ;
  let uploadedImage = null;

  // const connection = await db.getConnection();
    // const {email, password, fullname, username, dob, gender, location_source, display_name, latitude, longitude} = await request.json();


    try {
    // 1. Read multipart/form-data
    const formData = await request.formData();


    const email = formData.get("email");
    const password = formData.get("password");
    const fullname = formData.get("fullname");
    const username = formData.get("username");
    const dob = formData.get("dob");
    const gender = formData.get("gender");


    // location table 
        const location_source = formData.get("location_source");
    const display_name = formData.get("display_name");
    const latitude = formData.get("latitude");
    const longitude = formData.get("longitude");


    // dp image 
    const profileImage = formData.get("dp");

        // 2. Basic validation
    if ( !email || !password || !fullname || !username || !dob || !gender || !latitude || !longitude) {return NextResponse.json({ message: "Required fields are missing", },{status: 400,});}

        // 3. Validate profile image
    if (!profileImage || !(profileImage instanceof File)) {return NextResponse.json({message: "Profile image is required",},{status: 400, });}

        // 4. Get database connection
       connection = await db.getConnection();
    await connection.beginTransaction();

        // 5. Upload image
    uploadedImage = await uploadImage(profileImage, { folder: "profiles", });

    // 6. INSERT IN TO USER TABLE 
        const [userResult] = await connection.execute(
      `
        INSERT INTO users
        (
          email,
          password,
          fullname,
          username,
          dob,
          gender,
          dp
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        email,
        password,
        fullname,
        username,
        dob,
        gender,
        uploadedImage.url,
      ]
    );
    //7. get userId
  const userId = userResult.insertId;

  // 8. INSERT IN TO LOCATION TABLE
      const [locationResult] = await connection.execute(
      `
        INSERT INTO user_locations
        (
          user_id,
          latitude,
          longitude,
          location_source,
          display_name
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        userId,
        latitude,
        longitude,
        location_source,
        display_name,
      ]
    );


    if (locationResult.affectedRows === 0) {
      throw new Error("Failed to create location");
    }

        // 8. Commit transaction
    await connection.commit();

  

// SEND RESPONSE 
    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: userId,
          email,
          username,
          fullname,
          profile_image: uploadedImage.url,
        },
      },
      {
        status: 201,
      }
    );
    } catch (error) {
    // Rollback database
    // ==================================================

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }

    console.error("Register error:", error);

    // Delete uploaded image if DB operation failed
    if (uploadedImage?.path) {
      try {
        const { unlink } = await import("fs/promises");

        await unlink(uploadedImage.path);
      } catch (deleteError) {
        console.error(
          "Failed to delete uploaded image:",
          deleteError
        );
      }
    }

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        {
          message: "User already exists",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        message: error.message || "Something went wrong",
      },
      {
        status: 500,
      }
    );
    }
     finally {
    if (connection) {
      connection.release();
    }
}
}