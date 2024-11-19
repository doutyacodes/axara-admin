import { authenticate } from '@/lib/jwtMiddleware';
import { db } from '@/utils';
import { NEWS_CATEGORIES } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Authenticate the user
    const authResult = await authenticate(req, true);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    // Parse the incoming data
    const { name } = await req.json();

    // Validate the input
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { message: 'Invalid category name' },
        { status: 400 }
      );
    }

    // Capitalize the first letter of each word
    const formattedName = name
      .split(' ') // Split by spaces
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
      .join(' '); // Join back to a single string

    // Check if the category already exists
    const existingCategory = await db
      .select()
      .from(NEWS_CATEGORIES)
      .where(eq(NEWS_CATEGORIES.name, formattedName));

    if (existingCategory.length > 0) {
      return NextResponse.json(
        {
          message: 'Category already exists',
          category: existingCategory[0], // Return the existing category
        },
        { status: 409 }
      );
    }

    // Save to the database
    await db.insert(NEWS_CATEGORIES).values({
      name: formattedName,
    });

    // Respond with success
    return NextResponse.json(
      {
        message: 'Category saved successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving category:', error);
    return NextResponse.json(
      { message: 'Error saving category', details: error.message },
      { status: 500 }
    );
  }
}
