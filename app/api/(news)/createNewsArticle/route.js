import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import axios from 'axios';

export async function POST(request) {
  const authResult = await authenticate(request, true);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const data = await request.json();

  const { title, summary, description, wordDefinitions } = data

  if (!title || !summary || !description || !Array.isArray(wordDefinitions)) {
    return NextResponse.json(
      { error: 'Missing required fields or invalid wordDefinitions format.' },
      { status: 400 }
    );
  }

  try {
    const prompt = `
        Based on the following news:
        Title: "${title}"
        Summary: "${summary}"
        Description: "${description}"

        Words and definitions:
        ${wordDefinitions.map(({ word, definition }) => `- ${word}: ${definition}`).join('\n')}

        Rewrite this news for each age group (3 to 12 years old). The rewritten content should:
        1. Retain the original meaning of the news. Do not change its context or key ideas.
        2. Use words and sentences that are appropriate and easy for each age group to understand.
        3. Ensure that real-world terms or concepts are explained simply, while keeping their original context.

        For each age group, provide:
        1. A title appropriate for this age.
        2. A summary in a way they can easily understand.
        3. A detailed description suitable for their comprehension level.
        4. Two questions relevant to the news.
        5. Simplified definitions for the given words, suitable for the age group.

        Respond in JSON format:
        [
          {
            "age": 3,
            "title": "<age-appropriate title>",
            "summary": "<age-appropriate summary>",
            "description": "<age-appropriate description>",
            "questions": ["<question1>", "<question2>"],
            "wordDefinitions": [
              { "word": "<word>", "definition": "<age-appropriate definition>" }
            ]
          },
          {
            "age": 4,
            // Repeat for each age up to 12
          }
        ]
      `;

    console.log(prompt);
    
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
          model: "gpt-4o-mini", 
          messages: [{ role: "user", content: prompt }],
          max_tokens: 2500,
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
  // console.log("responseText", responseText)

    let parsedData;

    try {
        parsedData = JSON.parse(responseText);
        // parsedData = responseText;
    } catch (error) {
        throw new Error("Failed to parse response data");
    }

    // Filter word definitions for relevance
    // const filteredResults = parsedData.map((result) => {
    //   const relevantWords = result.description
    //     .toLowerCase()
    //     .split(/\s+/)
    //     .filter((word) =>
    //       wordDefinitions.some((w) => w.word.toLowerCase() === word)
    //     );

    //   return {
    //     ...result,
    //     wordDefinitions: result.wordDefinitions.filter((def) =>
    //       relevantWords.includes(def.word.toLowerCase())
    //     ),
    //   };
    // });

    return NextResponse.json({ results: parsedData, originalData: data }, { status: 200 });
  } catch (error) {
    console.error('Error processing OpenAI API:', error);
    return NextResponse.json(
      { error: 'Failed to process the request', details: error.message },
      { status: 500 }
    );
  }
}
