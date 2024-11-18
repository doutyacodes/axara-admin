import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export const authenticate = async (req, check = false) => {
  const authHeader = req.headers.get("authorization");

  if (check) {    
    if (!authHeader) {
      return { authenticated: true, decoded_Data: { id: null } };
    }
  }

  if (!authHeader) {
    console.log("check bno tok");
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.split(" ")[1];
  try {    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      console.log("decod echeck token", token);
      return {
        authenticated: false,
        response: NextResponse.json(
          { error: "Invalid token" },
          { status: 401 }
        ),
      };
    }
    return { authenticated: true, decoded_Data: decoded };
  } catch (error) {
    // Log the error if necessary
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          error:
            error.message === "jwt expired"
              ? "Token has expired"
              : "Authentication failed",
        },
        { status: 401 }
      ),
    };
  }
};
