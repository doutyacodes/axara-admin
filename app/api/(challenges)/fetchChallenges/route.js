import { NextResponse } from "next/server";
import { db } from "@/utils";
import { CHALLENGES, CHALLENGE_OPTIONS, CHALLENGE_PROGRESS, CHALLENGE_QUESTIONS, CHILDREN } from "@/utils/schema";
import { authenticate } from "@/lib/jwtMiddleware";
import { and, eq, inArray, notIn } from "drizzle-orm"; // Using `notIn` to exclude challenges that are completed

export async function POST(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  // const userId = authResult.decoded_Data.id;
  const { age } = await req.json();

  if (!age) {
    return NextResponse.json({ error: "Age is required." }, { status: 400 });
  }

  console.log(age)

  try {
    // // Fetch challenges that match the user's age
    // const challenges = await db
    //   .select()
    //   .from(CHALLENGES)
    //   .where(eq(CHALLENGES.age, age)) // Filter by age
    //   .execute();

    // const challengesWithQuestions = await db
    //     .select({
    //       id: CHALLENGES.id,
    //       title: CHALLENGES.title,
    //       description: CHALLENGES.description,
    //       show_date: CHALLENGES.show_date,
    //       challenge_type: CHALLENGES.challenge_type,
    //       slug: CHALLENGES.slug,
    //       image: CHALLENGES.image,
    //       entry_fee: CHALLENGES.entry_fee,
    //       age: CHALLENGES.age,
    //       entry_type: CHALLENGES.entry_type,
    //       questions: db
    //         .select({
    //           question: CHALLENGE_QUESTIONS.question,
    //           id: CHALLENGE_QUESTIONS.id,
    //           options: db
    //             .select({
    //               option: CHALLENGE_OPTIONS.option,
    //             })
    //             .from(CHALLENGE_OPTIONS)
    //             .where(eq(CHALLENGE_OPTIONS.question_id, CHALLENGE_QUESTIONS.id)),
    //         })
    //         .from(CHALLENGE_QUESTIONS)
    //         .where(eq(CHALLENGE_QUESTIONS.challenge_id, CHALLENGES.id)),
    //     })
    //     .from(CHALLENGES)
    //     .where(eq(CHALLENGES.age, age)) // Filter by age
    //     .execute();
    //     console.log("age", challengesWithQuestions)

    // // Transforming data into desired format
    // const result = challengesWithQuestions.map((challenge) => ({
    //   id: challenge.challengeId,
    //   title: challenge.challengeTitle,
    //   description: challenge.description,
    //   show_date: challenge.show_date,
    //   challenge_type: challenge.challenge_type,
    //   slug: challenge.slug,
    //   image: challenge.image,
    //   entry_fee: challenge.entry_fee,
    //   age: challenge.age,
    //   entry_type: challenge.entry_type,
    //   questions: challenge.questions.map((q) => ({
    //     question: q.question,
    //     options: q.options.map((o) => o.option),
    //     correctOption: 0, // Replace with actual logic for determining the correct option index
    //   })),
    // }));

    // Step 1: Fetch challenges with their basic details
      const challenges = await db
      .select()
      .from(CHALLENGES)
      .where(eq(CHALLENGES.age, age))
      .execute();

      // Extract challenge IDs for fetching related questions
      const challengeIds = challenges.map((c) => c.id);

      // Step 2: Fetch questions for the relevant challenges
      const questions = await db
      .select()
      .from(CHALLENGE_QUESTIONS)
      .where(inArray(CHALLENGE_QUESTIONS.challenge_id, challengeIds))
      .execute();
      console.log("questions", questions);
      
      // Extract question IDs for fetching related options
      const questionIds = questions.map((q) => q.id);

      // Step 3: Fetch options for the relevant questions
      const options = await db
      .select()
      .from(CHALLENGE_OPTIONS)
      .where(inArray(CHALLENGE_OPTIONS.question_id, questionIds))
      .execute();

      

      // // Step 4: Assemble data into the desired format

      const questionsWithOptions = questions.map((q) => {
        // Get all options for the current question
        const filteredOptions = options.filter((o) => o.question_id === q.id);
      
        // Find the index of the correct option (where is_answer is true)
        const correctOptionIndex = filteredOptions.findIndex((o) => o.is_answer);
      
        // Assemble the question data
        return {
          question: q.question,
          id: q.id,
          challenge_id: q.challenge_id,
          options: filteredOptions.map((o) => o.option), // Extract only the option text
          correctOption: correctOptionIndex >= 0 ? correctOptionIndex : null, // If no correct option, set to null
        };
      });

      console.log("questionsWithOptions", questionsWithOptions);

      const challengesWithQuestions = challenges.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      show_date: c.show_date,
      challenge_type: c.challenge_type,
      slug: c.slug,
      image: c.image,
      entry_fee: c.entry_fee,
      age: c.age,
      entry_type: c.entry_type,
      questions: questionsWithOptions.filter((q) => q.challenge_id === c.id),
      }));

      // console.log(challengesWithQuestions);

    return NextResponse.json({
      challenges:challengesWithQuestions,
    });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenges." },
      { status: 500 }
    );
  }
}
