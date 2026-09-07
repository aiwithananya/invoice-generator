// Convert an amount to words using the Indian numbering system
// (thousand / lakh / crore), e.g. 1,25,000 -> "One Lakh Twenty Five Thousand".

const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigit(n: number): string {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return TENS[tens] + (ones ? ` ${ONES[ones]}` : '');
}

function threeDigit(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundreds) parts.push(`${ONES[hundreds]} Hundred`);
  if (rest) parts.push(twoDigit(rest));
  return parts.join(' ');
}

/** Whole-number to Indian-system words. */
export function integerToWords(value: number): string {
  let num = Math.floor(Math.abs(value));
  if (num === 0) return 'Zero';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = num; // 0-999

  const parts: string[] = [];
  // Crore can itself exceed 99 (e.g. 100+ crore), so recurse for that part.
  if (crore) parts.push(`${integerToWords(crore)} Crore`);
  if (lakh) parts.push(`${twoDigit(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigit(thousand)} Thousand`);
  if (hundred) parts.push(threeDigit(hundred));
  return parts.join(' ');
}

/**
 * Full rupee amount in words, e.g. "Rupees One Lakh Twenty Five Thousand and
 * Fifty Paise Only" — the standard "amount in words" line on an Indian invoice.
 */
export function amountToWordsINR(amount: number): string {
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);

  let result = `Rupees ${integerToWords(rupees)}`;
  if (paise > 0) result += ` and ${twoDigit(paise)} Paise`;
  return `${result} Only`;
}
