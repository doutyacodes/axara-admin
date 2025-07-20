import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import axios from "axios";
import { NEWS_CATEGORIES, PROMPT_HISTORY } from "@/utils/schema";
import { db } from "@/utils";
import { inArray, eq } from "drizzle-orm";

export async function POST(request) {
  const authResult = await authenticate(request, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const data = await request.json();
  const { title, description, categoryIds, viewpoints } = data;

  if (
    !title ||
    !description ||
    !Array.isArray(categoryIds) ||
    !Array.isArray(viewpoints)
  ) {
    return NextResponse.json(
      { error: "Missing required fields or invalid format." },
      { status: 400 }
    );
  }

  let promptHistoryId = null;

  try {
    // Fetch category names based on categoryIds
    const categories = await db
      .select()
      .from(NEWS_CATEGORIES)
      .where(inArray(NEWS_CATEGORIES.id, categoryIds));

    const prompt = `
      Based on the following news:
      Title: "${title}"
      Description: "${description}"

      Rewrite this news for the specified viewpoints: ${viewpoints.join(", ")}.
      Each viewpoint should have:
        1. A unique and engaging title tailored to that perspective.
        2. A rewritten description in the third person, composed of multiple paragraphs, following a structured news reporting format:
          - Provide a clear and concise summary of the news, highlighting the most important details.
          - Expand on the details, presenting background information, context, and relevant perspectives aligned with the specified viewpoint. Use an engaging tone while maintaining objectivity and cultural relevance.
          - Use the data provided in the input as the primary source, but if any details appear missing or incomplete, fill them in using your broader knowledge of the topic. Ensure these additions are minimal, relevant, and only included if necessary to enhance the description.
        3. Think like a journalist when crafting the description, ensuring the language and details reflect the style of professional reporting.
        4. Align the tone, focus, and language to suit the cultural, social, or contextual nuances of the viewpoint, ensuring relevance and resonance with the intended audience.
        5. Each description must contain approximately 2100 characters to ensure depth and detail.
        6. Maintain factual accuracy and objectivity throughout the description.

      Respond in JSON format:
      [
        {
          "viewpoint": "${viewpoints[0]}",
          "title": "<title for viewpoint 1>",
          "description": "<description for viewpoint 1>"
        },
        {
          "viewpoint": "${viewpoints[1]}",
          // Repeat for all specified viewpoints
        }
      ]
    `;;

    // 🔥 FIX: Create prompt history record WITHOUT .returning()
    const insertResult = await db
      .insert(PROMPT_HISTORY)
      .values({
        original_title: title,
        original_description: description,
        category_ids: categoryIds,
        viewpoints: viewpoints,
        prompt_text: prompt,
        processing_status: "pending",
        // Add created_by if you have admin ID from auth
        // created_by: authResult.adminId,
      });

    // Get the inserted ID from the result
    promptHistoryId = insertResult[0].insertId;

    // Alternative: If your Drizzle setup doesn't provide insertId, you might need to
    // query for the record manually after insertion using a unique field combination

    // Make OpenAI API call
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 3700,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let responseText = response.data.choices[0].message.content.trim();
    responseText = responseText.replace(/```json|```/g, "").trim();

    console.log("responseText", responseText);

    let parsedData;

    try {
      parsedData = JSON.parse(responseText);
      
      // Update record with SUCCESS
      if (promptHistoryId) {
        await db
          .update(PROMPT_HISTORY)
          .set({
            openai_response: responseText,
            parsed_results: parsedData,
            processing_status: "completed",
            error_message: null,
          })
          .where(eq(PROMPT_HISTORY.id, promptHistoryId));
      }

    } catch (parseError) {
      // Update record with PARSE ERROR
      if (promptHistoryId) {
        await db
          .update(PROMPT_HISTORY)
          .set({
            openai_response: responseText,
            processing_status: "failed",
            error_message: `Failed to parse OpenAI response: ${parseError.message}`,
          })
          .where(eq(PROMPT_HISTORY.id, promptHistoryId));
      }

      throw new Error("Failed to parse response data");
    }

    return NextResponse.json(
      {
        results: parsedData,
        originalData: data,
        originalDataId: promptHistoryId,
        testId:1
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error processing OpenAI API:", error);

    // Update record with GENERAL ERROR if we have an ID
    if (promptHistoryId) {
      try {
        await db
          .update(PROMPT_HISTORY)
          .set({
            processing_status: "failed",
            error_message: error.message,
          })
          .where(eq(PROMPT_HISTORY.id, promptHistoryId));
      } catch (dbError) {
        console.error("Failed to update prompt history with error:", dbError);
      }
    }

    return NextResponse.json(
      { error: "Failed to process the request", details: error.message },
      { status: 500 }
    );
  }
}