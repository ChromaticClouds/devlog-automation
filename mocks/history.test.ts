import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import {
  createHistoryDetailErrorHandler,
  createHistoryDetailInvalidIdHandler,
  createHistoryDetailNotFoundHandler,
  createHistoryDetailSuccessHandler,
  createHistoryListEmptyHandler,
  createHistoryListErrorHandler,
  createHistoryListSuccessHandler,
  historyDetail,
  historyErrorResponses,
  historyItems,
} from "./history";

const server = setupServer();
const origin = "http://localhost";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("analysis history list handlers", () => {
  it("returns the populated contract response", async () => {
    server.use(createHistoryListSuccessHandler());

    const response = await fetch(`${origin}/api/analyses`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ items: historyItems });
  });

  it("returns an empty success response", async () => {
    server.use(createHistoryListEmptyHandler());

    const response = await fetch(`${origin}/api/analyses`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ items: [] });
  });

  it("returns only the safe list failure body", async () => {
    server.use(createHistoryListErrorHandler());

    const response = await fetch(`${origin}/api/analyses`);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual(historyErrorResponses.processingError);
  });
});

describe("analysis history detail handlers", () => {
  it("returns the detail fixture for its deterministic id", async () => {
    server.use(createHistoryDetailSuccessHandler());

    const response = await fetch(`${origin}/api/analyses/${historyDetail.id}`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(historyDetail);
  });

  it("does not accidentally match the list route", async () => {
    server.use(
      createHistoryListEmptyHandler(),
      createHistoryDetailSuccessHandler(),
    );

    const response = await fetch(`${origin}/api/analyses`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ items: [] });
  });

  it("returns 404 when the dynamic id does not match the fixture", async () => {
    server.use(createHistoryDetailSuccessHandler());

    const response = await fetch(`${origin}/api/analyses/999`);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual(historyErrorResponses.notFound);
  });

  it.each([
    ["invalid id", createHistoryDetailInvalidIdHandler, 400, "invalidId"],
    ["not found", createHistoryDetailNotFoundHandler, 404, "notFound"],
    ["processing error", createHistoryDetailErrorHandler, 500, "processingError"],
  ] as const)(
    "returns a safe %s response",
    async (_, factory, status, key) => {
      server.use(factory());

      const response = await fetch(`${origin}/api/analyses/42`);

      expect(response.status).toBe(status);
      expect(await response.json()).toEqual(historyErrorResponses[key]);
    },
  );
});
