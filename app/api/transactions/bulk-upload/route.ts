import { NextResponse } from "next/server";
import { BACKEND_BASE_URL } from '@/lib/backend';


export async function POST(request: Request) {
  const formData = await request.formData();
  const authHeader = request.headers.get("Authorization");

  const response = await fetch(`${BACKEND_BASE_URL}/transactions/bulk-upload`, {
    method: "POST",
    headers: {
      "Authorization": authHeader || "",
    },
    body: formData,
  });

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status, 
  });
}