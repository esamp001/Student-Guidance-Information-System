// utils/behaviorUtils.js
export const analyzeBehavior = (note) => {
  if (!note) {
    return { label: "General Behavior", color: "grey.500", score: 0 };
  }

  const text = note.toLowerCase();
  let score = 0;

  // Weighted scoring
  if (
    text.includes("excellent") ||
    text.includes("outstanding") ||
    text.includes("great")
  )
    score += 2;
  if (
    text.includes("good") ||
    text.includes("improving") ||
    text.includes("progress")
  )
    score += 1;
  if (text.includes("average") || text.includes("satisfactory")) score += 0;
  if (
    text.includes("warning") ||
    text.includes("attention") ||
    text.includes("needs improvement")
  )
    score -= 1;
  if (
    text.includes("poor") ||
    text.includes("disciplinary") ||
    text.includes("bad")
  )
    score -= 2;

  // Classification
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
