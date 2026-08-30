// Runs a zod schema against req.body before the route handler runs. On
// success, req.body is replaced with the parsed result — trimmed,
// coerced, defaulted per the schema — so handlers can trust their input
// instead of re-checking it. On failure, returns the same
// { error: "..." } shape every other route already uses, so the
// frontend doesn't need to special-case validation errors.
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues[0]?.message || "Invalid request";
      return res.status(400).json({ error: message });
    }
    req.body = result.data;
    next();
  };
}

module.exports = validate;
