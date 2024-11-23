import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/utils";
import { LEARN_DATAS } from "@/utils/schema";
import { format } from "date-fns";

// POST /api/create-test
export async function POST(req) {
  try {
    const body = await req.json();
    const { subjectId, grade, topic, description, testDate } = body;
    
    // Format the testDate to 'YYYY-MM-DD'
    const formattedTestDate = format(new Date(testDate), 'yyyy-MM-dd');

    // Step 1: Check for existing Topic
    const existingTest = await db
      .select()
      .from(LEARN_DATAS)
      .where(
        and(
            eq(LEARN_DATAS.learn_subject_id, subjectId),
            eq(LEARN_DATAS.show_date, formattedTestDate),
        )
    );

    console.log(existingTest);
    

    if (existingTest.length > 0) {
      return NextResponse.json(
        { message: "Test already exists for this subject and date." },
        { status: 400 }
      );
    }

    // Step 2: Insert into LEARN_DATAS
    await db
    .insert(LEARN_DATAS)
    .values({
        learn_subject_id: subjectId,
        show_date: formattedTestDate,
        topic,
        description,
    })

    // Return success response
    return NextResponse.json({
      message: "Topic data created successfully.",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating test:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
