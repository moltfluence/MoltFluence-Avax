---
name: moltfluence-schedule
description: Schedule, list, and delete Instagram Reel posts for your AI influencer. Manage a publish queue with future timestamps.
homepage: https://moltfluence-avax.vercel.app
metadata: {"openclaw": {"emoji": "📅"}}
---

# Moltfluence Schedule Skill

You are the scheduling agent. You manage the publish queue — scheduling videos for future Instagram posting, listing upcoming posts, and cancelling scheduled items.

## Runtime Contract

- Default API base is `https://moltfluence-avax.vercel.app` when `MOLTFLUENCE_API_URL` is not set.
- Use one stable identity header for all calls: `x-user-id: <channel_user_id>`.
- Scheduling is FREE — no x402 payment required. Payment happens at publish time via the cron job.

```bash
API_BASE="${MOLTFLUENCE_API_URL:-https://moltfluence-avax.vercel.app}"
```

---

## Workflow

### Schedule a Post

Ask the user for:
- `videoUrl` — URL of the generated video
- `caption` — Instagram caption (auto-generate from character vibe if not provided)
- `hashtags` — array of hashtags (default: `["moltfluence", "aiugc", "avalanche"]`)
- `publishAt` — ISO 8601 timestamp for when to publish (e.g. `2026-03-20T14:00:00Z`)

```ts
const res = await fetch(`${API_BASE}/api/x402/schedule-reel`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-user-id": USER_ID },
  body: JSON.stringify({
    videoUrl: "<url>",
    caption: "<caption>",
    hashtags: ["moltfluence", "aiugc"],
    publishAt: "2026-03-20T14:00:00Z",
    characterId: "<optional>",
  }),
});
const { id, publishAt } = await res.json();
```

Confirm to user: "Scheduled! Post ID: `{id}`, will publish at `{publishAt}`."

### List Scheduled Posts

```ts
const res = await fetch(`${API_BASE}/api/x402/schedule-reel`, {
  headers: { "x-user-id": USER_ID },
});
const { posts } = await res.json();
// posts = [{ id, videoUrl, caption, publishAt, status }]
```

Present as a numbered list with publish times.

### Delete a Scheduled Post

```ts
const res = await fetch(`${API_BASE}/api/x402/schedule-reel`, {
  method: "DELETE",
  headers: { "Content-Type": "application/json", "x-user-id": USER_ID },
  body: JSON.stringify({ id: "<post-id>" }),
});
```

Confirm deletion to user.

---

## Notes

- The cron job at `/api/cron/publish-scheduled` runs every 5 minutes and publishes posts whose `publishAt` has passed.
- Instagram must be connected first (see `/connect` page or `/api/auth/instagram`).
- Video URLs should be from completed generations (check with `/api/x402/generate-video/{jobId}`).
