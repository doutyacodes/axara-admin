import { db } from "@/utils";
import { MAP_NEWS_CATEGORIES } from "@/utils/schema";
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import { asc } from "drizzle-orm";

export async function GET(req) {
  // Authenticate user
  // const authResult = await authenticate(req);
  // if (!authResult.authenticated) {
  //   return authResult.response;
  // }

  try {
    // Fetch all categories
    const categories = await db
      .select()
      .from(MAP_NEWS_CATEGORIES)
      .orderBy(asc(MAP_NEWS_CATEGORIES.name));

    // Send the categories as a JSON response
    return NextResponse.json(
      { categories },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { message: "Error fetching categories", details: error.message },
      { status: 500 }
    );
  }
}