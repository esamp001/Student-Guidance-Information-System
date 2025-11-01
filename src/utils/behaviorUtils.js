// utils/behaviorUtils.js
export const analyzeBehavior = (note) => {
  if (!note) {
    return {
      label: "General Behavior",
      color: "grey.500",
      emoji: "💬",
      score: 0,
    };
  }

  const text = note.toLowerCase();
  let score = 0;

  // Weighted scoring system (negative terms have higher priority)
  if (
    text.includes("poor") ||
    text.includes("disciplinary") ||
    text.includes("bad")
  )
    score -= 3;

  if (
    text.includes("warning") ||
    text.includes("attention") ||
    text.includes("needs improvement")
  )
    score -= 2;

  if (text.includes("average") || text.includes("satisfactory")) score += 0;

  if (
    text.includes("good") ||
    text.includes("improving") ||
    text.includes("progress")
  )
    score += 1;

  if (
    text.includes("excellent") ||
    text.includes("outstanding") ||
    text.includes("great")
  )
    score += 2;

  // --- Smart conflict resolution ---
  // If both positive and negative keywords exist, negatives dominate.
  const hasNegative =
    text.includes("poor") ||
    text.includes("disciplinary") ||
    text.includes("bad") ||
    text.includes("warning") ||
    text.includes("attention") ||
    text.includes("needs improvement");
  const hasPositive =
    text.includes("good") ||
    text.includes("improving") ||
    text.includes("progress") ||
    text.includes("excellent") ||
    text.includes("outstanding") ||
    text.includes("great");

  if (hasNegative && hasPositive) {
    // Prioritize negative context by reducing the final score
    score -= 1;
  }

  // --- Classification ---
  let label = "General Behavior";
  let color = "grey.500";
  let emoji = "💬";

  if (score >= 2) {
    label = "Excellent Behavior";
    color = "success.main";
    emoji = "🌟";
  } else if (score === 1) {
    label = "Positive Behavior";
    color = "success.main";
    emoji = "👍";
  } else if (score === 0) {
    label = "Average Performance";
    color = "info.main";
    emoji = "🟢";
  } else if (score === -1) {
    label = "Needs Attention";
    color = "warning.main";
    emoji = "⚠️";
  } else if (score <= -2) {
    label = "Concerning Behavior";
    color = "error.main";
    emoji = "🚫";
  }

  return { label, color, emoji, score };
};
