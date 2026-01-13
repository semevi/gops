import { AppCredentials, FilterState, ApiResponse } from '../types';

interface FetchParams {
  credentials: AppCredentials;
  filters: FilterState;
  latestModTime: string | null;
  isUpdate: boolean;
}

export const fetchFlightData = async ({
  credentials,
  filters,
  latestModTime,
  isUpdate
}: FetchParams): Promise<ApiResponse> => {
  // Use relative path for proxying through Vite (dev) or Vercel (prod)
  const baseUrl = '/api/flights'; 
  const url = new URL(baseUrl, window.location.origin);

  if (!isUpdate) {
    if (filters.date) {
        url.searchParams.set("date", filters.date);
    }
    if (filters.direction) {
        url.searchParams.set("direction", filters.direction);
    }
  } else if (latestModTime) {
    url.searchParams.set("latestModTime", latestModTime);
  }

  // Credentials are now handled by the backend via .env
  // We don't send app_id/app_key from frontend to avoid exposing them in network tab
  // if you still pass them for logic compatibility, they will be ignored by the backend
  // or you can pass them in headers if your backend expects them dynamically.
  // For this implementation, the backend reads them from its own process.env.

  const res = await fetch(url.toString(), {
      headers: {
          "Accept": "application/json"
      }
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}${txt ? ": " + txt : ""}`);
  }
  return res.json();
};