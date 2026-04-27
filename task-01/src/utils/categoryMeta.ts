export function getCategoryIcon(category: string): string {
  const lower = category.toLowerCase()
  if (lower.includes("education")) return "Education"
  if (lower.includes("speaking") || lower.includes("presentation")) return "Presentation"
  if (lower.includes("university") || lower.includes("partnership")) return "People"
  return "Emoji2"
}

export function getCategoryBadgeClass(category: string): string {
  const lower = category.toLowerCase()
  if (lower.includes("education")) return "categoryTraining"
  if (lower.includes("speaking")) return "categoryContribution"
  if (lower.includes("university") || lower.includes("partnership")) return "categoryCommunity"
  return "categoryDefault"
}
