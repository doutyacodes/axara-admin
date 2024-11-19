import axios from 'axios';
import { db } from "@/utils"; // Ensure this path is correct
import {
    MILESTONES,
    USER_MILESTONES,
    MILESTONE_CATEGORIES,
    USER_CAREER_STATUS,
    CERTIFICATIONS,
    MILESTONE_SUBCATEGORIES
} from "@/utils/schema"; // Ensure this path is correct
import { and, eq } from "drizzle-orm";


export async function GenerateNews(userCareerID, age, education, careerGroupID, career, type1, type2,language) {
    console.log("userCareerID:",userCareerID, "age:",age, "education:",education, "career:",career, "type1:",type1, "type2:",type2);
    try {
        const prompt = `Provide detailed information for the career named "${career}" based on the following criteria:
        - Personality Type: ${type1}
        - RIASEC Interest Types: ${type2}
        
        For this career, include the following information:
        - career_name: A brief title of the career.
        - reason_for_recommendation: Why this career is suitable for someone with these interests.
        - present_trends: Current trends and opportunities in the field.
        - future_prospects: Predictions and potential growth in this career.
        - user_description: A narrative description of the personality traits, strengths, and preferences of the user that make this career a good fit, written in full-text format.
        - roadmap: Create a step-by-step roadmap containing academics, extracurricular activities, and other activities for a ${age}-year-old until the age of ${age + 1}-year-old aspiring to be a ${career}. The education level is '${education}'. 
        
        The roadmap should be broken down into **intervals of every 6 months** (i.e., ${age}, ${age + 0.5}, ${age + 1}), and milestones must be provided for **each 6-month interval**. Ensure that each interval includes:

        1. Educational Milestones (divided into **Academic Milestones** and **Certification Milestones**)
        2. Physical Milestones
        3. Mental Milestones

        Each of the **Educational**, **Physical**, and **Mental Milestones** should have **at least three milestones**. If you have more milestones, please include them as well. Each milestone should be separated with a '|' symbol.

        The **Educational Milestones** should include:
        - **Academic Milestones**: These should include formal education achievements (e.g., university, college) and any certifications from private or official organizations tied to the career (such as industry-standard certifications).
        - **Certification Milestones**: These should be general certifications relevant to the career named "${career}", and **must not be tied to private companies, organizations, or vendors like CompTIA, Microsoft, etc..**. Only include the name of the course (do not include the platform or organization offering the course).

        Each milestone should be structured as follows:
        {
          "age": <age>,
          "milestones": {
            "Educational Milestones": {
              "Academic Milestones": "<milestone1> | <milestone2> | <milestone3> | ...",
              "Certification Milestones": [
                {
                  "milestone_description": "<description1>",
                  "certification_course_name": "<certification_name1>"
                },
                {
                  "milestone_description": "<description2>",
                  "certification_course_name": "<certification_name2>"
                },
                {
                  "milestone_description": "<description3>",
                  "certification_course_name": "<certification_name3>"
                }
              ]
            },
            "Physical Milestones": "<milestone1> | <milestone2> | <milestone3> | ...",
            "Mental Milestones": "<milestone1> | <milestone2> | <milestone3> | ..."
          }
        }

        Ensure that the response is valid JSON, using the specified field names. Provide the response ${languageOptions[language] || 'in English'}.`;


        
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

        // const milestonesForFrontend = [];
        // return milestonesForFrontend ;

        try {

            /* Savin into Db part */

        } catch (error) {
            console.error("Error processing milestones data:", error)

            throw new Error("Error processing milestones data:", error);
        }
    } catch (error) {
        console.error("Error fetching or saving roadmap:", error);
        throw error; // Rethrow the error to be caught by the caller
    }
}
