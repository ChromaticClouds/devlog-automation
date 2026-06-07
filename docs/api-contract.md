# API Contract

## Error Policy

All failed requests return a JSON response with a human-readable `message`.

```json
{
  "message": "Error message"
}
```

Business logic failures use:

| Status | Usage |
|---|---|
| `400 Bad Request` | The request input or requested action is invalid. |
| `500 Internal Server Error` | Processing failed because of an internal, provider, or persistence error. |

Other exceptions use:

| Status | Usage |
|---|---|
| `401 Unauthorized` | Authentication is missing or invalid. |
| `403 Forbidden` | Authentication succeeded but access is not allowed. |
| `404 Not Found` | The requested resource does not exist. |
| `405 Method Not Allowed` | The HTTP method is unsupported. |
| `409 Conflict` | The request conflicts with the current resource state. |
| `429 Too Many Requests` | A rate limit has been exceeded. |

Provider errors and internal exception details must not be exposed in responses.

## POST /api/analyze

Analyze a GitHub repository.

### Request

```json
{
  "repoUrl": "https://github.com/owner/repo"
}
```

### Success Response

```json
{
  "analysisId": 1,
  "repository": {
    "owner": "owner",
    "name": "repo",
    "url": "https://github.com/owner/repo"
  },
  "result": {
    "summary": "string",
    "technicalHighlights": ["string"],
    "portfolioBullets": ["string"],
    "nextTasks": ["string"],
    "risks": ["string"],
    "markdown": "string"
  }
}
```

### Error Response (`400 Bad Request`)

```json
{
  "message": "Analyze request body is invalid."
}
```

Invalid repository URLs use:

```json
{
  "message": "GitHub repository URL is invalid."
}
```

### Error Response (`404 Not Found`)

```json
{
  "message": "GitHub repository was not found."
}
```

### Error Response (`429 Too Many Requests`)

```json
{
  "message": "Repository analysis rate limit was exceeded."
}
```

### Error Response (`500 Internal Server Error`)

```json
{
  "message": "Repository analysis failed."
}
```

### Error Response (`405 Method Not Allowed`)

Unsupported methods return:

```json
{
  "message": "Method not allowed."
}
```

The response includes `Allow: POST`.

## GET /api/analyses

Get analysis history.

### Success Response

```json
{
  "items": [
    {
      "id": 1,
      "repositoryName": "repo",
      "repositoryUrl": "https://github.com/owner/repo",
      "summary": "string",
      "createdAt": "2026-06-06T12:00:00.000Z"
    }
  ]
}
```

### Error Response (`500 Internal Server Error`)

```json
{
  "message": "Analysis history request failed."
}
```

### Error Response (`405 Method Not Allowed`)

Unsupported methods return:

```json
{
  "message": "Method not allowed."
}
```

The response includes `Allow: GET`.

## GET /api/analyses/:id

Get analysis detail.

### Success Response

```json
{
  "id": 1,
  "repository": {
    "owner": "owner",
    "name": "repo",
    "url": "https://github.com/owner/repo"
  },
  "result": {
    "summary": "string",
    "technicalHighlights": ["string"],
    "portfolioBullets": ["string"],
    "nextTasks": ["string"],
    "risks": ["string"],
    "markdown": "string"
  },
  "createdAt": "2026-06-06T12:00:00.000Z"
}
```

### Error Response (`400 Bad Request`)

```json
{
  "message": "Analysis id is invalid."
}
```

### Error Response (`404 Not Found`)

```json
{
  "message": "Analysis result was not found."
}
```

### Error Response (`500 Internal Server Error`)

```json
{
  "message": "Analysis history request failed."
}
```

### Error Response (`405 Method Not Allowed`)

Unsupported methods return:

```json
{
  "message": "Method not allowed."
}
```

The response includes `Allow: GET`.

## POST /api/automations/run

Run manual automation test.

### Request

```json
{
  "repositoryId": 1
}
```

### Error Response (`400 Bad Request`)

```json
{
  "message": "실행할 저장소 정보가 올바르지 않습니다."
}
```

### Error Response (`500 Internal Server Error`)

```json
{
  "message": "자동화 실행 중 오류가 발생했습니다."
}
```

### Success Response

```json
{
  "logId": 1,
  "status": "success",
  "message": "Automation test completed."
}
```

## GET /api/automation-logs

Get automation execution logs.

### Success Response

```json
{
  "items": [
    {
      "id": 1,
      "repositoryName": "repo",
      "status": "success",
      "message": "Automation test completed.",
      "executedAt": "2026-06-06T12:00:00.000Z"
    }
  ]
}
```
