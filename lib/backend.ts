export const BACKEND_BASE_URL = "https://finmanagement-car-rental.hf.space";

const rawToken =
  process.env.NEXT_PUBLIC_BACKEND_TOKEN ||
  process.env.FINANCE_API_BEARER_TOKEN ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwidXNlcl9pZCI6IjBlMDAwMDcxLTRlYTMtNGUyMy05MzhmLWI4Y2RlZmQ0ODliZSIsInJvbGUiOiJzdGFmZiIsInJvbGUiOiJzdGFmLiIsImV4cCI6MTc3ODIyNTUwN30.d5hQs9DLHe7k_8yDFMYLVW6YM275Mb_JP-nIE1RIwCw";

export const BACKEND_BEARER_TOKEN = rawToken.replace(/^Bearer\s+/i, '');
