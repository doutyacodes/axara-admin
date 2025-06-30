import { db } from "@/utils";
import { MAP_NEWS } from "@/utils/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { is_breaking } = body;

    // Validate the ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { message: "Invalid news ID" },
        { status: 400 }
      );
    }

    // Validate the request body
    if (typeof is_breaking !== 'boolean') {
      return NextResponse.json(
        { message: "is_breaking must be a boolean value" },
        { status: 400 }
      );
    }

    // Update the news item
    const updateData = {
      is_breaking: is_breaking,
    };

    // If removing from breaking news, also clear the expiry time
    if (!is_breaking) {
      updateData.breaking_expire_at = null;
    }

    const result = await db
      .update(MAP_NEWS)
      .set(updateData)
      .where(eq(MAP_NEWS.id, parseInt(id)));

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "News item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: is_breaking 
          ? "News item marked as breaking news" 
          : "News item removed from breaking news",
        success: true 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating breaking news:", error);
    return NextResponse.json(
      { message: "Error updating breaking news", details: error.message },
      { status: 500 }
    );
  }
}