import { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const spreadsheetId = process.env.SPREADSHEET_ID;
const range = process.env.RANGE;
const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

// Cache setup
const caches: Record<string, { data: any; timestamp: number }> = {};

const CACHE_TTL = parseInt(
  process.env.GOOGLE_SHEETS_CACHE_TTL ?? (24 * 60 * 60 * 1000).toString()
); // Default 24h

interface APIResponse {
  values: string[][];
}

interface StyleObj {
  style: string;
  count: number;
  topBeer?: BeerObj;
  avrageStyleRating: number;
}

interface BeerObj {
  name: string;
  rating: number;
  style: string;
}

export const getBeersFromSheet = async (req: Request, res: Response) => {
  const cacheName = "beers";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

  if (!caches[cacheName]) {
    caches[cacheName] = { data: null, timestamp: 0 }; // Initialize the cache if it doesn't exist
  }

  // Check cache validity
  if (
    caches[cacheName].data &&
    Date.now() - caches[cacheName].timestamp < CACHE_TTL
  ) {
    console.log("Serving data from cache.");
    return res.json(caches[cacheName].data); // Return cached data
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const result: APIResponse = await response.json();

    if (!result.values || result.values.length === 0) {
      throw new Error("Error: No data found in the Google Sheet.");
    }

    const headers = result.values[0]; // The first row is the headers
    let data = result.values.slice(1).filter((row) => row[0].trim() !== "");
    data = data.sort((a, b) => {
      const valueA = parseFloat(a[6]) || 0;
      const valueB = parseFloat(b[6]) || 0;
      return valueB - valueA;
    });

    const styleMap = await getStats(data);
    const responseBody = {
      headers,
      data,
      styleArray: Array.from(styleMap),
    };
    // Update cache with new data and timestamp
    caches[cacheName].data = responseBody;
    caches[cacheName].timestamp = Date.now();
    res.json(responseBody);
  } catch (err) {
    const error = (err as Error).message;
    console.error("Failed to fetch data:", err);
    res.status(500).json({ error });
  }
};

async function getStats(data: string[][]): Promise<Map<string, StyleObj>> {
  const styleMap: Map<string, StyleObj> = new Map();
  data.forEach((row) => {
    const name = row[0];
    const style = row[1];
    const averageRating = row[6];

    const averageStyleRating =
      (styleMap.get(style)?.avrageStyleRating ?? 0) +
      (isNaN(parseFloat(averageRating)) ? 0 : parseFloat(averageRating));

    const styleObj: StyleObj = {
      style: style,
      count: (styleMap.get(style)?.count ?? 0) + 1,
      topBeer: styleMap.get(style)?.topBeer,
      avrageStyleRating: averageStyleRating,
    };

    const roundedRating = Math.round(Number(averageRating) * 100) / 100;
    const beerObj: BeerObj = {
      name: name,
      rating: roundedRating,
      style: style,
    };
    const compareRating =
      Math.round((styleMap.get(style)?.topBeer?.rating ?? 0) * 100) / 100;

    if (compareRating <= beerObj.rating) {
      styleObj.topBeer = beerObj;
    }

    styleMap.set(style, styleObj);
  });
  return styleMap;
}

export const clearCache = (req: Request, res: Response) => {
  const { cacheName } = req.body;

  if (!cacheName) {
    return res.status(400).json({ message: "Cache name is required." });
  }

  if (!caches[cacheName]) {
    return res
      .status(404)
      .json({ message: `Cache with name '${cacheName}' not found.` });
  }

  // Clear the specific cache
  caches[cacheName].data = null;
  caches[cacheName].timestamp = 0;
  console.log(`Cache '${cacheName}' cleared.`);
  res
    .status(200)
    .json({ message: `Cache '${cacheName}' cleared successfully.` });
};
