// app/api/login/route.js
import { compare } from "bcryptjs";
import { ADMIN_DETAILS, USER_DETAILS } from "@/utils/schema";
import { db } from "@/utils";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    // Fetch admin from the database by username
    const adminCheck = await db
      .select()
      .from(ADMIN_DETAILS)
      .where(eq(ADMIN_DETAILS.username, username))
      .limit(1)
      .execute();

    const admin = adminCheck[0];
    if (!admin) {
      return NextResponse.json(
        { message: "Invalid username or password." },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await compare(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid username or password." },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      JWT_SECRET,
    );

    const response = NextResponse.json(
      {
        token,
        message: "Login successful",
      },
      { status: 200 }
    );

    response.cookies.set("auth_token", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response;

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
