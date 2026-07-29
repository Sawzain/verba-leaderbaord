const { Resend } = require("resend");
const { BACKEND_ORIGIN } = require("./env");

// Email verification (Resend). Optional — if RESEND_API_KEY isn't set,
// verification links get logged to the console instead of emailed, so
// local dev doesn't require a Resend account.
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

async function sendVerificationEmail(user, token) {
  const verifyUrl = `${BACKEND_ORIGIN}/api/auth/verify?token=${token}`;
  const html = `
    <p>Hi ${user.name},</p>
    <p>Confirm your email for Verba Book Club to start submitting reviews:</p>
    <p><a href="${verifyUrl}">Verify my email</a></p>
    <p>This link expires in 24 hours.</p>
  `;
  if (!resend) {
    console.log(`[dev] Verification link for ${user.email}: ${verifyUrl}`);
    return;
  }
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: user.email,
      subject: "Verify your email — Verba Book Club",
      html,
    });
  } catch (err) {
    console.error("Failed to send verification email", err);
  }
}

module.exports = { sendVerificationEmail };
