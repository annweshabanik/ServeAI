import crypto from 'crypto';
import { prisma } from '../config/db';
import { AppError } from './appError';

const SAFE_SYMBOLS = ['@', '#', '$', '!', '&'];
const ALPHANUMERIC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid visually confusing characters like 0/O/1/I

/**
 * Clean and extract a readable prefix from the restaurant or user name.
 * e.g., "Spice Garden" -> "Spice", "Grand Lotus Hotel" -> "Lotus", "Taj" -> "Taj"
 */
function extractNamePrefix(name: string): string {
  if (!name || typeof name !== 'string') return 'Restro';
  
  // Remove special characters, keep letters and digits
  const words = name
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ''))
    .filter(Boolean);

  if (words.length === 0) return 'Restro';

  // If common words like "Hotel", "Restaurant", "The", skip to next word if possible
  const stopWords = new Set(['the', 'hotel', 'restaurant', 'cafe', 'bar', 'dhaba']);
  let chosenWord = words[0];

  if (words.length > 1 && stopWords.has(words[0].toLowerCase())) {
    chosenWord = words[1];
  }

  // Capitalize first letter
  const prefix = chosenWord.charAt(0).toUpperCase() + chosenWord.slice(1);
  
  // Limit prefix length to between 3 and 6 chars
  if (prefix.length < 3) {
    return (prefix + 'POS').slice(0, 5);
  }
  return prefix.slice(0, 6);
}

/**
 * Generate a random string of specified length using node crypto module.
 */
function getRandomString(length: number): string {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHANUMERIC[bytes[i] % ALPHANUMERIC.length];
  }
  return result;
}

/**
 * Generate a single candidate Login ID.
 * Example format: "Spice#91A", "Lotus@7K2", "Taj@8N3"
 * Total length is guaranteed to be between 6 and 14 characters.
 */
export function generateCandidateLoginId(name: string): string {
  const prefix = extractNamePrefix(name);
  
  // Pick random safe symbol
  const symbolByte = crypto.randomBytes(1)[0];
  const symbol = SAFE_SYMBOLS[symbolByte % SAFE_SYMBOLS.length];

  // Calculate random suffix length to keep total between 6 and 14 chars
  // Desired total length ~ 8 to 11 chars
  const maxSuffixLen = Math.min(6, 14 - prefix.length - 1);
  const minSuffixLen = Math.max(2, 6 - prefix.length - 1);
  const suffixLen = Math.floor(Math.random() * (maxSuffixLen - minSuffixLen + 1)) + minSuffixLen;

  const randomSuffix = getRandomString(suffixLen);

  const candidate = `${prefix}${symbol}${randomSuffix}`;

  // Enforce boundary check strictly
  if (candidate.length < 6 || candidate.length > 14) {
    // Fallback simple clean format
    return `${prefix.slice(0, 4)}@${getRandomString(3)}`;
  }

  return candidate;
}

/**
 * Generate a unique tenant login ID by checking database collision.
 * Retries up to maxRetries times.
 */
export async function generateUniqueTenantLoginId(
  restaurantName: string,
  maxRetries = 10
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const candidate = generateCandidateLoginId(restaurantName);
    
    // Database uniqueness check
    const existing = await prisma.tenant.findUnique({
      where: { loginId: candidate },
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new AppError(
    'Failed to generate a unique login ID for the tenant after multiple attempts. Please try again.',
    500
  );
}
