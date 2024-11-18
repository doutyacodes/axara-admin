import { z } from "zod";
import { hash } from "bcryptjs";
import { USER_DETAILS, CHILDREN } from "@/utils/schema"; // Assuming CHILDREN schema is defined
import { db } from "@/utils";
import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import jwt from "jsonwebtoken"; // Import jwt

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Replace with your actual secret key

export async function POST(req) {
  try {
    const { name, username, password, mobile, children } = await req.json();

    // Validate the input (add validation if needed)

    // Check if username or mobile already exists in the database
    const existingUser = await db
      .select()
      .from(USER_DETAILS)
      .where(
        or(
          eq(USER_DETAILS.username, username),
          eq(USER_DETAILS.mobile, mobile)
        )
      )
      .limit(1)
      .execute();

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "Username or mobile already in use." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create new user record in the database
    const newUser = await db.insert(USER_DETAILS).values({
      name: name,
      username: username,
      password: hashedPassword,
      mobile: mobile,
    });

    // Insert children into the database
    for (const child of children) {
      const dob = new Date(child.age).toISOString().split('T')[0];
      await db.insert(CHILDREN).values({
        user_id: newUser[0].insertId, // Assuming CHILDREN has a user_id foreign key
        name: child.name,
        gender: child.gender,
        age: dob,
        grade: child.grade || null, // Add grade field (optional, defaulting to null if not provided)
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser[0].insertId, username: username }, // Include relevant user info in token
      JWT_SECRET,
      //{ expiresIn: '1h' } // Token expiration time
    );

    return NextResponse.json(
      { message: "User created successfully", user: newUser, token },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
