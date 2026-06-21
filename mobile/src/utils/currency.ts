export const formatCurrency = (amount: number, symbol = '₦'): string => {
  return `${symbol}${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
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
