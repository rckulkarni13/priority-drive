# MCP task creation for Priority Drive — feasibility and effort

## Prerequisites

1. **Enable OAuth Server in your Supabase dashboard.** The OAuth Apps page shows the feature is present but currently disabled. Click **OAuth Server Settings** → enable it. This is the only manual dependency.
2. **Confirm the published app has a `/favicon.ico`** (so the connector list shows the app icon). If not, we'll add one.

## Auth: use OAuth 2.1 instead of a personal access token

Your instinct is right that the server must act as *you*, never with elevated access. It does not need a hand-rolled token screen. Supabase can act as an OAuth 2.1 authorization server with dynamic client registration; the MCP server then verifies the caller's token and every database call runs as that signed-in user, with existing RLS untouched.

What that buys us:
- No new tokens table, no hashing, no rotation/revoke UI, no settings screen to build and maintain.
- No long-lived secret pasted into third-party agent configs.
- Connecting is a normal "sign in and approve" flow in the calling agent.

What it costs: one consent screen route in the app (`/.lovable/oauth/consent`) and making the sign-in page carry a redirect target through password/social login. That is less work than the token screen it replaces.

Because your Supabase project already shows OAuth Apps / OAuth Server (disabled), enabling it is the resolution. If you can't enable it for some reason (plan restriction, feature not available), we will fall back to the personal-access-token design you described — roughly a day of extra work (table, generate/revoke UI, token verification in the server) and a weaker security posture.

## Scope

**Three MCP tools**

| Tool | Behavior |
| --- | --- |
| `list_workspaces` | Returns the signed-in user's workspaces with id, name, type, and the workspace's own terminology (Domain/Subject/Area etc.) so the agent speaks the user's language. |
| `list_structure` | Given a workspace, returns its Domains, Pillars and Themes with parent links, so the agent can match against what exists. Read-only. |
| `create_task` | Requires workspace, target Theme, title. Optional priority (default medium), status (default open), due date, prioritized date range. Rejects unknown/mismatched IDs with a message telling the agent to ask the user. |

**Placement guardrails, enforced server-side (not just prompt text)**
- The target Theme must exist, belong to the named workspace, and belong to the calling user.
- `create_task` accepts an ID, never a free-text theme name — so the agent must have called `list_structure` and made a real match.
- No fuzzy matching and no "create it if missing." A miss returns an error the agent surfaces as a question.

**Reused as-is:** existing `tasks` / `task_themes` schema, `task_order` ordering, priority/status enums, workspace terminology map. No migration needed for v1.

**Explicitly out (as you specified):** creating Domains/Pillars/Themes, updating/completing/reading tasks, applying Checklists, any Asana/email/Station One integration.

## Effort

| Piece | Effort |
| --- | --- |
| MCP server scaffold + 3 tools + Supabase-as-user client | ~half a day |
| OAuth wiring: enable authorization server, consent route, redirect-preserving sign-in | ~half a day |
| Favicon/branding for the connector listing, manifest, deploy | small |
| Manual verification from a real MCP client (list → create → confirm task shows in app) | ~half a day |

Ballpark: **1–1.5 days of build**, assuming Supabase OAuth 2.1 is available on the connected project. Add ~1 day if we have to fall back to personal access tokens.

## Challenges worth knowing about

1. **External Supabase + OAuth availability** — the one real gating risk; worth checking before anything else is built.
2. **Terminology leakage** — an agent told to file under "Health" in Home is talking about a Project, not a Theme. Returning per-workspace terminology from `list_workspaces` avoids the agent guessing wrong vocabulary back at the user.
3. **Tool descriptions are the product** — with no UI, the tool names, descriptions and error strings *are* how the agent behaves. The "ask, don't guess" rule has to be stated in the tool description and reinforced by strict server-side validation, because prompt guidance alone gets ignored under pressure.
4. **Date extraction quality** — "due Friday" resolved by the calling agent can land in the wrong week across timezones. v1 should accept explicit ISO dates only and let the agent do the resolution, so a wrong date is visibly the agent's interpretation.
5. **Ordering** — new tasks need a sensible `task_order` within the Theme; append-to-end matching current app behavior.
6. **Every MCP change needs a redeploy** — connected clients keep seeing the old tool list until the function is redeployed. Just an operational habit, not a blocker.

## Recommendation

Build v1 exactly as scoped, with OAuth rather than a PAT. The read-query use case ("what's overdue") is correctly deferred — it overlaps Overview and would double the surface area. Once creation is proven in daily use, applying a Checklist via MCP is the natural next addition, since it reuses the same Theme-resolution logic.
