export function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString()
}

// Formats MPAA-style ratings for display
// Examples: 'PG13' -> 'PG-13', 'NC17' -> 'NC-17'
export function formatRating(rating: string): string {
  if (!rating) return ''
  if (rating === 'PG13') return 'PG-13'
  if (rating === 'NC17') return 'NC-17'
  return rating
}
