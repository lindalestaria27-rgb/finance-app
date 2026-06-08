import { NextRequest, NextResponse } from "next/server";
import { BACKEND_BASE_URL } from "@/lib/backend";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  server_message: string;
  message: string;
  access_token: string;
  token_type: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginRequest;

    // Validate input
    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: "Email dan password harus diisi" },
        { status: 400 }
      );
    }

    // Forward to backend
    const response = await fetch(`${BACKEND_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password
      })
    });

    const data = (await response.json()) as LoginResponse | null;

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || "Login gagal"
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
