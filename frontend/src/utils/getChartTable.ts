"use client";

import { ChartTable } from "./types";
import { BACKEND_URL } from "./util";

export async function getChartTable({
    pairIndex,
    from,
    to,
    range,
    token
}: {
    pairIndex: number;
    from: number;
    to: number;
    range: number;
    token: string;
}): Promise<ChartTable> {
    try {
        console.log("Fetching chart data:", {
            pairIndex,
            from: new Date(from * 1000).toISOString(),
            to: new Date(to * 1000).toISOString(),
            range,
            token
        });

        const url = `${BACKEND_URL}/chart/${pairIndex}/${from}/${to}/${range}/${token}`;
        console.log("Request URL:", url);

        const res = await fetch(url).then((data) => data.json());

        if (!res) {
            throw new Error("Empty response from server");
        }

        console.log("Chart data response:", {
            firstBar: res.table?.[0],
            lastBar: res.table?.[res.table.length - 1],
            totalBars: res.table?.length
        });

        return res as ChartTable;
    } catch (err) {
        console.error("Chart fetch error:", err);
        return Promise.reject(new Error("Failed at fetching charts"));
    }
}