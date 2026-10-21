// Booking Plan Duration & Dynamic Pricing Calculator Helper
export const DURATION_PLANS = [
  { id: 'HOURLY', label: 'Hourly Basis', desc: '1 - 12 Hours' },
  { id: 'DAILY', label: 'Daily Basis', desc: '1 - 6 Days' },
  { id: 'WEEKLY', label: 'Weekly Basis', desc: '1 - 3 Weeks' },
  { id: 'MONTHLY', label: 'Monthly Basis', desc: '1 - 11 Months' },
  { id: 'YEARLY', label: 'Yearly Basis', desc: '1 - 3 Years' }
];

export const getDurationOptions = (plan) => {
  switch (plan) {
    case 'HOURLY':
      return Array.from({ length: 12 }, (_, i) => i + 1); // 1 - 12 Hours
    case 'DAILY':
      return Array.from({ length: 6 }, (_, i) => i + 1);  // 1 - 6 Days
    case 'WEEKLY':
      return Array.from({ length: 3 }, (_, i) => i + 1);  // 1 - 3 Weeks
    case 'MONTHLY':
      return Array.from({ length: 11 }, (_, i) => i + 1); // 1 - 11 Months
    case 'YEARLY':
      return Array.from({ length: 3 }, (_, i) => i + 1);  // 1 - 3 Years
    default:
      return [1];
  }
};

export const getDurationUnitText = (plan, value) => {
  const units = parseInt(value, 10) || 1;
  switch (plan) {
    case 'HOURLY': return `${units} ${units === 1 ? 'Hour' : 'Hours'}`;
    case 'DAILY': return `${units} ${units === 1 ? 'Day' : 'Days'}`;
    case 'WEEKLY': return `${units} ${units === 1 ? 'Week' : 'Weeks'}`;
    case 'MONTHLY': return `${units} ${units === 1 ? 'Month' : 'Months'}`;
    case 'YEARLY': return `${units} ${units === 1 ? 'Year' : 'Years'}`;
    default: return `${units} Hours`;
  }
};

export const calculateDurationPrice = (basePrice, plan, value) => {
  const price = parseFloat(basePrice) || 800;
  const units = parseInt(value, 10) || 1;

  switch (plan) {
    case 'HOURLY':
      return price * units;
    case 'DAILY':
      // 1 Day = 6 Hours base rate
      return Math.round(price * 6 * units);
    case 'WEEKLY':
      // 1 Week = 25 Hours base rate (with bulk discount)
      return Math.round(price * 25 * units);
    case 'MONTHLY':
      // 1 Month = 80 Hours base rate (with bulk discount)
      return Math.round(price * 80 * units);
    case 'YEARLY':
      // 1 Year = 800 Hours base rate (with bulk discount)
      return Math.round(price * 800 * units);
    default:
      return price * units;
  }
};
