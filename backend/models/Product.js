import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // ── Core ──────────────────────────────────────────────────────────────────
    name:        { type: String, required: true },
    price:       { type: Number, required: true },
    description: { type: String, default: "" },
    imageUrl:    { type: String, default: "" },
    images:      { type: [String], default: [] },

    // ── Classification ────────────────────────────────────────────────────────
    category:    { type: String, enum: ["Men", "Women", "Kids", "Unisex"], required: true },
    brand:       { type: String, default: "" },

    // ── Frame attributes ──────────────────────────────────────────────────────
    frameType:   { type: String, default: "" },   // Full Rim / Half Rim / Rimless
    frameShape:  { type: String, default: "" },   // Round / Square / Aviator …
    frameSize:   { type: String, default: "" },   // Small / Medium / Large
    frameColor:  { type: [String], default: [] }, // Black, Blue, Gold …
    material:    { type: String, default: "" },   // Metal / Plastic / Titanium …
    weight:      { type: String, default: "" },   // Lightweight / Medium / Heavy

    // ── Fit & Style ───────────────────────────────────────────────────────────
    faceShape:   { type: [String], default: [] }, // Oval / Round / Square …
    occasion:    { type: [String], default: [] }, // Casual / Office / Party …
    clothesMatcher: { type: [String], default: [] }, // Formal / Casual / Ethnic …
    looksFinder: { type: [String], default: [] }, // Professional / Trendy …
    vibeCheck:   { type: [String], default: [] }, // Classic / Cool / Bold …

    // ── Product details ───────────────────────────────────────────────────────
    countryOfOrigin: { type: String, default: "" },
    computerGlasses: { type: Boolean, default: false },

    // ── Trust badges ─────────────────────────────────────────────────────────
    trustBadges: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
