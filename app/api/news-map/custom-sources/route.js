import { CUSTOM_SOURCES, MAP_NEWS } from "@/utils/schema";
import { NextResponse } from "next/server";
import { eq, not } from "drizzle-orm";
import { db } from "@/utils";
import { authenticate } from "@/lib/jwtMiddleware";

// Add a new custom source
export async function POST(req) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.id;
    const userRole = userData.role;
    
    // Only superadmin and admin can add custom sources
    if (userRole !== "superadmin" && userRole !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized", message: "You don't have permission to add custom sources" },
        { status: 403 }
      );
    }
    
    const { name } = await req.json();
    
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Bad Request", message: "Source name is required" },
        { status: 400 }
      );
    }
    
    // Check if source name already exists
    const existingSource = await db
      .select({ id: CUSTOM_SOURCES.id })
      .from(CUSTOM_SOURCES)
      .where(eq(CUSTOM_SOURCES.name, name))
      .limit(1)
      .execute();
      
    if (existingSource.length > 0) {
      return NextResponse.json(
        { error: "Conflict", message: "This source name already exists" },
        { status: 409 }
      );
    }
    
    // Add new custom source
    const result = await db
      .insert(CUSTOM_SOURCES)
      .values({
        name,
        added_by: userId
      })
      .execute();
      
    return NextResponse.json({
      success: true,
      message: "Custom source added successfully"
    });
    
  } catch (error) {
    console.error("Error adding custom source:", error);
    return NextResponse.json(
      { error: "Server error", message: error.message },
      { status: 500 }
    );
  }
}

// Update an existing custom source
export async function PUT(req) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userRole = userData.role;
    
    // Only superadmin and admin can update custom sources
    if (userRole !== "superadmin" && userRole !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized", message: "You don't have permission to update custom sources" },
        { status: 403 }
      );
    }
    
    const { id, name } = await req.json();
    
    if (!id || !name || name.trim() === "") {
      return NextResponse.json(
        { error: "Bad Request", message: "Source ID and name are required" },
        { status: 400 }
      );
    }
    
    // Check if source name already exists (excluding the current one)
    const existingSource = await db
      .select({ id: CUSTOM_SOURCES.id })
      .from(CUSTOM_SOURCES)
      .where(eq(CUSTOM_SOURCES.name, name))
      .where(not(eq(CUSTOM_SOURCES.id, id)))
      .limit(1)
      .execute();
      
    if (existingSource.length > 0) {
      return NextResponse.json(
        { error: "Conflict", message: "This source name already exists" },
        { status: 409 }
      );
    }
    
    // Update custom source
    await db
      .update(CUSTOM_SOURCES)
      .set({ name })
      .where(eq(CUSTOM_SOURCES.id, id))
      .execute();
      
    return NextResponse.json({
      success: true,
      message: "Custom source updated successfully"
    });
    
  } catch (error) {
    console.error("Error updating custom source:", error);
    return NextResponse.json(
      { error: "Server error", message: error.message },
      { status: 500 }
    );
  }
}

// Delete a custom source
export async function DELETE(req) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userRole = userData.role;
    
    // Only superadmin and admin can delete custom sources
    if (userRole !== "superadmin" && userRole !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized", message: "You don't have permission to delete custom sources" },
        { status: 403 }
      );
    }
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "Bad Request", message: "Source ID is required" },
        { status: 400 }
      );
    }
    
    // Check if source is being used in any news
    const usedInNews = await db
      .select({ id: MAP_NEWS.id })
      .from(MAP_NEWS)
      .where(eq(MAP_NEWS.source_name, 
        db.select({ name: CUSTOM_SOURCES.name })
          .from(CUSTOM_SOURCES)
          .where(eq(CUSTOM_SOURCES.id, parseInt(id)))
          .limit(1)
      ))
      .limit(1)
      .execute();
      
    if (usedInNews.length > 0) {
      return NextResponse.json(
        { error: "Conflict", message: "This source is being used in news articles and cannot be deleted" },
        { status: 409 }
      );
    }
    
    // Delete custom source
    await db
      .delete(CUSTOM_SOURCES)
      .where(eq(CUSTOM_SOURCES.id, parseInt(id)))
      .execute();
      
    return NextResponse.json({
      success: true,
      message: "Custom source deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting custom source:", error);
    return NextResponse.json(
      { error: "Server error", message: error.message },
      { status: 500 }
    );
  }
}