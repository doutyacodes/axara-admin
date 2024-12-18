import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import axios from 'axios';
import { NEWS_CATEGORIES } from '@/utils/schema';
import { db } from '@/utils';
import { inArray } from 'drizzle-orm';

export async function POST(request) {
  const authResult = await authenticate(request, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const data = await request.json();

  const { title, description, categoryIds, viewpoints } = data;

  if (!title || !description || !Array.isArray(categoryIds) || !Array.isArray(viewpoints)) {
    return NextResponse.json(
      { error: 'Missing required fields or invalid format.' },
      { status: 400 }
    );
  }

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
        2. A rewritten description that aligns with the cultural, social, or contextual relevance of the specified viewpoint.

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
    `;

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
    } catch (error) {
      throw new Error("Failed to parse response data");
    }

    return NextResponse.json({ results: parsedData, originalData: data }, { status: 200 });
  } catch (error) {
    console.error('Error processing OpenAI API:', error);
    return NextResponse.json(
      { error: 'Failed to process the request', details: error.message },
      { status: 500 }
    );
  }
}
