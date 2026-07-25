// Safe number formatter — avoids toLocaleString locale args which crash on
// older Hermes/Android (Infinix XOS, Android 8-9, missing ICU data).
function commaify(n: number): string {
  const s = Math.round(Math.abs(n)).toString();
  let out = '';
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) out += ',';
    out += s[i];
  }
  return out;
}

export const formatCurrency = (amount: number | null | undefined, symbol = '₦'): string => {
  const n = Number(amount);
  if (!isFinite(n)) return `${symbol}0`;
  return `${symbol}${commaify(n)}`;
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const formatDate = (dateString: string): string => {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const h = d.getHours(), m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hh = h % 12 || 12;
    const mm = String(m).padStart(2, '0');
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm} ${ampm}`;
  } catch {
    return dateString;
  }
};

export const getErrorMessage = (error: any): string => {
  // Network error — no response received
  if (!error?.response) {
    return 'Cannot connect to server. Check your internet connection and try again.';
  }

  const status = error.response.status;

  // 401 Unauthorized
  if (status === 401) {
    return 'Invalid email or password.';
  }

  // 422 Validation errors — extract the first message
  if (status === 422) {
    const errors = error.response.data?.errors;
    if (errors) {
      const firstKey = Object.keys(errors)[0];
      if (firstKey && Array.isArray(errors[firstKey])) {
        return errors[firstKey][0];
      }
    }
    if (error.response.data?.message) return error.response.data.message;
  }

  // 500 Server error
  if (status >= 500) {
    return 'Server error. Please try again later.';
  }

  // Generic — use message from response if available
  if (error.response.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'Something went wrong. Please try again.';
};
