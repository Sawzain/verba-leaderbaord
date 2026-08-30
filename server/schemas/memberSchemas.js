const { z } = require("zod");

// .catch(0) mirrors the original `Number(req.body.score) || 0` — any
// missing or non-numeric value falls back to 0 instead of rejecting.
const addMemberSchema = z.object({
  username: z.string().trim().min(1, "Name is required"),
  score: z.coerce.number().catch(0),
});

// Both fields optional (PUT can update either independently, or neither
// — an empty body is a harmless no-op, same as before). score >= 0 is a
// new guard that wasn't enforced server-side previously; the frontend
// already clamps to Math.max(0, ...) before sending, so this just makes
// that expectation a real server-side rule instead of a client-only one.
const updateMemberSchema = z.object({
  score: z.coerce.number().min(0, "Score can't be negative").optional(),
  username: z.string().trim().min(1, "Name can't be empty").optional(),
});

module.exports = { addMemberSchema, updateMemberSchema };
