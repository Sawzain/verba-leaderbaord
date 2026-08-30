const { z } = require("zod");

// text has no max() here on purpose — the route truncates to 2000 chars
// itself after validation (see reviews.js), matching the original
// silent-truncate behavior rather than rejecting long text outright.
const editReviewSchema = z.object({
  rating: z.coerce
    .number()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5")
    .optional(),
  text: z.string().optional(),
});

module.exports = { editReviewSchema };
