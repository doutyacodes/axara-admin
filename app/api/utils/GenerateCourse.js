import axios from 'axios';
import { db } from "@/utils"; // Ensure this path is correct
import {
    CERTIFICATIONS,
    CERTIFICATION_QUIZ,
    CERTIFICATION_QUIZ_OPTIONS,
    COURSE_WEEKS,
    TOPICS_COVERED,
    ASSIGNMENTS,
    LEARNING_OUTCOMES,
    COURSE_OVERVIEW
} from "@/utils/schema"; // Ensure this path is correct
import { and, eq } from "drizzle-orm";


export async function GenerateCourse(age, course, career, courseId ) {

    try {
        
        const prompt = `
            Generate a detailed course for the career "${career}" with the course titled "${course}". The course should be designed for a user aged ${age}. Include a full course structure for a 3-week certifiable course. Each week should include topics covered, assignments, and learning outcomes.

            For each week, include:
            1. **Topics Covered:** Provide the specific topics that will be taught each week, as an array of strings.
            2. **Assignments:** Include the practical assignments or tasks students need to complete by the end of the week, as an array of strings.
            3. **Learning Outcomes:** Describe the key skills and knowledge the user will gain after completing the week, as an array of strings.

            - **Prerequisites:** Provide prerequisites or recommended background knowledge as an array of strings.
            - **Skills Acquired:** Provide skills students will develop as an array of strings.
            - **Real-World Applications:** Provide real-world applications as an array of strings, showing how the acquired skills apply in a professional context.

            ### Course Structure:
            Use the following structure for the course, ensuring consistency in output:

            "course_structure": {
                "Week 1": {
                    "Topics Covered": [
                        "Topic 1",
                        "Topic 2",
                        "Topic 3"
                    ],
                    "Assignments": [
                        "Assignment 1",
                        "Assignment 2"
                    ],
                    "Learning Outcomes": [
                        "Outcome 1",
                        "Outcome 2"
                    ]
                },
                "Week 2": {
                    "Topics Covered": [
                        "Topic 4",
                        "Topic 5",
                        "Topic 6"
                    ],
                    "Assignments": [
                        "Assignment 3",
                        "Assignment 4"
                    ],
                    "Learning Outcomes": [
                        "Outcome 3",
                        "Outcome 4"
                    ]
                },
                "Week 3": {
                    "Topics Covered": [
                        "Topic 7",
                        "Topic 8",
                        "Topic 9"
                    ],
                    "Assignments": [
                        "Assignment 5",
                        "Assignment 6"
                    ],
                    "Learning Outcomes": [
                        "Outcome 5",
                        "Outcome 6"
                    ]
                }
            }

            ### final_quiz:
            key name should be(final_quiz)
            For the quiz, provide 20 questions covering key concepts and skills from the course.
            For each question, provide exactly 4 answer options. Only one option should be marked as the correct answer using "is_answer": "yes" and the others should be marked with "is_answer": "no."
            Return all questions in a single JSON array, with each question following this format:

            {
                "question": "Your question text",
                "options": [
                    { "text": "Option 1", "is_answer": "no" },
                    { "text": "Option 2", "is_answer": "yes" },
                    { "text": "Option 3", "is_answer": "no" },
                    { "text": "Option 4", "is_answer": "no" }
                ]
            }

            Make sure there are exactly 20 questions, no more and no less, and that none of the questions or answer options are repeated.

            Ensure that the response is valid JSON, using the specified field names.
        `;


        
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini", 
                messages: [{ role: "user", content: prompt }],
                max_tokens: 5000,
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
        console.log("responseText", responseText)
        let parsedData;

        try {
            parsedData = JSON.parse(responseText);
        } catch (error) {
            throw new Error("Failed to parse response data");
        }


        // . Insert course overview
        await db.insert(COURSE_OVERVIEW).values({
            certification_id: courseId,
            prerequisite_description: parsedData.prerequisites,
            skill_description: parsedData.skills_acquired,
            application_description: parsedData.real_world_applications
        });

        // 3. Process course structure for each week
        for (let weekNum = 1; weekNum <= 3; weekNum++) {
            const weekKey = `Week ${weekNum}`;
            const weekData = parsedData.course_structure[weekKey];

            // Get week ID (assuming weeks 1-3 are pre-defined)
            const [weekResult] = await db
                .select({ id: COURSE_WEEKS.id })
                .from(COURSE_WEEKS)
                .where(eq(COURSE_WEEKS.week_number, weekNum));

            const weekId = weekResult.id;

            // Insert topics
            for (const topic of weekData["Topics Covered"]) {
                await db.insert(TOPICS_COVERED).values({
                    week_id: weekId,
                    certification_id: courseId,
                    topic_name: topic
                });
            }

            // Insert assignments
            for (const assignment of weekData.Assignments) {
                await db.insert(ASSIGNMENTS).values({
                    week_id: weekId,
                    certification_id: courseId,
                    assignment_description: assignment
                });
            }

            // Insert learning outcomes
            for (const outcome of weekData["Learning Outcomes"]) {
                await db.insert(LEARNING_OUTCOMES).values({
                    week_id: weekId,
                    certification_id: courseId,
                    outcome_description: outcome
                });
            }
        }

        // 4. Process quiz questions and options
        for (const questionData of parsedData.final_quiz) {
            // Insert question
            const questionInsert = await db.insert(CERTIFICATION_QUIZ).values({
                question: questionData.question,
                certification_id: courseId,
                age: age
            });

            const questionId = questionInsert[0].insertId;

            // Insert options for each question
            for (const option of questionData.options) {
                await db.insert(CERTIFICATION_QUIZ_OPTIONS).values({
                    question_id: questionId,
                    option_text: option.text,
                    is_answer: option.is_answer
                });
            }
        }

        return { success: true, message: "Course generated and saved successfully" };

    } catch (error) {
        console.error("Error in GenerateCourse:", error);
        throw new Error(`Failed to generate course: ${error.message}`);
    }
}
