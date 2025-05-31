import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import SFTPClient from "ssh2-sftp-client";
import { ADULT_NEWS, ADULT_NEWS_TO_CATEGORIES, NEWS, NEWS_TO_CATEGORIES } from "@/utils/schema";
import { authenticate } from "@/lib/jwtMiddleware";
import os from "os";
import { db } from "@/utils";
import { eq } from "drizzle-orm";

export async function POST(request) {
  const authResult = await authenticate(request, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }
  const userData = authResult.decoded_Data;
  const userId = userData.id;

  const {
    id,
    categoryId,
    title,
    description,
    showOnTop,
    image,
    // isImageEdited,
    // oldImage,
    fileName,
    main_news,
    regionId,
  } = await request.json();

  // Define the local temp directory dynamically based on platform
  const localTempDir = os.tmpdir();

  try {
    // Step 1: Update the news fields in the NEWS table
    await db
      .update(ADULT_NEWS)
      .set({
        title,
        description,
        show_on_top: showOnTop,
        image_url: fileName,
      })
      .where(eq(ADULT_NEWS.id, id));

    // Step 2: Remove existing category mappings for this news ID in NEWS_TO_CATEGORIES
    await db
      .delete(ADULT_NEWS_TO_CATEGORIES)
      .where(eq(ADULT_NEWS_TO_CATEGORIES.news_id, id));

    // Step 3: Insert new category mappings into ADULT_NEWS_TO_CATEGORIES
    if (Array.isArray(categoryId) && categoryId.length > 0) {
      const newMappings = categoryId.map((catId) => ({
        news_id: id,
        news_category_id: catId,
        region_id: regionId,
      }));

      await db.insert(ADULT_NEWS_TO_CATEGORIES).values(newMappings);
    }

    return NextResponse.json(
      {
        message: "News updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating news:", error);

    return NextResponse.json(
      {
        error: "Failed to update news",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
