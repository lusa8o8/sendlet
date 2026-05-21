import { Link } from "wouter";
import { Send } from "lucide-react";

const supportEmail = import.meta.env.VITE_SENDLET_SUPPORT_EMAIL ?? "support@sendlet.trymyapp.uk";
const lastUpdated = "May 21, 2026";

function PublicHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Send className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight">Sendlet</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
          <Link href="/sign-in" className="hover:text-foreground">Sign in</Link>
        </nav>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Sendlet is operated by Eight Zero Eight Digital Systems.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/refund-policy" className="hover:text-foreground">Refunds</Link>
        </div>
      </div>
    </footer>
  );
}

function PageShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background font-sans">
      <PublicHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Sendlet</p>
        <h1 className="mb-8 max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        <div className="prose prose-slate max-w-none prose-headings:tracking-tight prose-a:text-primary">
          {children}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

export function PricingPage() {
  return (
    <PageShell title="Simple lead magnet pages without the funnel-builder mess">
      <p>
        Upload a file or paste a link. Build a clean opt-in page. Collect the lead. Deliver the
        resource automatically.
      </p>
      <p>
        Sendlet is for creators, educators, consultants, coaches, agencies, and small businesses
        that need a lightweight way to publish lead magnets without setting up a full funnel builder
        or email marketing suite.
      </p>

      <h2>Early access pricing</h2>
      <div className="not-prose grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-base font-semibold">Starter</h3>
          <p className="mt-2 text-3xl font-bold">$9.99</p>
          <p className="text-sm text-muted-foreground">per month</p>
          <p className="mt-4 text-sm text-muted-foreground">
            For creators publishing a few focused lead magnets.
          </p>
        </div>
        <div className="rounded-xl border border-primary bg-card p-5 shadow-sm">
          <h3 className="text-base font-semibold">Pro</h3>
          <p className="mt-2 text-3xl font-bold">$29.99</p>
          <p className="text-sm text-muted-foreground">per month</p>
          <p className="mt-4 text-sm text-muted-foreground">
            For operators who publish regularly and need more room.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-base font-semibold">Agency</h3>
          <p className="mt-2 text-3xl font-bold">$59.99</p>
          <p className="text-sm text-muted-foreground">per month</p>
          <p className="mt-4 text-sm text-muted-foreground">
            For teams managing lead magnets across multiple clients or campaigns.
          </p>
        </div>
      </div>

      <h2>Included during early access</h2>
      <ul>
        <li>Lead magnet landing pages</li>
        <li>File upload or hosted-link delivery</li>
        <li>Email lead collection</li>
        <li>Automatic resource delivery email</li>
        <li>CSV lead export</li>
        <li>Simple page layouts and restrained design controls</li>
        <li>Draft and publish workflow</li>
        <li>Webhooks and simple integrations where available</li>
        <li>Founder-led support during early access</li>
      </ul>

      <h2>What Sendlet is good for</h2>
      <p>
        Use Sendlet to publish PDF guides, checklists, worksheets, templates, mini-courses,
        resource lists, private links, downloadable files, and simple opt-in pages for campaigns.
      </p>

      <h2>What Sendlet is not</h2>
      <p>
        Sendlet is not a full email marketing broadcast platform, CRM, funnel builder, marketplace,
        payment processor, legal service, financial service, or regulated-content platform.
      </p>

      <h2>Billing</h2>
      <p>
        Plans renew monthly unless cancelled. You can cancel before your next billing period to
        avoid future charges. Fees already paid are handled under our Refund Policy.
      </p>
    </PageShell>
  );
}

