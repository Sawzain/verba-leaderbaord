const { z } = require("zod");

// register's password.min(8) also covers the old "password is required"
// check — an empty string already fails min(8), so there's no need for
// a separate presence check.
const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Enter a valid email").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const resetPasswordSchema = z.object({
  token: z
    .string()
    .trim()
    .min(1, "This reset link is invalid or has expired."),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

module.exports = { registerSchema, resetPasswordSchema };
