API Help: chatjimmy-proxy
WHY THIS EXISTS
ChatJimmy.ai is a demo chatbot built by Taalas (taalas.com) to showcase their HC1 chip — custom silicon that hardwires Meta's Llama 3.1 8B directly into the hardware. The result: ~17,000 tokens per second per user, roughly 10x faster than the next fastest inference provider, at a fraction of the cost and power.
But a chatbot is just a toy. The real power of sub-millisecond inference is in programmatic access — applications where microseconds matter: real-time agents, high-frequency decision loops, latency-sensitive pipelines, and any workflow where waiting 500ms for a response is a dealbreaker.
This proxy exists to unlock that power. It wraps ChatJimmy's frontend-only interface in a clean, OpenAI-compatible API so developers can build real applications on top of the fastest inference hardware in the world.
Architecture: Your app → This proxy → Taalas HC1 silicon → response in under 5ms.
Base URL: <https://private-llm-proxy.redacted.invalid>
Authentication: none required.
Upstream: chatjimmy.ai running Llama 3.1 8B by Taalas Inc.
POST /api/chat
Proxy chat endpoint with streaming output by default and optional JSON mode via ?format=json.
Streaming mode (default)
curl -N -X POST "<https://private-llm-proxy.redacted.invalid/api/chat>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain what this API does",
    "history": [
      { "role": "user", "content": "Hi" },
      { "role": "assistant", "content": "Hello!" }
    ]
  }'
JSON mode (?format=json)
curl -X POST "<https://private-llm-proxy.redacted.invalid/api/chat?format=json>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain what this API does",
    "history": [],
    "chatOptions": {
      "selectedModel": "llama3.1-8B",
      "systemPrompt": "",
      "topK": 8
    }
  }'
Request body schema
{
  "message": "string (required)",
  "history": [
    {
      "role": "string (default: "user")",
      "content": "string (default: "")"
    }
  ],
  "chatOptions": {
    "selectedModel": "string (default forwarded upstream: "llama3.1-8B")",
    "systemPrompt": "string (default: "")",
    "topK": "number (default: 8)"
  }
}
JSON response schema (?format=json)
{
  "id": "string",
  "object": "chat.completion",
  "created": "number (unix seconds)",
  "model": "string",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "string" },
      "finish_reason": "string"
    }
  ],
  "usage": {
    "prefill_tokens": "number | null",
    "decode_tokens": "number | null",
    "total_tokens": "number | null",
    "total_duration": "number | null"
  }
}
GET /api/health
Checks proxy + upstream health and includes latency in milliseconds.
Example request
curl "<https://private-llm-proxy.redacted.invalid/api/health>"
Example response
{
  "proxy": "ok",
  "latencyMs": 123,
  "upstreamStatus": 200,
  "upstream": {
    "status": "ok"
  }
}
GET /api/models
Returns model metadata proxied directly from the upstream API.
Example request
curl "<https://private-llm-proxy.redacted.invalid/api/models>"
Example response
[
  {
    "id": "llama3.1-8B",
    "name": "Llama 3.1 8B",
    "provider": "Taalas Inc."
  }
]
POST /v1/chat/completions
OpenAI-compatible chat completions endpoint. Works as a drop-in backend for any standard OpenAI SDK client. Supports both streaming (SSE) and non-streaming responses. Note: /api/v1/chat/completions also works as a direct path.
Non-streaming request
curl -X POST "<https://private-llm-proxy.redacted.invalid/v1/chat/completions>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.1-8B",
    "messages": [
      {"role": "system", "content": "You are helpful."},
      {"role": "user", "content": "What is 2+2?"}
    ],
    "stream": false
  }'
Streaming request (SSE)
curl -N -X POST "<https://private-llm-proxy.redacted.invalid/v1/chat/completions>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.1-8B",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "stream": true
  }'
Python OpenAI SDK example
from openai import OpenAI

client = OpenAI(
    base_url="<https://private-llm-proxy.redacted.invalid/v1>",
    api_key="anything"
)
response = client.chat.completions.create(
    model="llama3.1-8B",
    messages=[
        {"role": "system", "content": "You are helpful."},
        {"role": "user", "content": "What is 2+2?"}
    ]
)
print(response.choices[0].message.content)
Request body schema
{
  "model": "string (default: "llama3.1-8B")",
  "messages": [
    { "role": "system | user | assistant", "content": "string" }
  ],
  "stream": "boolean (default: false)",
  "top_k": "number (default: 8, also accepts topK)"
}
Non-streaming response schema
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1725840132,
  "model": "llama3.1-8B",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "string" },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": -1,
    "completion_tokens": -1,
    "total_tokens": -1
  }
}
```

---

## Use in Varkly voice quiz

The voice quiz uses an LLM to map the user’s spoken answer to VARK option IDs (see `src/utils/voice/vark-mapper.ts` → `src/utils/voice/llm-client.ts`). You can point that flow at the ChatJimmy proxy instead of OpenRouter:

1. In `.env` (or `.env.local`), set:
   ```bash
   VITE_LLM_BASE_URL=https://private-llm-proxy.redacted.invalid/v1
   ```
2. Leave `VITE_OPENROUTER_API_KEY` unset or remove it. When `VITE_LLM_BASE_URL` is set, the app uses the OpenAI-compatible endpoint and ignores OpenRouter.
3. Restart the dev server (`npm run dev`) and run the voice quiz at `/quiz/voice`. After you speak an answer, the proxy is called with a single user message containing the mapping prompt; the model defaults to `llama3.1-8B`.

No API key is required for the proxy. The client sends `POST {baseUrl}/chat/completions` with `model`, `messages`, `max_tokens`, and `stream: false`.