export function TermsPage() {
  return (
    <PageShell title="Terms of Service">
      <p><strong>Last updated:</strong> {lastUpdated}</p>
      <p>
        These Terms of Service govern your access to and use of Sendlet. Sendlet is a product owned
        and operated by <strong>Eight Zero Eight Digital Systems</strong>. Sendlet is a product and
        brand, not a separate registered company.
      </p>

      <h2>1. Who we are</h2>
      <p>
        Operator: Eight Zero Eight Digital Systems. Product: Sendlet. Location: Lusaka, Zambia.
        Contact: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
      </p>

      <h2>2. What Sendlet does</h2>
      <p>
        Sendlet helps users upload or link a digital resource, create a simple opt-in landing page,
        collect email leads, automatically deliver the resource by email, export lead data, and
        connect simple integrations or webhooks where available.
      </p>

      <h2>3. What Sendlet is not</h2>
      <p>
        Sendlet is not an email marketing broadcast platform, full CRM, full funnel builder,
        marketplace, payment processor, legal, tax, financial, accounting, or regulated-content
        hosting service. You should not rely on Sendlet as your only copy of important files or
        business records.
      </p>

      <h2>4. Accounts</h2>
      <p>
        You are responsible for providing accurate account information, keeping your login secure,
        all activity under your account, and making sure anyone using your account follows these
        Terms.
      </p>

      <h2>5. Your content and resources</h2>
      <p>
        You keep ownership of the files, links, text, images, landing page content, and lead magnet
        resources you upload, link, or create through Sendlet. You give Sendlet permission to host,
        copy, process, display, send, and deliver your content only as needed to provide the service.
      </p>
      <p>
        You are responsible for the accuracy and legality of your content, having the rights to use
        it, making sure your lead magnet does not infringe someone else's rights, and making sure
        your claims, offers, and descriptions are truthful.
      </p>

      <h2>6. Lead collection and email permission</h2>
      <p>
        Sendlet helps you collect email addresses from people who choose to request your resource.
        You are responsible for having permission or another lawful basis to collect and use lead
        information, explaining what the person is signing up for, and complying with email
        marketing, privacy, consumer protection, and anti-spam laws that apply to you.
      </p>

      <h2>7. Prohibited content and use</h2>
      <p>
        You must not use Sendlet for unlawful, harmful, abusive, hateful, sexually explicit,
        infringing, misleading, fraudulent, spam, phishing, malware, credential-harvesting,
        impersonation, regulated, dangerous, or high-risk content. You must not use Sendlet to send
        spam, harvest email addresses without permission, bypass security, overload the service,
        reverse engineer the service, or resell Sendlet without permission.
      </p>

      <h2>8. Files, links, and storage</h2>
      <p>
        Sendlet may limit file size, file types, storage, bandwidth, page views, leads, published
        pages, email delivery volume, and webhook or integration usage. We may refuse or remove files
        that create security, legal, operational, or abuse risk.
      </p>

      <h2>9. Third-party services</h2>
      <p>
        Sendlet may rely on third-party services for hosting, storage, authentication, analytics,
        payments, email delivery, or integrations. Third-party services may have their own terms and
        privacy policies.
      </p>

      <h2>10. Payments, cancellations, and refunds</h2>
      <p>
        Paid plans are billed according to the plan you select at checkout. Subscriptions renew
        automatically until cancelled unless stated otherwise. Cancellation stops future renewal
        charges. It does not automatically refund previous charges unless our Refund Policy says a
        refund applies.
      </p>

      <h2>11. Availability and changes</h2>
      <p>
        Sendlet is an early-stage product. We aim to keep the service available, but we do not
        guarantee uninterrupted or error-free operation. We may update, change, add, remove, or limit
        features.
      </p>

      <h2>12. Suspension and termination</h2>
      <p>
        We may suspend or terminate access if you violate these Terms, create legal, security,
        abuse, or deliverability risk, fail to pay, or if we are required to do so by law or a
        service provider.
      </p>

      <h2>13. Data export and deletion</h2>
      <p>
        Where available, you may export your leads as CSV. You may request deletion of your account
        or data by contacting us. Some information may be retained where needed for legal, tax,
        fraud prevention, security, dispute resolution, or legitimate business records.
      </p>

      <h2>14. Disclaimers and liability</h2>
      <p>
        Sendlet is provided on an "as is" and "as available" basis. We do not guarantee that your
        lead magnet will generate leads, that emails will always be delivered to inboxes, that pages
        will convert in a specific way, or that Sendlet will meet every legal requirement that
        applies to your business.
      </p>
      <p>
        To the fullest extent allowed by law, Sendlet and Eight Zero Eight Digital Systems will not
        be liable for indirect, incidental, special, consequential, or punitive damages, or for lost
        profits, lost leads, lost revenue, loss of goodwill, loss of data, or business interruption.
      </p>

      <h2>15. Governing law</h2>
      <p>These Terms are governed by the laws of Zambia, unless another law is required to apply.</p>

      <h2>16. Contact</h2>
      <p>Questions about these Terms can be sent to <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.</p>
    </PageShell>
  );
}

