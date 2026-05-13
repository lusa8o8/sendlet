# Sendlet Beta Launch Plan

## Launch Principle

Sendlet stays boring on purpose: publish the lead magnet, collect the lead, deliver the resource, and export or send the lead somewhere useful.

Each phase should use local discovery only. Inspect the code and data path for that phase, make the smallest reliable change, then verify it before moving on.

## Phase 1: Launch Control

Goal: prevent abuse and make beta manageable without Stripe.

Discovery:

- Inspect the auth, user, and workspace model.
- Find where lead magnets, leads, delivery events, and dashboard data are counted.
- Confirm the cleanest place to enforce beta limits.

Build:

- Add workspace-level beta fields:
  - `plan`
  - `beta_status`
  - `lead_magnet_limit`
  - `lead_limit`
  - `email_send_limit`
  - optional file-size limit
- Default new workspaces to a limited beta plan.
- Enforce limits server-side:
  - published lead magnets
  - monthly leads
  - monthly delivery emails
  - uploaded file size
- Add readable limit messages and an upgrade/contact path.

Ship condition:

- Users can still try the full core flow.
- Abuse is capped.
- We can manually upgrade users in Supabase.

## Phase 2: Core Flow Hardening

Goal: make the current product reliable enough for strangers.

Discovery:

- Walk through guest upload/link to design to delivery email to auth to publish to public opt-in to delivery.
- Check where draft state can be lost.
- Check whether uploaded files always attach correctly after auth and publish.
- Check whether edited public pages update without changing links.

Build:

- Fix remaining file/link attachment issues.
- Ensure edits update the same public URL.
- Add publish checklist or warnings for:
  - resource attached or link pasted
  - creator name/avatar visible
  - delivery email on/off
  - name field off/optional/required
- Make failed states readable.

Ship condition:

- One fresh uploaded-file test works without developer intervention.
- One pasted-link test works without developer intervention.
- One edit-after-publish reflects on the same link.

## Phase 3: Dashboard And Leads

Goal: make the app useful after publishing.

Discovery:

- Review current dashboard data path and lead page data path.
- Confirm conversion calculation is correct.
- Confirm client-side export is acceptable within beta limits.

Build:

- Keep dashboard fast with skeleton/loading states.
- Make conversion rate clear:
  - visits
  - leads
  - conversion percentage
- Tighten Leads page:
  - search
  - filter by lead magnet
  - export filtered
  - export all loaded
- Keep server export documented until beta limits require it.

Ship condition:

- User can see whether a page is working.
- User can export leads without asking for help.

## Phase 4: Integrations Lite

Goal: support power users without becoming an integrations platform.

Discovery:

- Inspect webhook save, load, and test paths.
- Confirm payload includes useful fields:
  - email
  - name
  - resource title
  - slug
  - public URL
  - timestamp
  - source/referrer when available

Build:

- Keep one webhook only.
- Add "Send test webhook".
- Add last delivery status if cheap.
- Keep CSV export as the fallback integration.

Ship condition:

- Zapier, Make, n8n, and API users can connect Sendlet quickly.
- Non-technical users can ignore the page entirely.

## Phase 5: Broadcast Decision

Goal: avoid accidentally becoming an email marketing suite.

Discovery:

- Audit current broadcast UI and backend state.
- Decide whether it is stable enough to expose.
- Check if it can accidentally send real emails in confusing ways.

Build option A:

- Hide it from navigation for beta.
- Leave code dormant.

Build option B:

- Rename it to "Announcements".
- Restrict it to one-shot simple emails.
- No sequences.
- No automations.
- No campaign builder.

Ship condition:

- If exposed, it supports the lead magnet workflow.
- If not ready, it does not distract beta users.

## Phase 6: Payment Readiness

Goal: collect money without overbuilding billing.

Discovery:

- Check where plan enforcement reads from.
- Identify the minimum manual upgrade flow.

Build:

- Add "Upgrade beta access" CTA.
- Use Stripe Payment Links or manual invoices externally.
- Store plan manually in Supabase.
- Defer full Stripe checkout, webhooks, and customer portal.

Ship condition:

- We can accept payment today.
- We can unlock users manually in under two minutes.
- No full billing system is required.

## Phase 7: Beta Launch Ops

Goal: get useful feedback and revenue quickly.

Build:

- Add feedback/contact link.
- Add a short FAQ covering:
  - how to publish
  - how delivery works
  - how exports work
  - what beta limits are
- Create an internal beta tracker:
  - user email
  - niche
  - published page?
  - leads collected?
  - paid?
  - requested feature
  - blocker

Launch:

- Invite 10 to 20 targeted users.
- Watch the first few flows closely.
- Only fix issues that block publishing, delivery, or lead collection.

## Execution Order

1. Launch control and limits.
2. Core flow hardening.
3. Dashboard and leads polish.
4. Integrations lite.
5. Broadcast decision.
6. Payment readiness.
7. Beta ops.

