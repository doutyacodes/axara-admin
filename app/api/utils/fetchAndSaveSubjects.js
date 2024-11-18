// fetchAndSaveSubjects.js

import { db } from "@/utils";
import { CAREER_SUBJECTS, SUBJECTS } from "@/utils/schema";
import axios from "axios";
import { and, eq, inArray } from "drizzle-orm";

export const maxDuration = 60; // This function can run for a maximum of 5 seconds
export const dynamic = "force-dynamic";

// Function to fetch subjects from OpenAI
const fetchSubjectsFromOpenAI = async (careerName, country, age) => {
  console.log("careerName, country", careerName, country, age);
  const prompt = `For an individual aged ${age} pursuing a career in ${careerName}, identify the most essential academic subjects that provide a solid foundation for this career. Focus specifically on subjects directly related to ${careerName}, considering the educational standards of ${country}. The subjects should be suitable for multiple-choice questions (MCQs) and not merely general foundational subjects.

Provide at least 5 to 10 key subjects relevant for this age, formatted as a JSON object where each age is a key, and the value is an array of important subjects. The format should be as follows:

{
  "subject-data": ["Subject1", "Subject2", "Subject3", ...]
}

Ensure each array includes only the most relevant subjects for the respective age, considering the career's requirements. Focus on subjects that pertain to theoretical knowledge, fundamental concepts, or history, while excluding practical or subjective areas unsuitable for MCQs.`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500, // Adjust the token limit as needed
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Extract response text
    let responseText = response.data.choices[0].message.content.trim();
    responseText = responseText.replace(/```json|```/g, "").trim();
    console.log("responseText:", responseText);

    const subjectsByAge = JSON.parse(responseText);

    console.log("Parsed subjects by age:", subjectsByAge);
    return subjectsByAge;
  } catch (error) {
    console.error("Error fetching subjects from OpenAI:", error);
    throw error;
  }
};

const saveSubjectsToDatabase = async (careerId, subjectsByAge, age) => {
    try {
      const subjectIds = new Map();
  
      for (const [ageGroup, subjects] of Object.entries(subjectsByAge)) {
        const minAge = age; 
        const maxAge = age;
  
        // Ensure subjects is always an array
        const subjectList = Array.isArray(subjects) ? subjects : [subjects];
  
        // Fetch existing subjects for the given age range
        const existingSubjects = await db
          .select({
            subject_name: SUBJECTS.subject_name,
            subject_id: SUBJECTS.subject_id,
          })
          .from(SUBJECTS)
          .where(
            and(
              inArray(SUBJECTS.subject_name, subjectList), // Ensure subjectList is an array
              eq(SUBJECTS.min_age, minAge),
              eq(SUBJECTS.max_age, maxAge)
            )
          );
  
        const existingSubjectNames = new Set(
          existingSubjects.map((subject) => subject.subject_name)
        );
        const existingSubjectMap = new Map(
          existingSubjects.map((subject) => [
            subject.subject_name,
            subject.subject_id,
          ])
        );
  
        // Filter out subjects that are already in the database
        const newSubjects = subjectList.filter(
          (subject) => !existingSubjectNames.has(subject)
        );
  
        // Insert new subjects and await insertion
        if (newSubjects.length > 0) {
          await db
            .insert(SUBJECTS)
            .values(
              newSubjects.map((subject) => ({
                subject_name: subject,
                min_age: minAge,
                max_age: maxAge,
              }))
            )
            .execute();
        }
  
        // Fetch IDs for all subjects (both new and existing)
        const allSubjectNames = [...existingSubjectNames, ...newSubjects];
  
        const ids = await db
          .select({
            subject_name: SUBJECTS.subject_name,
            subject_id: SUBJECTS.subject_id,
          })
          .from(SUBJECTS)
          .where(
            and(
              inArray(SUBJECTS.subject_name, allSubjectNames), // Ensure allSubjectNames is an array
              eq(SUBJECTS.min_age, minAge),
              eq(SUBJECTS.max_age, maxAge)
            )
          )
          .execute();
  
        ids.forEach((subject) => {
          subjectIds.set(subject.subject_name, subject.subject_id);
        });
  
        // Insert the relationships between career and subjects
        const careerSubjectPromises = subjectList.map((subject) => {
          const subjectId = subjectIds.get(subject);
          return db
            .insert(CAREER_SUBJECTS)
            .values({
              career_id: careerId,
              subject_id: subjectId,
            })
            .execute();
        });
  
        await Promise.all(careerSubjectPromises);
      }
  
      console.log("Subjects and their relationships saved successfully.");
    } catch (error) {
      console.error("Error saving subjects to database:", error);
      throw error;
    }
  };
  

// Main function to fetch and save subjects
export const processCareerSubjects = async (
  careerName,
  careerId,
  country,
  age
) => {
  try {
    const subjectsByAge = await fetchSubjectsFromOpenAI(
      careerName,
      country,
      age
    );
    const subjects = subjectsByAge["subject-data"]; // Extract the array of subjects

    console.log("got subjects");

    await saveSubjectsToDatabase(careerId, subjects, age); // Pass subjects array
  } catch (error) {
    console.error("Error processing career subjects:", error);
  }
};
