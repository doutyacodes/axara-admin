import { authenticate } from "@/lib/jwtMiddleware";
import { db } from "@/utils";
import { MAP_NEWS } from "@/utils/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const { id } = params;
    
    // Update the news item to remove breaking news status
    await db.update(MAP_NEWS)
      .set({ 
        is_breaking: false,
        breaking_expire_at: null 
      })
      .where(eq(MAP_NEWS.id, parseInt(id)));

    return NextResponse.json({ message: "Breaking news removed successfully" });
  } catch (error) {
    console.error("Error removing breaking news:", error);
    return NextResponse.json(
      { message: "Error removing breaking news" },
      { status: 500 }
    );
  }
}