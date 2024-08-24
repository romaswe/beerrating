import { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const spreadsheetId = process.env.SPREADSHEET_ID;
const range = process.env.RANGE;
const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

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
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

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
            styleArray: Array.from(styleMap)
        }
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
