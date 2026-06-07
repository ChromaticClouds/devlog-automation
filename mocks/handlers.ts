import { createAnalyzeSuccessHandler } from "./analyze";
import {
  createHistoryDetailSuccessHandler,
  createHistoryListSuccessHandler,
} from "./history";

export const handlers = [
  createAnalyzeSuccessHandler(),
  createHistoryListSuccessHandler(),
  createHistoryDetailSuccessHandler(),
];
