import { NextResponse } from "next/server";
import { db } from "@/utils";
import { authenticate } from "@/lib/jwtMiddleware";
import { USER_DETAILS  } from "@/utils/schema";

export async function GET(req) {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }
    try {
        // Fetch all users from USER_DETAILS, excluding password and updated_at
        const users = await db
          .select({
            id: USER_DETAILS.id,
            name: USER_DETAILS.name,
            username: USER_DETAILS.username,
            mobile: USER_DETAILS.mobile,
            createdAt: USER_DETAILS.created_at,
            isActive: USER_DETAILS.is_active,
          })
          .from(USER_DETAILS);
    
    return NextResponse.json({users}, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching users" },
      { status: 500 }
    );
  }
}
