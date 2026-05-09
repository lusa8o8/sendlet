import { Router } from "express";
import { Resend } from "resend";

const router = Router();

router.post("/deliver", async (req, res) => {
  const { to, fromEmail, fromName, apiKey, magnetTitle, magnetDescription, magnetUrl } =
    req.body as {
      to: string;
      fromEmail: string;
      fromName?: string;
      apiKey: string;
      magnetTitle: string;
      magnetDescription?: string;
      magnetUrl: string;
    };

  if (!to || !fromEmail || !apiKey || !magnetTitle || !magnetUrl) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

    const { error } = await resend.emails.send({
      from,
      to,
      subject: `Here's your copy of "${magnetTitle}"`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #111;">
          <h2 style="font-size: 22px; font-weight: 700; margin: 0 0 12px;">${magnetTitle}</h2>
          ${magnetDescription ? `<p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">${magnetDescription}</p>` : ""}
          <a
            href="${magnetUrl}"
            style="display: inline-block; background: #0F766E; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-bottom: 32px;"
          >
            Access your resource →
          </a>
          <p style="color: #999; font-size: 12px; margin: 0;">
            You signed up at
            <a href="${magnetUrl}" style="color: #999;">${magnetUrl}</a>.
            No spam — unsubscribe anytime.
          </p>
        </div>
      `,
    });

    if (error) {
      req.log.error(error, "resend error");
      res.status(500).json({ error: "Email send failed", detail: error.message });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    req.log.error(err, "deliver route error");
    res.status(500).json({ error: "Unexpected error" });
  }
});

export default router;
