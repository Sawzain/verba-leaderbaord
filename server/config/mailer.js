const { Resend } = require("resend");
const { BACKEND_ORIGIN, FRONTEND_REDIRECT } = require("./env");

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

// Sent when a member requests a password reset. Points at the frontend
// (not the backend, unlike verification) since the reset flow needs a
// form for the person to type their new password into.
async function sendPasswordResetEmail(user, token) {
  const resetUrl = `${FRONTEND_REDIRECT}/reset-password?token=${token}`;
  const html = `
    <p>Hi ${user.name},</p>
    <p>Someone requested a password reset for your Verba Book Club account.
    If this was you, set a new password here:</p>
    <p><a href="${resetUrl}">Reset my password</a></p>
    <p>This link expires in 1 hour and can only be used once. If you didn't
    request this, you can safely ignore this email — your password won't
    change.</p>
  `;
  if (!resend) {
    console.log(`[dev] Password reset link for ${user.email}: ${resetUrl}`);
    return;
  }
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: user.email,
      subject: "Reset your password — Verba Book Club",
      html,
    });
  } catch (err) {
    console.error("Failed to send password reset email", err);
  }
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
