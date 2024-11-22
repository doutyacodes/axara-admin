import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/utils";
import { LEARN_DATAS, LEARN_TESTS, OPTIONS2, QUESTIONS } from "@/utils/schema";
import { format } from "date-fns";

// POST /api/create-test
export async function POST(req) {
  try {
    const body = await req.json();
    const { subjectId, grade, topic, description, testDate, questions } = body;

    // Format the testDate to 'YYYY-MM-DD'
    const formattedTestDate = format(new Date(testDate), 'yyyy-MM-dd');

    // Step 1: Check for existing test
    const existingTest = await db
      .select()
      .from(LEARN_TESTS)
      .where(
        and(
            eq(LEARN_TESTS.learn_subject_id, subjectId),
            eq(LEARN_TESTS.show_date, formattedTestDate),
        )
    );

    console.log(existingTest);
    

    if (existingTest.length > 0) {
      return NextResponse.json(
        { message: "Test already exists for this subject and date." },
        { status: 400 }
      );
    }

    // Step 2: Insert into LEARN_TESTS
    const testRecord = await db
      .insert(LEARN_TESTS)
      .values({
        learn_subject_id: subjectId,
        show_date: formattedTestDate,
      })

    // Step 3: Insert into LEARN_DATAS
    const learnDataRecord = await db
      .insert(LEARN_DATAS)
      .values({
        learn_subject_id: subjectId,
        topic,
        description,
      })

    // Step 4: Insert Questions and Options
    for (const question of questions) {
      const questionRecord = await db
        .insert(QUESTIONS)
        .values({
          learn_topic_id: subjectId, // Link to the correct subject
          question_text: question.question,
          type: "text", // As per the requirement
        })

      const questionId = questionRecord[0].id;

      // Insert options for each question
      for (const option of question.options) {
        await db.insert(OPTIONS2).values({
          question_id: questionId,
          learn_topic_id: subjectId, // Redundant but requested
          option_text: option.text,
          is_answer: option.isCorrect,
        });
      }
    }

    // Return success response
    return NextResponse.json({
      message: "Test, learn data, and questions created successfully.",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating test:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
