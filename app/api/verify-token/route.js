import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET() {
  const cookieStore = await cookies(); // ✅ Await cookies()
  const token = cookieStore.get('auth_token')?.value;
  const secret = process.env.JWT_SECRET;

  if (!token) {
    return NextResponse.json({ message: "No token found" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, secret);
    return NextResponse.json({ valid: true, role: decoded.role });
  } catch (err) {
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }
}
