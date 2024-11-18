import { db } from "@/utils";
import {
  CAREER_GROUP,
  COMMUNITY,
  USER_CAREER,
  USER_CAREER_STATUS,
  USER_COMMUNITY,
} from "@/utils/schema";
import { and, eq } from "drizzle-orm";

export async function saveCareer(careersArray, country, userId, type1, type2) {
  try {
    for (const career of careersArray) {
      let careerGroupId;
      let globalCommunityId; // Declare this variable

      // Check for existing career group
      const existingCareerGroup = await db
        .select({ id: CAREER_GROUP.id })
        .from(CAREER_GROUP)
        .where(eq(CAREER_GROUP.career_name, career))
        .execute();
      console.log("Existing Career Group:", existingCareerGroup);

      if (existingCareerGroup.length > 0) {
        console.log("Existing Career");
        careerGroupId = existingCareerGroup[0].id;
      } else {
        console.log("Inserting Career");
        const insertResult = await db
          .insert(CAREER_GROUP)
          .values({ career_name: career })
          .execute();

        careerGroupId = insertResult[0].insertId;
        console.log("Inserting Career ID:", careerGroupId);
      }

      // Check for existing user career
      const existingUserCareer = await db
        .select()
        .from(USER_CAREER)
        .where(
          and(
            eq(USER_CAREER.user_id, userId),
            eq(USER_CAREER.career_group_id, careerGroupId)
          )
        )
        .execute();
      console.log("Existing User Career:", existingUserCareer);

      if (existingUserCareer.length > 0) {
        console.log("Existing User Career");
        return {
          message: `Career '${career}' is already saved for this user.`,
          status: 409,
        };
      }

      console.log("Inserting User Career");
      const insertUserCareerResult = await db
        .insert(USER_CAREER)
        .values({
          user_id: userId,
          career_group_id: careerGroupId,
          country: country,
          type1: type1,
          type2: type2,
        })
        .execute();
      console.log("User Career Insert Result:", insertUserCareerResult);

      const userCareerId = insertUserCareerResult[0].insertId;
      console.log("User Career ID:", userCareerId);

      // Insert into USER_CAREER_STATUS table
      await db
        .insert(USER_CAREER_STATUS)
        .values({
          user_career_id: userCareerId,
          roadmap_status: "not_started",
        })
        .execute();

      // Check for global community
      const globalCommunity = await db
        .select()
        .from(COMMUNITY)
        .where(and(eq(COMMUNITY.career, career), eq(COMMUNITY.global, "yes")))
        .execute();
      console.log("Global Community:", globalCommunity);

      // If the global community does not exist, create it
      if (globalCommunity.length === 0) {
        const [insertGlobal] = await db
          .insert(COMMUNITY)
          .values({
            career,
            global: "yes",
            country: null,
          })
          .execute();

        globalCommunityId = insertGlobal.insertId;
        console.log("Created Global Community ID:", globalCommunityId);
      } else {
        globalCommunityId = globalCommunity[0].id;
        console.log("Existing Global Community ID:", globalCommunityId);
      }

      // Check for country-specific community
      const countryCommunity = await db
        .select()
        .from(COMMUNITY)
        .where(
          and(
            eq(COMMUNITY.career, career),
            eq(COMMUNITY.global, "no"),
            eq(COMMUNITY.country, country)
          )
        )
        .execute();
      console.log("Country Community:", countryCommunity);

      let countryCommunityId;

      // If the country-specific community does not exist, create it
      if (countryCommunity.length === 0) {
        const [insertCountry] = await db
          .insert(COMMUNITY)
          .values({
            career,
            global: "no",
            country,
          })
          .execute();

        countryCommunityId = insertCountry.insertId;
        console.log("Created Country Community ID:", countryCommunityId);
      } else {
        countryCommunityId = countryCommunity[0].id;
        console.log("Existing Country Community ID:", countryCommunityId);
      }

      // Add the user to the global community
      const globalUserCommunity = await db
        .select()
        .from(USER_COMMUNITY)
        .where(
          and(
            eq(USER_COMMUNITY.user_id, userId),
            eq(USER_COMMUNITY.community_id, globalCommunityId)
          )
        )
        .execute();
      console.log("Global User Community:", globalUserCommunity);

      if (globalUserCommunity.length === 0) {
        await db
          .insert(USER_COMMUNITY)
          .values({
            user_id: userId,
            community_id: globalCommunityId,
            country: null,
          })
          .execute();
        console.log("Added user to global community");
      }

      // Add the user to the country-specific community
      const countryUserCommunity = await db
        .select()
        .from(USER_COMMUNITY)
        .where(
          and(
            eq(USER_COMMUNITY.user_id, userId),
            eq(USER_COMMUNITY.community_id, countryCommunityId)
          )
        )
        .execute();
      console.log("Country User Community:", countryUserCommunity);

      if (countryUserCommunity.length === 0) {
        await db
          .insert(USER_COMMUNITY)
          .values({
            user_id: userId,
            community_id: countryCommunityId,
            country,
          })
          .execute();
        console.log("Added user to country-specific community");
      }
    }
    return { message: "Careers saved successfully", status: 200 };
  } catch (error) {
    console.error("Error saving career:", error);
    throw error; // Throw the error for further handling
  }
}
