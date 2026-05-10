# Sendlet Market Position

## Core Position

Sendlet is the boring, focused tool for publishing and delivering lead magnets.

It is not a funnel builder, email marketing platform, landing page builder, AI content generator, or CRM. The core promise is simple:

> Upload the thing. Publish the page. Collect the lead. Send the resource.

The market already has enough tools for creating content and building complex funnels. Sendlet should own the narrow moment after a creator already has a free resource and needs to make it available without setup friction.

## Category

Lead magnet hosting and delivery.

Alternative positioning lines:

- Lead magnet hosting for people who do not want a funnel builder.
- The simplest way to publish a free resource and collect the lead.
- A clean opt-in page without the setup.
- Lead magnet delivery that does not need a tutorial.

## What Sendlet Should Be Known For

1. Fastest path to live
   - Upload a file or paste a resource link.
   - Pick a clean page style.
   - Publish and collect leads.

2. Pages that always look good
   - Curated, recognizable Sendlet design.
   - Limited customization by design.
   - Locked typography, spacing, and layout quality.

3. Resource delivery that works
   - Automatic email delivery.
   - Thank-you page with download/open button.
   - Delivery logs and lead records.

4. Lead capture without platform baggage
   - No full email platform setup.
   - No automation builder.
   - No complex funnel logic.

## ICP

Primary early users:

- Solo creators with PDFs, guides, checklists, templates, worksheets, or Notion docs.
- Coaches and consultants using free resources to collect leads.
- Tutors and education creators distributing study guides or worksheets.
- Newsletter creators testing simple opt-in offers.
- Small service businesses that need one clean lead capture page.
- Small agencies creating simple lead magnets for clients.

Best first wedge:

> People who already have the resource and just need a clean way to publish, collect, and deliver it.

Avoid starting with users who need a full marketing suite, complex automations, sales funnels, or advanced design control.

## Product Philosophy

Stay boring until users pull us toward complexity.

Build only features that help someone publish, deliver, or measure a lead magnet faster.

Good features:

- Upload or paste resource link.
- Curated landing page styles.
- Optional/required name capture.
- Automatic delivery email.
- Thank-you/download page.
- Leads table.
- CSV export.
- Branding toggle on paid plans.
- Simple analytics.
- Custom domain later.
- Client folders/workspaces later.

Avoid for now:

- AI lead magnet generation.
- Full landing page builder.
- Email sequences.
- CRM features.
- Complex automations.
- Zapier-style workflow builder.
- Too many design controls.
- Checkout/payment flows.
- Multi-step funnels.

## Design Strategy

Sendlet pages should look like Sendlet pages.

The product should feel premium because it is constrained. Users should edit content and brand signals, not rebuild the page from scratch.

Recommended limits:

- 3 page styles max.
- 5-6 curated color themes.
- Locked typography.
- Locked spacing.
- Fixed form treatment.
- Editable title, description, CTA, logo/avatar, image, name field setting, and accent/theme.

This keeps pages recognizable, reduces support burden, and protects the product from becoming a generic landing page builder.

## Pricing Strategy

Start with a simple free tier and one paid beta tier.

Free:

- 1 live lead magnet.
- 100 leads/month.
- 100 delivery emails/month.
- 10MB max resource file.
- Sendlet branding.
- No custom domain.
- Limited export or recent-leads-only export.

Paid beta:

- $19/month.
- 10 live lead magnets.
- 2,000 leads/month.
- 2,000 delivery emails/month.
- 25MB max resource file.
- Remove Sendlet branding.
- Custom email copy.
- CSV export.
- Priority support.

Later tier split:

- Starter: $9/month.
- Creator: $19/month.
- Agency: $49/month.

Agency should include client folders/workspaces, higher lead limits, and more lead magnets.

## Cost Model

Current cost drivers:

- Vercel for frontend hosting and bandwidth.
- Supabase for database, storage, edge functions, and storage egress.
- Resend for delivery emails.
- Firebase Auth for creator authentication.
- Domain registration.

Early zero-cost stack:

- Vercel Hobby: $0.
- Supabase Free: $0.
- Resend Free: $0.
- Firebase Auth: $0 for current usage.
- Subdomain on existing domain: $0.

Commercial-ready stack estimate:

- Vercel Pro: about $20/month.
- Supabase Pro: about $25/month.
- Resend Pro when needed: about $20/month.
- Domain averaged monthly: about $1/month.

Estimated production baseline:

> $45-$65/month.

## Break-Even

Assuming a $65/month production baseline:

- At $19/month, break-even is about 4 paying customers.
- At $9/month, break-even is about 8 paying customers.
- At $49/month, break-even is about 2 agency customers.

The first commercial milestone:

> 4 paying users at $19/month.

## Margins

Expected SaaS gross margins are strong if abuse is controlled.

Approximate variable cost per 1,000 delivered leads:

- Resend email cost after free/pro included quota: roughly $0.90 per 1,000 emails.
- Supabase function costs are small at this scale.
- Storage egress depends on resource size:
  - 5MB file: about 5GB per 1,000 downloads.
  - 10MB file: about 10GB per 1,000 downloads.
  - 25MB file: about 25GB per 1,000 downloads.

Practical estimate:

> $1.50-$3.50 per 1,000 delivered leads, depending mostly on file size and egress.

At $19/month with sane usage caps, gross margins should sit around 80-90%+ after fixed infrastructure is covered.

## Abuse Controls

The core flow is intentionally fast, so limits need to be present early.

Risks:

- Free file hosting abuse.
- Large-file storage and egress abuse.
- High-volume email delivery abuse.
- Throwaway spam pages.
- Low-quality lead capture pages hurting sender reputation.

Recommended controls:

- Free max file size: 10MB.
- Paid beta max file size: 25MB.
- Free live lead magnets: 1.
- Free leads/month: 100.
- Free delivery emails/month: 100.
- Rate limit lead captures per page/IP.
- Require authenticated creator before publish.
- Keep Sendlet branding on free pages.
- Add abuse/report path later.

## Market Context

Sendlet sits between several larger markets:

- Creator tools.
- Landing page software.
- Email marketing software.
- Lead generation software.
- Digital product delivery.

The opportunity is not to replace those categories. The opportunity is to become the default tiny tool people use when they need a lead magnet live quickly.

Viability examples:

- 100 customers at $19/month = $1,900 MRR.
- 500 customers at $19/month = $9,500 MRR.
- 1,000 customers at $19/month = $19,000 MRR.

This does not need to become a huge platform early to be a strong business.

## Go-To-Market

Initial manual offer:

> Send me your lead magnet. I will publish it for you in 10 minutes.

Use this to learn from real users before expanding the product.

Target channels:

- Reddit creator, marketing, newsletter, and small business communities.
- X/Twitter creators.
- Coaches and consultants.
- Tutors and education creators.
- Indie hackers.
- Gumroad and Notion template sellers.
- Small agencies.

Early objective:

- 20 real users.
- 5 paying users.
- 100+ lead captures across real pages.
- 10 repeated support/conversation notes before adding major features.

## Strategic Rule

Do not build a feature because it is interesting.

Build it only if it strengthens one of these:

- Publish faster.
- Deliver more reliably.
- Capture leads more cleanly.
- Measure performance more clearly.
- Reduce setup friction.

Sendlet wins by staying focused.
