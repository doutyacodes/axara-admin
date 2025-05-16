import { NextResponse } from "next/server";
import { db } from "@/utils";
import { ADMIN_DETAILS, CUSTOM_SOURCES } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";

// export async function GET(req) {
//   try {
//     const authResult = await authenticate(req);
//     if (!authResult.authenticated) {
//         return authResult.response;
//     }

//     const userData = authResult.decoded_Data;
//     const userId = userData.id;
//     const userRole = userData.role;
    
//     let sourceNames = [];
//     let currentAdminName = null;

//     // If newsmap_admin, just fetch their own name
//     if (userRole === "newsmap_admin") {
//       const adminDetails = await db
//         .select({ name: ADMIN_DETAILS.name })
//         .from(ADMIN_DETAILS)
//         .where(eq(ADMIN_DETAILS.id, userId))
//         .limit(1)
//         .execute();

//       if (adminDetails.length > 0) {
//         currentAdminName = adminDetails[0].name;
//         sourceNames = [{ name: currentAdminName }];
//       }
//     } 
//     // If superadmin or admin, fetch all newsmap_admin names
//     else if (userRole === "superadmin" || userRole === "admin") {
//       const newsAdmins = await db
//         .select({ name: ADMIN_DETAILS.name })
//         .from(ADMIN_DETAILS)
//         .where(eq(ADMIN_DETAILS.role, "newsmap_admin"))
//         .execute();

//       sourceNames = newsAdmins.map(admin => ({ name: admin.name }));
//     }

//     return NextResponse.json({
//       sourceNames,
//       currentAdminName,
//       success: true
//     });
//   } catch (error) {
//     console.error("Error fetching source names:", error);
//     return NextResponse.json(
//       { error: "Server error", message: error.message },
//       { status: 500 }
//     );
//   }
// }

export async function GET(req) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.id;
    const userRole = userData.role;
    
    let sourceNames = [];
    let currentAdminName = null;
    let customSources = [];

    // If newsmap_admin, just fetch their own name
    if (userRole === "newsmap_admin") {
      const adminDetails = await db
        .select({ name: ADMIN_DETAILS.name })
        .from(ADMIN_DETAILS)
        .where(eq(ADMIN_DETAILS.id, userId))
        .limit(1)
        .execute();

      if (adminDetails.length > 0) {
        currentAdminName = adminDetails[0].name;
        sourceNames = [{ name: currentAdminName, isCustom: false }];
      }
    } 
    // If superadmin or admin, fetch all newsmap_admin names and custom sources
    else if (userRole === "superadmin" || userRole === "admin") {
      // Fetch newsmap_admin names
      const newsAdmins = await db
        .select({ name: ADMIN_DETAILS.name })
        .from(ADMIN_DETAILS)
        .where(eq(ADMIN_DETAILS.role, "newsmap_admin"))
        .execute();

      sourceNames = newsAdmins.map(admin => ({ name: admin.name, isCustom: false }));
      
      // Fetch custom sources
      customSources = await db
        .select({
          id: CUSTOM_SOURCES.id,
          name: CUSTOM_SOURCES.name
        })
        .from(CUSTOM_SOURCES)
        .execute();
      
      // Add custom sources to sourceNames with a flag
      customSources.forEach(source => {
        sourceNames.push({ name: source.name, isCustom: true, id: source.id });
      });
    }

    return NextResponse.json({
      sourceNames,
      currentAdminName,
      success: true
    });
  } catch (error) {
    console.error("Error fetching source names:", error);
    return NextResponse.json(
      { error: "Server error", message: error.message },
      { status: 500 }
    );
  }
}