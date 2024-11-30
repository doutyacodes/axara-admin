import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import axios from 'axios';

export async function POST(request) {
  const authResult = await authenticate(request, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const data = await request.json();

  const { title, description, wordDefinitions } = data

  if (!title || !description || !Array.isArray(wordDefinitions)) {
    return NextResponse.json(
      { error: 'Missing required fields or invalid wordDefinitions format.' },
      { status: 400 }
    );
  }

  try {
    // const prompt = `
    //     Based on the following news:
    //     Title: "${title}"
    //     Summary: "${summary}"
    //     Description: "${description}"

    //     Words and definitions:
    //     ${wordDefinitions.map(({ word, definition }) => `- ${word}: ${definition}`).join('\n')}

    //     Rewrite this news for each age group (3 to 12 years old). The rewritten content should:
    //     1. Retain the original meaning of the news. Do not change its context or key ideas.
    //     2. Use words and sentences that are appropriate and easy for each age group to understand.
    //     3. Ensure that real-world terms or concepts are explained simply, while keeping their original context.

    //     For each age group, provide:
    //     1. A title appropriate for this age.
    //     2. A summary in a way they can easily understand.
    //     3. A detailed description suitable for their comprehension level.
    //     4. Two questions relevant to the news.
    //     5. Simplified definitions for the given words, suitable for the age group.

    //     Respond in JSON format:
    //     [
    //       {
    //         "age": 3,
    //         "title": "<age-appropriate title>",
    //         "summary": "<age-appropriate summary>",
    //         "description": "<age-appropriate description>",
    //         "questions": ["<question1>", "<question2>"],
    //         "wordDefinitions": [
    //           { "word": "<word>", "definition": "<age-appropriate definition>" }
    //         ]
    //       },
    //       {
    //         "age": 4,
    //         // Repeat for each age up to 12
    //       }
    //     ]
    //   `;

    
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

    // const prompt = `
    // Based on the following news:
    // Title: "${title}"
    // Description: "${description}"
    
    // ${wordDefinitions.length > 0 ? `Words and definitions:
    // ${wordDefinitions.map(({ word, definition }) => `- ${word}: ${definition}`).join('\n')}` : ''}
    
    // Rewrite this news for each age group (3 to 12 years old). The rewritten content should:
    // 1. Retain the original meaning of the news. Do not change its context or key ideas.
    // 2. Be tailored to the understanding level of each age group, using language and concepts they can easily grasp.
    // 3. Gradually increase the content size and detail as the age increases:
    //    - **Age 3**: A small story (8-10 lines or about 50-70 words), simple and repetitive language to emphasize key ideas. Use relatable and imaginative concepts.
    //    - **Age 4**: A detailed story (10-15 lines or about 100 words) with slightly more complexity and details to hold their attention.
    //    - **Ages 5 to 6**: A fully fleshed-out narrative (15-20 lines or about 150-200 words), with engaging and interactive elements such as rhetorical questions or brief descriptions of emotions and actions.
    //    - **Ages 7 to 9**: 2-3 rich paragraphs (250-300 words) with detailed explanations, vivid descriptions, and age-appropriate vocabulary to expand their understanding and curiosity.
    //    - **Ages 10 to 12**: 4-5 comprehensive paragraphs (500-600 words) with nuanced explanations, deeper context, and more mature language to enhance critical thinking and comprehension.
    
    // For each age group, provide:
    // 1. A title appropriate for this age.
    // 2. A description with length and complexity suitable for the age group as outlined above.
    // 3. Two questions relevant to the news, designed to stimulate curiosity and understanding for that age.
    // ${wordDefinitions.length > 0 ? '4. Simplified definitions for the given words, tailored to the age group.' : ''}
    
    // Ensure the output includes:
    // - "wordDefinitions": [] if there are no words and definitions provided.
    
    // Respond in JSON format:
    // [
    //   {
    //     "age": 3,
    //     "title": "<simple and catchy title for 3-year-olds>",
    //     "description": "<a small story of 8-10 lines or 50-70 words>",
    //     "questions": ["<simple and imaginative question1>", "<simple and imaginative question2>"],
    //     ${wordDefinitions.length > 0 ? `"wordDefinitions": [
    //       { "word": "<word>", "definition": "<simplified definition for 3-year-olds>" }
    //     ]` : `"wordDefinitions": []`}
    //   },
    //   {
    //     "age": 4,
    //     "title": "<engaging and detailed title for 4-year-olds>",
    //     "description": "<a detailed story of 10-15 lines or about 100 words>",
    //     "questions": ["<engaging and relatable question1>", "<engaging and relatable question2>"],
    //     ${wordDefinitions.length > 0 ? `"wordDefinitions": [
    //       { "word": "<word>", "definition": "<simplified definition for 4-year-olds>" }
    //     ]` : `"wordDefinitions": []`}
    //   },
    //   {
    //     "age": 5,
    //     "title": "<title with more narrative for 5-year-olds>",
    //     "description": "<a fleshed-out narrative of 15-20 lines or about 150-200 words>",
    //     "questions": ["<interactive question1>", "<interactive question2>"],
    //     ${wordDefinitions.length > 0 ? `"wordDefinitions": [
    //       { "word": "<word>", "definition": "<simplified definition for 5-year-olds>" }
    //     ]` : `"wordDefinitions": []`}
    //   },
    //   {
    //     "age": 6,
    //     "title": "<slightly advanced title for 6-year-olds>",
    //     "description": "<a fleshed-out narrative of 15-20 lines or about 150-200 words>",
    //     "questions": ["<engaging question1>", "<engaging question2>"],
    //     ${wordDefinitions.length > 0 ? `"wordDefinitions": [
    //       { "word": "<word>", "definition": "<simplified definition for 6-year-olds>" }
    //     ]` : `"wordDefinitions": []`}
    //   },
    //   {
    //     "age": 7,
    //     "title": "<descriptive and engaging title for 7-year-olds>",
    //     "description": "<2-3 paragraphs or about 250-300 words>",
    //     "questions": ["<curiosity-driven question1>", "<curiosity-driven question2>"],
    //     ${wordDefinitions.length > 0 ? `"wordDefinitions": [
    //       { "word": "<word>", "definition": "<simplified definition for 7-year-olds>" }
    //     ]` : `"wordDefinitions": []`}
    //   },
    //   {
    //     "age": 8,
    //     "title": "<title with depth and engagement for 8-year-olds>",
    //     "description": "<2-3 paragraphs or about 250-300 words with rich details>",
    //     "questions": ["<insightful question1>", "<insightful question2>"],
    //     ${wordDefinitions.length > 0 ? `"wordDefinitions": [
    //       { "word": "<word>", "definition": "<simplified definition for 8-year-olds>" }
    //     ]` : `"wordDefinitions": []`}
    //   },
    //   {
    //     "age": 9,
    //     "title": "<elaborate title for 9-year-olds>",
    //     "description": "<3 paragraphs or about 300-400 words with vivid and engaging explanations>",
    //     "questions": ["<thought-provoking question1>", "<thought-provoking question2>"],
    //     ${wordDefinitions.length > 0 ? `"wordDefinitions": [
    //       { "word": "<word>", "definition": "<simplified definition for 9-year-olds>" }
    //     ]` : `"wordDefinitions": []`}
    //   },
    //   {
    //     "age": 10,
    //     "title": "<comprehensive title for 10-year-olds>",
    //     "description": "<4 paragraphs or about 500 words with nuanced context>",
    //     "questions": ["<reflective question1>", "<reflective question2>"],
    //     ${wordDefinitions.length > 0 ? `"wordDefinitions": [
    //       { "word": "<word>", "definition": "<simplified definition for 10-year-olds>" }
    //     ]` : `"wordDefinitions": []`}
    //   },
    //   {
    //     "age": 11,
    //     "title": "<detailed and engaging title for 11-year-olds>",
    //     "description": "<4-5 paragraphs or about 500-600 words with in-depth details>",
    //     "questions": ["<critical thinking question1>", "<critical thinking question2>"],
    //     ${wordDefinitions.length > 0 ? `"wordDefinitions": [
    //       { "word": "<word>", "definition": "<simplified definition for 11-year-olds>" }
    //     ]` : `"wordDefinitions": []`}
    //   },
    //   {
    //     "age": 12,
    //     "title": "<rich and comprehensive title for 12-year-olds>",
    //     "description": "<5 paragraphs or about 600-700 words with mature language and context>",
    //     "questions": ["<analytical question1>", "<analytical question2>"],
    //     ${wordDefinitions.length > 0 ? `"wordDefinitions": [
    //       { "word": "<word>", "definition": "<simplified definition for 12-year-olds>" }
    //     ]` : `"wordDefinitions": []`}
    //   }
    // ]
    // `;

    // const prompt = `
    //   Based on the following news:
    //   Title: "${title}"
    //   Description: "${description}"
      
    //   ${wordDefinitions.length > 0 ? `Words and definitions:
    //   ${wordDefinitions.map(({ word, definition }) => `- ${word}: ${definition}`).join('\n')}` : ''}
      
    //   Rewrite this news for each age group (3 to 12 years old). The rewritten content should:
    //   1. Retain the original meaning of the news. Do not change its context or key ideas.
    //   2. Be tailored to the understanding level of each age group, using language and concepts they can easily grasp.
    //   3. Gradually increase the content size and detail as the age increases:
    //     - **Age 3**: A single small paragraph (50-70 words), with simple and repetitive language. Avoid using bullet points.
    //     - **Age 4**: A slightly longer paragraph (75-100 words), adding a bit more context while keeping it simple.
    //     - **Ages 5 to 6**: A detailed narrative (150-200 words), split into small paragraphs as needed.
    //     - **Ages 7 to 9**: 2-3 rich paragraphs (250-300 words) with vivid descriptions and age-appropriate vocabulary.
    //     - **Ages 10 to 12**: 4-5 comprehensive paragraphs (500-600 words) with nuanced explanations and deeper context.

    //   For each age group, provide:
    //   1. A title appropriate for this age.
    //   2. A description formatted in **continuous paragraphs for younger ages** (3 and 4), and **with proper paragraph breaks** (using "\\n\\n") for older ages.
    //   3. Two questions relevant to the news, designed to stimulate curiosity and understanding for that age.
    //   ${wordDefinitions.length > 0 ? '4. Simplified definitions for the given words, tailored to the age group.' : ''}
      
    //   Ensure the output includes:
    //   - "wordDefinitions": [] if there are no words and definitions provided.
      
    //   Respond in JSON format:
    //   [
    //     {
    //       "age": 3,
    //       "title": "<short title for 3-year-olds>",
    //       "description": "This is a single small paragraph for 3-year-olds with simple language.",
    //       "questions": ["<simple question1>", "<simple question2>"],
    //       ${wordDefinitions.length > 0 ? `"wordDefinitions": [
    //         { "word": "<word>", "definition": "<simplified definition for 3-year-olds>" }
    //       ]` : `"wordDefinitions": []`}
    //     },
    //     {
    //       "age": 4,
    //       // Repeat for each age up to 12, ensuring proper paragraph structure
    //     }
    //   ]
    //   `;


    const prompt = `
    Based on the following news:
    Title: "${title}"
    Description: "${description}"
    
    ${wordDefinitions.length > 0 ? `Words and definitions:
    ${wordDefinitions.map(({ word, definition }) => `- ${word}: ${definition}`).join('\n')}` : ''}
    
    Rewrite this news for each age group (3 to 12 years old). The rewritten content should:
    1. Retain the original meaning of the news. Do not change its context or key ideas.
    2. Be tailored to the understanding level of each age group, using language and concepts they can easily grasp.
    3. Gradually increase the detail and complexity as the age increases:
       - **Age 3**: A single, small paragraph (50-70 words) with very simple and repetitive language. Avoid breaking into multiple paragraphs.
       - **Age 4**: A slightly longer single paragraph (75-100 words), adding more context while keeping language simple.
       - **Ages 5 to 6**: Expand into 1-2 short paragraphs (150-200 words), introducing additional details where relevant.
       - **Ages 7 to 9**: Use 2-3 paragraphs (250-300 words), adding vivid explanations and age-appropriate vocabulary, only if needed based on the given news.
       - **Ages 10 to 12**: Provide 3-5 paragraphs (up to 500-600 words) with deeper context, elaboration, and nuanced details only if the content allows it. Do not force additional paragraphs.

    For each age group, provide:
    1. A title appropriate for this age.
    2. A detailed description suitable for their age's comprehension level. When giving multiple paragraphs, use **logical paragraph breaks** ("\\n\\n") to break the paragraphs so they are easily viewable.
    3. Two questions relevant to the news, designed to stimulate curiosity and understanding for that age.
    ${wordDefinitions.length > 0 ? '4. Simplified definitions for the given words, tailored to the age group.' : ''}
    
    Ensure the output includes:
    - "wordDefinitions": [] if there are no words and definitions provided.
    
    Respond in JSON format:
    [
      {
        "age": 3,
        "title": "<short title for 3-year-olds>",
        "description": "This is a single small paragraph for 3-year-olds with simple language.",
        "questions": ["<simple question1>", "<simple question2>"],
        ${wordDefinitions.length > 0 ? `"wordDefinitions": [
          { "word": "<word>", "definition": "<simplified definition for 3-year-olds>" }
        ]` : `"wordDefinitions": []`}
      },
      {
        "age": 4,
        // Repeat for each age up to 12, ensuring logical paragraph structure
      }
    ]
    `;


      /* --------------------------- */
    

    /* final one */
    // const prompt = `
    //     Based on the following news:
    //     Title: "${title}"
    //     Description: "${description}"

    //     ${wordDefinitions.length > 0 ? `Words and definitions:
    //     ${wordDefinitions.map(({ word, definition }) => `- ${word}: ${definition}`).join('\n')}` : ''}

    //     Rewrite this news for the following age groups:
    //     1. Ages 3-5
    //     2. Ages 6-9
    //     3. Ages 10-12

    //     The rewritten content should:
    //     1. Retain the original meaning of the news. Do not change its context or key ideas.
    //     2. **Include all details from the input news in the description. Do not summarize, shorten, or omit any part of the news. Rewrite it using simpler words and sentences suitable for the age group.**
    //     3. **Ensure the rewritten content's length is as long and detailed as the input news. The description should not be shorter than the original and should contain full, comprehensive explanations while being easy to understand for the respective age group.**
    //     4. **Organize the content into paragraphs, ensuring each paragraph is well-formed and coherent.**
    //     5. Use words and sentences that are appropriate and easy for each age group to understand.
    //     6. Explain real-world terms or concepts simply, while keeping their original context.

    //     For each age group, provide:
    //     1. A title appropriate for this age group.
    //     2. A detailed and comprehensive description rewritten for the specific age group, matching the length and detail of the input news.
    //     3. Two questions relevant to the news.
    //     ${wordDefinitions.length > 0 ? '4. Simplified definitions for the given words, suitable for the age group.' : ''}

    //     Ensure the output includes:
    //     - "wordDefinitions": [] if there are no words and definitions provided.

    //     Respond in JSON format:
    //     [
    //       {
    //         "age": [3, 4, 5],
    //         "title": "<age-appropriate title>",
    //         "description": "<detailed and comprehensive description>",
    //         "questions": ["<question1>", "<question2>"],
    //         ${wordDefinitions.length > 0 ? `"wordDefinitions": [
    //           { "word": "<word>", "definition": "<age-appropriate definition>" }
    //         ]` : `"wordDefinitions": []`}
    //       },
    //       {
    //         "age": [6, 7, 8, 9],
    //         "title": "<age-appropriate title>",
    //         "description": "<detailed and comprehensive description>",
    //         "questions": ["<question1>", "<question2>"],
    //         ${wordDefinitions.length > 0 ? `"wordDefinitions": [
    //           { "word": "<word>", "definition": "<age-appropriate definition>" }
    //         ]` : `"wordDefinitions": []`}
    //       },
    //       {
    //         "age": [10, 11, 12],
    //         "title": "<age-appropriate title>",
    //         "description": "<detailed and comprehensive description>",
    //         "questions": ["<question1>", "<question2>"],
    //         ${wordDefinitions.length > 0 ? `"wordDefinitions": [
    //           { "word": "<word>", "definition": "<age-appropriate definition>" }
    //         ]` : `"wordDefinitions": []`}
    //       }
    //     ]
    // `;

    
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
          model: "gpt-4o-mini", 
          messages: [{ role: "user", content: prompt }],
          max_tokens: 3500,
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
