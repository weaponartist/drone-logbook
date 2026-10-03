// Extracts the unencrypted summary of every DJI Fly log in data/FlightRecords into data/dji_details.json.
// Usage: node tools/dji-details.mjs
import { DJILog } from "../vendor/dji_log_parser_js.mjs";
import { readFileSync, readdirSync, writeFileSync } from "fs";

const dir = new URL("../data/FlightRecords/", import.meta.url);
const keep = ["startTime", "totalTime", "totalDistance", "maxHeight", "maxHorizontalSpeed", "latitude", "longitude", "aircraftName", "aircraftSn", "batterySn"];
const out = [];
for (const name of readdirSync(dir).filter(f => /^DJIFlightRecord_.*\.txt$/.test(f)).sort()) {
  try {
    const d = new DJILog(readFileSync(new URL(name, dir))).details;
    out.push({ file: name, ...Object.fromEntries(keep.map(k => [k, d[k]])) });
  } catch (e) { console.warn("skip", name, e.message); }
}
writeFileSync(new URL("../data/dji_details.json", import.meta.url), JSON.stringify(out, null, 1));
console.log(`wrote ${out.length} log summaries`);