export function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy">
      <p><strong>Last updated:</strong> {lastUpdated}</p>
      <p>
        This Privacy Policy explains how Sendlet collects, uses, stores, and shares information.
        Sendlet is a product owned and operated by <strong>Eight Zero Eight Digital Systems</strong>.
      </p>

      <h2>1. Who this policy applies to</h2>
      <p>
        This policy applies to Sendlet account users, people who create lead magnet pages, visitors
        who submit their email address through a Sendlet page, and people who contact us for support
        or product questions.
      </p>

      <h2>2. Information we collect</h2>
      <p>
        We may collect account information such as name, email address, login information, profile
        information, workspace information, settings, billing status, and support messages.
      </p>
      <p>
        When you create a lead magnet page, we may store page titles, descriptions, design settings,
        uploaded images, uploaded files, resource links, form fields, delivery email settings,
        published page URLs, page status, and activity.
      </p>
      <p>
        When someone submits a Sendlet opt-in form, we may collect their email address, name if
        requested by the page owner, the page or resource requested, submission time, and technical
        information needed to process the request.
      </p>
      <p>
        We may also collect technical information such as IP address, browser type, device
        information, pages viewed, event logs, error logs, security logs, usage data, and cookies or
        similar technologies where used.
      </p>

      <h2>3. How we use information</h2>
      <p>
        We use information to create and manage accounts, let users publish lead magnet pages, host
        or link resources, collect leads, deliver requested resources by email, provide CSV exports,
        operate webhooks and integrations, manage subscriptions and billing, provide support, improve
        reliability, prevent abuse, and comply with legal or operational obligations.
      </p>

      <h2>4. Responsibility for lead consent</h2>
      <p>
        Sendlet users are responsible for making sure they have permission or another lawful basis to
        collect and use leads. Page owners are responsible for explaining what the lead will receive,
        not misleading people, only emailing leads where allowed, and providing required unsubscribe,
        opt-out, or contact options.
      </p>

      <h2>5. How we share information</h2>
      <p>
        We may share information with service providers that help us operate Sendlet, such as
        hosting, database and storage, authentication, email delivery, payment processing, analytics,
        error monitoring, customer support, and integration providers.
      </p>
      <p>
        We may also share information where required to comply with law, respond to valid legal
        requests, enforce our Terms, protect Sendlet, investigate abuse, or respond to fraud and
        security incidents.
      </p>

      <h2>6. International processing</h2>
      <p>
        Sendlet may use providers that process or store information outside Zambia. Where applicable,
        we aim to use appropriate safeguards for cross-border processing.
      </p>

      <h2>7. Retention</h2>
      <p>
        We keep information only for as long as reasonably needed. Account data is kept while the
        account is active, lead data while the user needs it for their workflow, uploaded files and
        pages while stored or published, logs for operational and security purposes, and billing or
        legal records as required for tax, accounting, disputes, and compliance.
      </p>

      <h2>8. Deletion and export</h2>
      <p>
        Users may request deletion of their account or certain data by contacting us at{" "}
        <a href={`mailto:${supportEmail}`}>{supportEmail}</a>. Where available, users can export
        leads as CSV.
      </p>

      <h2>9. Security</h2>
      <p>
        We use reasonable technical and organisational measures to protect information. No online
        service can guarantee perfect security. Users are responsible for keeping their account
        credentials secure.
      </p>

      <h2>10. Cookies and similar technologies</h2>
      <p>
        Sendlet may use cookies or similar technologies for login, security, preferences, analytics,
        and product functionality.
      </p>

      <h2>11. Your rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct, delete, object to, or
        request a copy of your personal information. To make a request, contact us at{" "}
        <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
      </p>

      <h2>12. Contact</h2>
      <p>Questions about privacy can be sent to <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.</p>
    </PageShell>
  );
}

export function RefundPolicyPage() {
  return (
    <PageShell title="Refund Policy">
      <p><strong>Last updated:</strong> {lastUpdated}</p>
      <p>
        This Refund Policy explains how refunds work for Sendlet. Sendlet is a product owned and
        operated by <strong>Eight Zero Eight Digital Systems</strong>.
      </p>

      <h2>1. General approach</h2>
      <p>
        Sendlet is an early-stage SaaS product. Before subscribing, please review the product
        description, current feature limitations, file upload limits, integration availability, and
        whether Sendlet fits your lead magnet workflow.
      </p>

      <h2>2. Subscription billing</h2>
      <p>
        If you subscribe to a paid plan, your subscription renews until cancelled. You may cancel
        before your next billing date to avoid future charges. Cancellation stops future renewals. It
        does not automatically refund past charges.
      </p>

      <h2>3. Refund window</h2>
      <p>
        You may request a refund within <strong>7 days of your first paid subscription</strong> if
        Sendlet does not work for your intended use.
      </p>
      <p>
        To request a refund, contact us at <a href={`mailto:${supportEmail}`}>{supportEmail}</a>{" "}
        with the email used for purchase, date of purchase, reason for the request, and any issue
        you experienced.
      </p>

      <h2>4. When refunds may be declined</h2>
      <p>
        We may decline a refund if the request is made after the refund window, the account has
        already received substantial use, the issue is caused by unsupported use or third-party
        tools, the user violated our Terms, the account was used for spam or unlawful content, the
        payment processor does not permit the refund, or the request appears fraudulent or abusive.
      </p>

      <h2>5. No refunds for disclosed limitations</h2>
      <p>
        Refunds are generally not provided because of features that Sendlet clearly did not offer at
        the time of purchase. Unless stated otherwise, Sendlet is not sold as a full email marketing
        platform, funnel builder, CRM, payment processor, marketplace, legal service, or guaranteed
        lead-generation service.
      </p>

      <h2>6. Service issues</h2>
      <p>
        If Sendlet has a major service failure that prevents core use of the product, contact us. We
        may, at our discretion, offer a refund, partial refund, credit, extra access time, or support
        to resolve the issue.
      </p>

      <h2>7. Payment processor rules</h2>
      <p>
        Refunds may be processed through a third-party payment provider and may be subject to that
        provider's rules, timelines, fees, fraud controls, and regional limitations.
      </p>

      <h2>8. Contact</h2>
      <p>Refund requests can be sent to <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.</p>
    </PageShell>
  );
}
