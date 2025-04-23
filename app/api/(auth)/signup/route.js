import { hash } from "bcryptjs";
import { ADMIN_DETAILS } from "@/utils/schema";
import { db } from "@/utils";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export async function POST(req) {
  try {
    const { name, username, password } = await req.json();

    // Check if username already exists
    const existingUser = await db
      .select({ id: ADMIN_DETAILS.id })
      .from(ADMIN_DETAILS)
      .where(eq(ADMIN_DETAILS.username, username))
      .limit(1)
      .execute();

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "Username already taken. Please choose another username." },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create new admin user
    const newAdmin = await db
      .insert(ADMIN_DETAILS)
      .values({
        name,
        username,
        password: hashedPassword,
        role: "admin", // Default as specified
        is_active: true, // Default as specified
      })
      .execute();

    // Fetch the newly created user
    const createdAdmin = await db
      .select({ id: ADMIN_DETAILS.id, username: ADMIN_DETAILS.username })
      .from(ADMIN_DETAILS)
      .where(eq(ADMIN_DETAILS.username, username))
      .limit(1)
      .execute();

    // Generate JWT token
    const token = jwt.sign(
      { id: createdAdmin[0].id, username: createdAdmin[0].username },
      JWT_SECRET
    );

    return NextResponse.json(
      { 
        message: "Account created successfully", 
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}