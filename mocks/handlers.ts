import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/api/analyze", async () => {
    return HttpResponse.json({
      analysisId: 1,
      repository: {
        owner: "ChromaticClouds",
        name: "ImsProject",
      },
      result: {
        summary: "최근 GitHub 활동 내역을 기반으로 작업 로그를 생성했습니다.",
        technicalHighlights: ["GitHub API 수집", "LLM 요약", "Markdown 변환"],
        portfolioBullets: [
          "GitHub 활동 데이터를 자동 수집하고 LLM 기반 개발 로그로 변환하는 자동화 도구를 구현했습니다.",
        ],
        nextTasks: ["히스토리 저장", "자동 실행 로그 추가"],
        risks: ["LLM 응답 형식이 깨질 경우 fallback 처리가 필요합니다."],
        markdown: "## 개발 작업 로그\n\nGitHub 활동 요약...",
      },
    });
  }),
];
