import { db } from "@/utils";
import { NEWS, NEWS_CATEGORIES, NEWS_QUESTIONS } from "@/utils/schema";
import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  try {
    // Parse the incoming data
    const { id: categoryId } = await req.json();
    if (!categoryId) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    // Step 1: Fetch all news IDs associated with the category
    const newsRecords = await db
      .select({ id: NEWS.id })
      .from(NEWS)
      .where(eq(NEWS.news_category_id, categoryId));

    const newsIds = newsRecords.map((record) => record.id);

    // Step 2: Delete related questions from NEWS_QUESTIONS
    if (newsIds.length > 0) {
      await db.delete(NEWS_QUESTIONS).where(inArray(NEWS_QUESTIONS.news_id, newsIds));
    }

    // Step 3: Delete news related to the category from NEWS
    await db.delete(NEWS).where(eq(NEWS.news_category_id, categoryId));

    // Step 4: Delete the category itself from NEWS_CATEGORIES
    await db.delete(NEWS_CATEGORIES).where(eq(NEWS_CATEGORIES.id, categoryId));

    // Return a success response
    return NextResponse.json({ message: "Category and related data deleted successfully." });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the category and its related data." },
      { status: 500 }
    );
  }
}
