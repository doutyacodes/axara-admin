import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import axios from 'axios';
import AddCategoryModal from '@/app/(innerpage)/news/_components/AddCategoryModal/AddCategoryModal';
import { NEWS_CATEGORIES } from '@/utils/schema';
import { db } from '@/utils';
import { inArray } from 'drizzle-orm';

export async function POST(request) {
  const authResult = await authenticate(request, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const data = await request.json();

  const { title, description, wordDefinitions, categoryIds } = data

  if (!title || !description || !Array.isArray(wordDefinitions) || !Array.isArray(categoryIds)) {
    return NextResponse.json(
      { error: 'Missing required fields or invalid wordDefinitions format.' },
      { status: 400 }
    );
  }

  try {

     // Fetch category names based on categoryIds
    //  const categories = await db.select().from(NEWS_CATEGORIES).where(NEWS_CATEGORIES.id.in(categoryIds));
     const categories = await db.select().from(NEWS_CATEGORIES).where(inArray(NEWS_CATEGORIES.id, categoryIds));

     // Determine if any category name is 'Interview'
     const isInterview = categories.some(category => category.name.toLowerCase() === 'interview');
 
    
    /* ltest usesd */
    // const prompt = `
    //   Based on the following news:
    //   Title: "${title}"
    //   Description: "${description}"
      
    //   ${wordDefinitions.length > 0 ? `Words and definitions:
    //   ${wordDefinitions.map(({ word, definition }) => `- ${word}: ${definition}`).join('\n')}` : ''}
      
    //   Rewrite this news for each age group (3 to 12 years old). The rewritten content should:
    //   1. Retain the original meaning of the news. Do not change its context or key ideas.
    //   2. Use words and sentences that are appropriate and easy for each age group to understand.
    //   3. Ensure that real-world terms or concepts are explained simply, while keeping their original context.
      
    //   For each age group, provide:
    //   1. A title appropriate for this age.
    //   2. A detailed description suitable for their comprehension level.
    //   3. Two questions relevant to the news.
    //   ${wordDefinitions.length > 0 ? '4. Simplified definitions for the given words, suitable for the age group.' : ''}
      
    //   Ensure the output includes:
    //   - "wordDefinitions": [] if there are no words and definitions provided.
      
    //   Respond in JSON format:
    //   [
    //     {
    //       "age": 3,
    //       "title": "<age-appropriate title>",
    //       "description": "<age-appropriate description>",
    //       "questions": ["<question1>", "<question2>"],
    //       ${wordDefinitions.length > 0 ? `"wordDefinitions": [
    //         { "word": "<word>", "definition": "<age-appropriate definition>" }
    //       ]` : `"wordDefinitions": []`}
    //     },
    //     {
    //       "age": 4,
    //       // Repeat for each age up to 12
    //     }
    //   ]
    //   `;


    /* sat */
    // const prompt = `
    // Based on the following news:
    // Title: "${title}"
    // Description: "${description}"
    
    // ${wordDefinitions.length > 0 ? `Words and definitions:
    // ${wordDefinitions.map(({ word, definition }) => `- ${word}: ${definition}`).join('\n')}` : ''}
    
    // Rewrite this news for each age group (3 to 12 years old). The rewritten content should:
    // 1. Retain the original meaning of the news. Do not change its context or key ideas.
    // 2. Be tailored to the understanding level of each age group, using language and concepts they can easily grasp.
    // 3. Gradually increase the detail and complexity as the age increases:
    //    - **Age 3**: A single, small paragraph (50-70 words) with very simple and repetitive language. Avoid breaking into multiple paragraphs.
    //    - **Age 4**: A slightly longer single paragraph (75-100 words), adding more context while keeping language simple.
    //    - **Ages 5 to 6**: Expand into 1-2 short paragraphs (150-200 words), introducing additional details where relevant.
    //    - **Ages 7 to 9**: Use 2-3 paragraphs (250-300 words), adding vivid explanations and age-appropriate vocabulary, only if needed based on the given news.
    //    - **Ages 10 to 12**: Provide 3-5 paragraphs (up to 500-600 words) with deeper context, elaboration, and nuanced details only if the content allows it. Do not force additional paragraphs.

    // For each age group, provide:
    // 1. A title appropriate for this age.
    // 2. A detailed description suitable for their age's comprehension level. When giving multiple paragraphs, use **logical paragraph breaks** ("\\n\\n") to break the paragraphs so they are easily viewable.
    // 3. Two questions relevant to the news, designed to stimulate curiosity and understanding for that age.
    // ${wordDefinitions.length > 0 ? '4. Simplified definitions for the given words, tailored to the age group.' : ''}
    
    // Ensure the output includes:
    // - "wordDefinitions": [] if there are no words and definitions provided.
    
    // Respond in JSON format:
    // [
    //   {
    //     "age": 3,
    //     "title": "<short title for 3-year-olds>",
    //     "description": "This is a single small paragraph for 3-year-olds with simple language.",
    //     "questions": ["<simple question1>", "<simple question2>"],
    //     ${wordDefinitions.length > 0 ? `"wordDefinitions": [
    //       { "word": "<word>", "definition": "<simplified definition for 3-year-olds>" }
    //     ]` : `"wordDefinitions": []`}
    //   },
    //   {
    //     "age": 4,
    //     // Repeat for each age up to 12, ensuring logical paragraph structure
    //   }
    // ]
    // `;


      /* Last tr cal */
      // const prompt = `
      //   Based on the following news:
      //   Title: "${title}"
      //   Description: "${description}"

      //   Rewrite this news for each age group (3 to 12 years old). The rewritten content should:
      //   1. Retain the original meaning of the news. Do not change its context or key ideas.
      //   2. Be tailored to the understanding level of each age group, using language, concepts, and tone that a child in that age group can easily grasp. Present the news in a way that feels natural and relatable for a child of that age, avoiding a formal or "news-like" tone.
      //   3. Use words and sentences that are appropriate and easy for each age group to understand.
      //   4. Ensure that real-world terms or concepts are explained simply, while keeping their original context.
      //   5. Gradually increase and adjust the language and explanations to suit the understanding level of each age group, keeping it simple and relatable at all stages. For the age group:
      //     - **Age 3**: Use simple, repetitive language and a single short paragraph (50-70 words). Focus on basic concepts without details.
      //     - **Age 4**: Slightly increase the detail and context in one paragraph (75-100 words). Keep the language simple.
      //     - **Ages 5 to 6**: Use 1-2 short paragraphs (150-200 words). Introduce additional details while keeping it age-appropriate. When giving multiple paragraphs, use **logical paragraph breaks** ("\\n\\n") if needed, to break the paragraphs so they are easily viewable.
      //     - **Ages 7 to 9**: Use 2-3 paragraphs (250-300 words), explaining ideas in more depth without making it overly complex. When giving multiple paragraphs, use **logical paragraph breaks** ("\\n\\n") if needed, to break the paragraphs so they are easily viewable.
      //     - **Ages 10 to 12**: Use 3-5 paragraphs (up to 400-500 words). Explain ideas clearly and in a way this age group can relate to, but avoid complicated vocabulary or concepts. The tone and explanations should still feel accessible and engaging for a child of this age. When giving multiple paragraphs, use **logical paragraph breaks** ("\\n\\n") if needed, to break the paragraphs so they are easily viewable.

      //   6. Do not add extra details beyond what is in the input (title and description). Focus on simplifying and explaining within the provided information.

      //   For each age group, provide:
      //   1. A title suitable for that age group.
      //   2. A rewritten description tailored for the age's comprehension level, adhering to the required word count and paragraph structure. The content should feel engaging, relatable, and easy for a child to connect with, written in a tone appropriate for their age. When giving multiple paragraphs, use **logical paragraph breaks** ("\\n\\n") to break the paragraphs so they are easily viewable.
      //   3. Two questions relevant to the news designed to stimulate curiosity and understanding for the age group.
      //   4. Identify terms, concepts, or ideas in the rewritten description for that age group that might be challenging for them to understand. Provide simple, child-friendly explanations for these. These explanations should be included for each age group, even if the terms themselves are not inherently difficult.

      //   Ensure the output includes:
      //   - "wordDefinitions": Always include explanations for terms, ideas, or concepts from the rewritten news that might need clarification for that age group, tailored to their understanding.

      //   Respond in JSON format:
      //   [
      //     {
      //       "age": 3,
      //       "title": "<short title for 3-year-olds>",
      //       "description": "This is a single small paragraph for 3-year-olds with simple, engaging language.",
      //       "questions": ["<simple question1>", "<simple question2>"],
      //       "wordDefinitions": [
      //         { "word": "<term>", "definition": "<simplified explanation for 3-year-olds>" }
      //       ]
      //     },
      //     {
      //       "age": 4,
      //       // Repeat for each age up to 12, ensuring logical paragraph structure
      //     }
      //   ]
      //   `;

      // const prompt = `
      //   Based on the following news:
      //   Title: "${title}"
      //   Description: "${description}"

      //   Rewrite this news for each age group (3 to 12 years old). The rewritten content should:
      //   1. Retain the original meaning of the news, but rewrite it in a way that feels fun, engaging, and relatable for children. Use playful, conversational language and avoid formal or "news-like" tones.
      //   2. Use simple, friendly, and imaginative explanations tailored to each age group, keeping in mind their level of understanding. Imagine you're talking directly to a child in that age group.
      //   3. Include relatable examples or analogies that a child of the given age might encounter in their daily life or find easy to visualize.
      //   4. For terms, ideas, or concepts that might be new or hard for kids to understand, include a simple and fun explanation in a "Did You Know?" style or as part of the story.
      //   5. Gradually increase the complexity of language and explanations to suit the age group's understanding, but always keep the tone engaging and child-friendly. For the age group:
      //     - **Age 3**: Use very simple, repetitive phrases and one short paragraph (50-70 words). Focus on basic ideas that can be easily understood and visualized.
      //     - **Age 4**: Add slightly more detail in one paragraph (75-100 words), but keep it simple and fun.
      //     - **Ages 5 to 6**: Use 1-2 paragraphs (150-200 words). Introduce slightly more detail and relatable examples. Use a playful tone with questions or little surprises.
      //     - **Ages 7 to 9**: Write 2-3 paragraphs (250-300 words) and add more depth while keeping it imaginative and exciting. Make it feel like a story or a fun explanation.
      //     - **Ages 10 to 12**: Use 3-5 paragraphs (up to 400-500 words), explaining the news in a way this age group can relate to, with more real-world context, examples, or fun facts.

      //   6. Do not add extra details beyond the original news, but use the input creatively to make it engaging and age-appropriate.

      //   For each age group, provide:
      //   1. A playful and engaging title tailored to that age group.
      //   2. A rewritten description designed for the age's comprehension level, written in a conversational and fun tone.
      //   3. Two engaging questions to make the child think or talk about the news.
      //   4. Explain any terms, concepts, or ideas in the rewritten news that might be hard for the age group to understand, using child-friendly, playful definitions.

      //   Ensure the output includes:
      //   - "wordDefinitions": Always include child-friendly explanations for terms, ideas, or concepts in the rewritten description that might need clarification for that age group.

      //   Respond in JSON format:
      //   [
      //     {
      //       "age": 3,
      //       "title": "<fun, short title for 3-year-olds>",
      //       "description": "This is a single short paragraph for 3-year-olds in a very playful and simple way.",
      //       "questions": ["<fun question1>", "<fun question2>"],
      //       "wordDefinitions": [
      //         { "word": "<term>", "definition": "<playful explanation for 3-year-olds>" }
      //       ]
      //     },
      //     {
      //       "age": 4,
      //       // Repeat for each age up to 12, ensuring logical and fun tone for every age group
      //     }
      //   ]
      //   `;


    /* --------------------------- */

      // const prompt = `
      //   Based on the following news:
      //   Title: "${title}"
      //   Description: "${description}"

      //   Rewrite this news for each age group (3 to 12 years old). The rewritten content should:
      //   1. Write a simplified and age-appropriate version of this news story for kids aged 3 to 12, summarizing the content in a way each age group can easily understand.
      //   2. For each individual age, craft a unique version that fits their comprehension level and attention span.
  
      //    For each age group, provide:
      //      1. A engaging Title tailored to that age group.
      //      2. A  **description** that summarizes the content in a way each age group can easily understand
      //      3. Two engaging questions to make the child think or talk about the news.

      //   Ensure the output includes:
      //   - "wordDefinitions": Always include explanations for terms, ideas, or concepts in the rewritten description that might need clarification for that age group.

      //   Respond in JSON format:
      //   [
      //     {
      //       "age": 3,
      //       "title": "<title for 3-year-olds>",
      //       "description": "<The news appropriate fr the age>",
      //       "questions": ["<question1>", "<question2>"],
      //       "wordDefinitions": [
      //         { "word": "<term>", "definition": "<explanation for 3-year-olds>" }
      //       ]
      //     },
      //     {
      //       "age": 4,
      //       // Repeat for each age up to 12, ensuring logical and fun tone for every age group
      //     }
      //   ]
      //   `;

    // Select the appropriate prompt
    const prompt = isInterview
      ? `
      Based on the following interview:

      Title: "${title}"

      Interviewer and Interviewee Dialogue:
      "${description}"

      Rewrite this interview in a way that is understandable for each age group (3 to 12 years old). The rewritten content should:

      1. Maintain the original interview format, keeping all questions and answers intact.
      2. Change the text to make it simplified and age-appropriate for each specified age group.
      3. Ensure the language and concepts used are easy for the specified age group to understand.
      4. Present the interview in first person, keeping the structure of "<person1>: <some text>, <person2>: <some text>".
      5. Include two engaging questions to make the child think or talk about the interview.

      For each age group, provide:

      1. The entire interview text rewritten to be age-appropriate.
      2. Word definitions: Always include explanations for terms, ideas, or concepts in the rewritten description that might need clarification for that age group.

      Respond in JSON format as shown below:

      [
        {
          "age": 3,
          "title": "<title for 3-year-olds>",
          "description": "<for 3-year-olds>",
          "questions": ["<question1>", "<question2>"],
          "wordDefinitions": [
            { "word": "<term>", "definition": "<explanation for 3-year-olds>" }
          ]
        },
        {
          "age": 4,
          "title": "<title for 4-year-olds>",
          "description": "<for 4-year-olds>",
          "questions": ["<question1>", "<question2>"],
          "wordDefinitions": [
            { "word": "<term>", "definition": "<explanation for 4-year-olds>" }
          ]
        },
        // Repeat for each age group from 5 to 12, ensuring a clear, engaging tone appropriate for each.
      ]
      `
      : `
        Based on the following news:
        Title: "${title}"
        Description: "${description}"

        Rewrite this news for each age group (3 to 12 years old). The rewritten content should:
        1. Write a simplified and age-appropriate version of this news story for kids aged 3 to 12, summarizing the content in a way each age group can easily understand.
        2. For each individual age, craft a unique version that fits their comprehension level and attention span.
  
         For each age group, provide:
           1. A engaging Title tailored to that age group.
           2. A  **description** that summarizes the content in a way each age group can easily understand
           3. Two engaging questions to make the child think or talk about the news.

        Ensure the output includes:
        - "wordDefinitions": Always include explanations for terms, ideas, or concepts in the rewritten description that might need clarification for that age group.

        Respond in JSON format:
        [
          {
            "age": 3,
            "title": "<title for 3-year-olds>",
            "description": "<The news appropriate fr the age>",
            "questions": ["<question1>", "<question2>"],
            "wordDefinitions": [
              { "word": "<term>", "definition": "<explanation for 3-year-olds>" }
            ]
          },
          {
            "age": 4,
            // Repeat for each age up to 12, ensuring logical and fun tone for every age group
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
  // const responseText = [
  //   {
  //     "age": 3,
  //     "title": "Sandeep Changed Teams!",
  //     "summary": "Sandeep left one team and joined another team.",
  //     "description": "Sandeep was with a group called Team BJP, but now he is with Team Congress. The people in Team Congress were really nice to him. They hugged him and said welcome. Sandeep said, 'I want to be with nice people!' He felt sad in his old team because they didn’t help him. There is a big day called election coming up soon, but now it’s on a different day because of a fun festival!",
  //     "questions": ["Which team did Sandeep leave?", "What did Sandeep want from his new team?"],
  //     "wordDefinitions": [
  //       { "word": "Election", "definition": "A special day when people choose leaders." },
  //       { "word": "Congress", "definition": "A group of people who work together in the government." }
  //     ]
  //   },
  //   {
  //     "age": 4,
  //     "title": "Sandeep Joins Team Congress!",
  //     "summary": "Sandeep left Team BJP and joined a new political team called Congress.",
  //     "description": "Sandeep, who was part of Team BJP, has switched to Team Congress! When Sandeep joined Congress, the other leaders greeted him warmly and welcomed him with hugs. He explained that he was looking to be with kind-hearted people, unlike his previous team. He felt let down in Team BJP because he thought they didn't listen to him or support him. There's an important election happening soon in Palakkad, but its date was moved from November 13 to November 20 to allow for a significant festival to be celebrated.",
  //     "questions": ["What are Sandeep's reasons for leaving Team BJP?", "What festival caused the election date change?"],
  //     "wordDefinitions": [
  //       { "word": "Election", "definition": "A day when voters choose their leaders from a list of candidates." },
  //       { "word": "Congress", "definition": "A political organization made up of leaders who decide on laws and policies." }
  //     ]
  //   },
  //   {
  //     "age": 5,
  //     "title": "Sandeep's New Team!",
  //     "summary": "Sandeep left Team BJP to join Team Congress.",
  //     "description": "Sandeep was a member of Team BJP but decided to join Team Congress instead! When he arrived at Congress, many important leaders there welcomed him with hugs. Sandeep explained that he wants to be with nice people who are friendly and caring. He felt sad in Team BJP because they didn't listen to him and he didn't like some of their decisions. An election in Palakkad is coming soon, but the date has changed to November 20 because of a big celebration.",
  //     "questions": ["What did Sandeep like about his new team?", "Why was the election date changed?"],
  //     "wordDefinitions": [
  //       { "word": "Election", "definition": "A special day when people vote for their leaders." },
  //       { "word": "Congress", "definition": "A political party with leaders who make important decisions." }
  //     ]
  //   },
  //   {
  //     "age": 6,
  //     "title": "Sandeep Joins Team Congress!",
  //     "summary": "Sandeep left Team BJP and joined a new political team called Congress.",
  //     "description": "Sandeep, who was part of Team BJP, has switched to Team Congress! When Sandeep joined Congress, the other leaders greeted him warmly and welcomed him with hugs. He explained that he was looking to be with kind-hearted people, unlike his previous team. He felt let down in Team BJP because he thought they didn't listen to him or support him. There's an important election happening soon in Palakkad, but its date was moved from November 13 to November 20 to allow for a significant festival to be celebrated.",
  //     "questions": ["What are Sandeep's reasons for leaving Team BJP?", "What festival caused the election date change?"],
  //     "wordDefinitions": [
  //       { "word": "Election", "definition": "A day when voters choose their leaders from a list of candidates." },
  //       { "word": "Congress", "definition": "A political organization made up of leaders who decide on laws and policies." }
  //     ]
  //   },
  //   {
  //     "age": 7,
  //     "title": "Sandeep's New Political Team!",
  //     "summary": "Sandeep has left Team BJP and joined Team Congress.",
  //     "description": "Sandeep, a leader, used to be part of Team BJP, but he made the decision to join Team Congress. When he arrived, the leaders of Congress welcomed him with open arms and hugs. Sandeep shared that he wanted to surround himself with kind and loving people. He felt unhappy in Team BJP because he believed his voice wasn’t heard and he disagreed with some of their choices. The election in Palakkad is coming up soon, but the date has been changed from November 13 to November 20 in honor of a big festival.",
  //     "questions": ["What does Sandeep hope to find in his new team?", "Why did they change the date of the election?"],
  //     "wordDefinitions": [
  //       { "word": "Election", "definition": "A special event when people vote to choose leaders." },
  //       { "word": "Congress", "definition": "A political party that helps run the country." }
  //     ]
  //   },
  //   {
  //     "age": 8,
  //     "title": "Sandeep Joins Team Congress!",
  //     "summary": "Sandeep left Team BJP and joined a new political team called Congress.",
  //     "description": "Sandeep, who was part of Team BJP, has switched to Team Congress! When Sandeep joined Congress, the other leaders greeted him warmly and welcomed him with hugs. He explained that he was looking to be with kind-hearted people, unlike his previous team. He felt let down in Team BJP because he thought they didn't listen to him or support him. There's an important election happening soon in Palakkad, but its date was moved from November 13 to November 20 to allow for a significant festival to be celebrated.",
  //     "questions": ["What are Sandeep's reasons for leaving Team BJP?", "What festival caused the election date change?"],
  //     "wordDefinitions": [
  //       { "word": "Election", "definition": "A day when voters choose their leaders from a list of candidates." },
  //       { "word": "Congress", "definition": "A political organization made up of leaders who decide on laws and policies." }
  //     ]
  //   },
  //   {
  //     "age": 9,
  //     "title": "Sandeep Joins Team Congress!",
  //     "summary": "Sandeep left Team BJP and joined a new political team called Congress.",
  //     "description": "Sandeep, who was part of Team BJP, has switched to Team Congress! When Sandeep joined Congress, the other leaders greeted him warmly and welcomed him with hugs. He explained that he was looking to be with kind-hearted people, unlike his previous team. He felt let down in Team BJP because he thought they didn't listen to him or support him. There's an important election happening soon in Palakkad, but its date was moved from November 13 to November 20 to allow for a significant festival to be celebrated.",
  //     "questions": ["What are Sandeep's reasons for leaving Team BJP?", "What festival caused the election date change?"],
  //     "wordDefinitions": [
  //       { "word": "Election", "definition": "A day when voters choose their leaders from a list of candidates." },
  //       { "word": "Congress", "definition": "A political organization made up of leaders who decide on laws and policies." }
  //     ]
  //   },
  //   {
  //     "age": 10,
  //     "title": "Sandeep Joins Team Congress!",
  //     "summary": "Sandeep left Team BJP and joined a new political team called Congress.",
  //     "description": "Sandeep, who was part of Team BJP, has switched to Team Congress! When Sandeep joined Congress, the other leaders greeted him warmly and welcomed him with hugs. He explained that he was looking to be with kind-hearted people, unlike his previous team. He felt let down in Team BJP because he thought they didn't listen to him or support him. There's an important election happening soon in Palakkad, but its date was moved from November 13 to November 20 to allow for a significant festival to be celebrated.",
  //     "questions": ["What are Sandeep's reasons for leaving Team BJP?", "What festival caused the election date change?"],
  //     "wordDefinitions": [
  //       { "word": "Election", "definition": "A day when voters choose their leaders from a list of candidates." },
  //       { "word": "Congress", "definition": "A political organization made up of leaders who decide on laws and policies." }
  //     ]
  //   },
  //   {
  //     "age": 11,
  //     "title": "Sandeep's Transition to Congress!",
  //     "summary": "Sandeep has officially left Team BJP to join Team Congress.",
  //     "description": "In a notable political shift, Sandeep, a leader once aligned with Team BJP, has decided to join Team Congress. Upon his arrival at Congress, he received a warm reception from the party leaders, who warmly embraced him. Sandeep cited his commitment to surrounding himself with compassionate individuals, feeling disappointed in his previous team due to their lack of responsiveness and decisions he disagreed with. As elections in Palakkad approach, the date has been shifted from November 13 to November 20 due to an important festival.",
  //     "questions": ["What factors influenced Sandeep's decision to leave Team BJP?", "How does the festival relate to the updated election date?"],
  //     "wordDefinitions": [
  //       { "word": "Election", "definition": "A structured process in which the public votes to select their government officials." },       
  //       { "word": "Congress", "definition": "A significant political party involved in legislative processes and governance." }
  //     ]
  //   },
  //   {
  //     "age": 12,
  //     "title": "Sandeep's Switch from BJP to Congress!",
  //     "summary": "Sandeep has transitioned from Team BJP to Team Congress.",
  //     "description": "Sandeep, a prominent political figure, has officially left Team BJP, aligning himself now with Team Congress. His entry into Congress was met with considerable enthusiasm from its leaders, who welcomed him warmly. Sandeep articulated that he sought to associate with individuals who embody kindness and compassion, feeling disillusioned with Team BJP due to perceived neglect and disagreement with their decisions. As the upcoming election in Palakkad draws near, the scheduled date has been postponed from November 13 to November 20 to coincide with a significant cultural festival.",
  //     "questions": ["What drove Sandeep to change his political affiliation from BJP to Congress?", "What implications does the festival have for the election timeline?"],
  //     "wordDefinitions": [
  //       { "word": "Election", "definition": "A formal mechanism through which citizens vote to choose their leaders." },
  //       { "word": "Congress", "definition": "A major political party that plays a pivotal role in law-making and governance." }
  //     ]
  //   }
  // ]
  console.log("responseText", responseText)

    let parsedData;

    try {
        parsedData = JSON.parse(responseText);
        // parsedData = responseText;
    } catch (error) {
        throw new Error("Failed to parse response data");
    }

    // const transformedData = [];
    //   parsedData.forEach(item => {
    //     item.age.forEach(age => {
    //       transformedData.push({
    //         age,
    //         title: item.title,
    //         description: item.description,
    //         questions: item.questions,
    //         wordDefinitions: item.wordDefinitions
    //       });
    //     });
    //   });

    return NextResponse.json({ results: parsedData, originalData: data }, { status: 200 });
  } catch (error) {
    console.error('Error processing OpenAI API:', error);
    return NextResponse.json(
      { error: 'Failed to process the request', details: error.message },
      { status: 500 }
    );
  }
}
