/** Formatting shared by every feature. Money is always integer paise, like the backend. */

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 123456 -> "₹1,234.56" (Indian digit grouping). */
export function formatPaise(paise: number): string {
  return inr.format(paise / 100);
}

/** "+919876543210" or "9876543210" -> "+91 98765 43210" */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) {
    return phone;
  }
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

/** First name for greetings: "Asha Verma" -> "Asha" */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}

/** "Good morning" / "Good afternoon" / "Good evening" for the given time. */
export function greeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}
