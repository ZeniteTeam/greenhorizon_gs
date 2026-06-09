

export function formatDate(dateString: string): string {
  if (dateString.length < 12) {
    return dateString;
  }
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}