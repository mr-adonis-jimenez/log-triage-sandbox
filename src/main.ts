import { parseLogLine } from "./parser";
import { filterLogs } from "./filters";
import { exportLogs } from "./export";
import { ParsedLog } from "./types";

let parsedLogs: ParsedLog[] = [];

document.getElementById("logFile")?.addEventListener("change", e => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    parsedLogs = reader.result
      ?.toString()
      .split("\n")
      .map(parseLogLine)
      .filter(Boolean) as ParsedLog[];
  };
  reader.readAsText(file);
});
