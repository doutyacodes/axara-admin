import { NextResponse } from "next/server";
import { and, eq, gte, lte, or } from "drizzle-orm";
import { db } from "@/utils";
import { LEARN_DATAS, LEARN_TESTS, OPTIONS2, QUESTIONS } from "@/utils/schema";
import { format } from "date-fns";

// POST /api/create-test
export async function POST(req) {
  try {
    const body = await req.json();
    const { subjectId, questions, startDate, endDate } = body;

    // Format the start and end dates to 'YYYY-MM-DD'
    const formattedStartDate = format(new Date(startDate), "yyyy-MM-dd");
    const formattedEndDate = format(new Date(endDate), "yyyy-MM-dd");

    // Step 1: Check for existing test
     // Check for overlapping tests
     const overlappingTests = await db
     .select()
     .from(LEARN_TESTS)
     .where(
       and(
         eq(LEARN_TESTS.learn_subject_id, subjectId),
         or(
           and(
             lte(LEARN_TESTS.start_date, formattedEndDate), // Start date is before or on the new end date
             gte(LEARN_TESTS.end_date, formattedStartDate) // End date is after or on the new start date
           ),
           and(
             lte(LEARN_TESTS.start_date, formattedStartDate), // New start date is within an existing range
             gte(LEARN_TESTS.end_date, formattedEndDate) // New end date is within an existing range
           )
         )
       )
     );

     if (overlappingTests.length > 0) {
      // Extract overlapping ranges
      // const overlappingRanges = overlappingTests.map(
      //   (test) => `(${test.start_date} to ${test.end_date})`
      // );
      const dateRange = overlappingTests.map(
        (test) => `(${format(new Date(test.start_date), "EEE MMM dd yyyy")} to ${format(new Date(test.end_date), "EEE MMM dd yyyy")})`
      );

      return NextResponse.json(
        {
          message: "Test already exists for this subject in the given date range.",
          dateRange,
        },
        { status: 400 }
      );
    }

    // Insert into LEARN_TESTS
    const testRecord = await db
      .insert(LEARN_TESTS)
      .values({
        learn_subject_id: subjectId,
        // show_date: formattedTestDate,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
      })

    const testId = testRecord[0].insertId;

  // Insert Questions and Options
  for (const question of questions) {
    const questionRecord = await db
      .insert(QUESTIONS)
      .values({
        learn_test_id: testId, 
        question_text: question.question,
        type: "text", 
      })

    const questionId = questionRecord[0].insertId;

    // Insert options for each question
    for (const option of question.options) {
      await db.insert(OPTIONS2).values({
        question_id: questionId,
        learn_test_id: testId,
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
