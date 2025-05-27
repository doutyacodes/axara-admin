import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.json({ message: "Logged out" });
  
  // Clear the auth token by setting its expiration in the past
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: true,
    path: '/',
    expires: new Date(0)
  });

  return response;
}



// box , reullt , primpt ,

// hyperlocal - NewsAdminPanel,  10km area only - people can add news , cititizen report, no link, web page e po