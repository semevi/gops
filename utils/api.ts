import { SNAPSHOT_URL, UPDATES_URL } from '../constants';
import { AppCredentials, FilterState, ApiResponse } from '../types';

// Public CORS proxy to bypass browser restrictions if direct call fails
const CORS_PROXY = "https://corsproxy.io/?";

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
  const base = isUpdate ? UPDATES_URL : SNAPSHOT_URL;
  const url = new URL(base);

  if (!isUpdate) {
    // Calculate day offset based on selected date filter
    // 0 = Today, 1 = Tomorrow, -1 = Yesterday
    let startDay = "0";
    let endDay = "1";

    if (filters.date) {
      const [y, m, d] = filters.date.split('-').map(Number);
      const target = new Date(y, m - 1, d); // Local midnight
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Local midnight
      
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      // Set window to requested day + next day to capture overnights
      startDay = String(diffDays);
      endDay = String(diffDays + 1);
    }

    url.searchParams.set("startDay", startDay);
    url.searchParams.set("endDay", endDay);
    
    if (filters.direction) url.searchParams.set("direction", filters.direction);
  } else if (latestModTime) {
    url.searchParams.set("latestModTime", latestModTime);
  }

  const headers = {
    "app_id": credentials.appId.trim(),
    "app_key": credentials.appKey.trim(),
    "Accept": "application/json"
  };

  const doFetch = async (targetUrl: string) => {
    const res = await fetch(targetUrl, { headers });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status}${txt ? ": " + txt : ""}`);
    }
    return res.json();
  };

  try {
    // Attempt direct fetch first
    return await doFetch(url.toString());
  } catch (err: any) {
    // If direct fetch fails with a generic TypeError (common for CORS blocks in browsers), try via proxy
    if (err.name === 'TypeError' || err.message === 'Failed to fetch') {
      console.warn("Direct fetch failed (likely CORS), retrying with proxy...");
      // Append the full URL (encoded) to the proxy
      return await doFetch(CORS_PROXY + encodeURIComponent(url.toString()));
    }
    throw err;
  }
};
