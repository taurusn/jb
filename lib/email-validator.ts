import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

/**
 * Validate email by checking if the domain has valid MX records
 * This ensures the email domain is configured to receive emails
 *
 * @param email - Email address to validate
 * @returns Promise<{valid: boolean, error?: string}>
 */
export async function validateEmailMX(email: string): Promise<{ valid: boolean; error?: string }> {
  try {
    // Extract domain from email
    const domain = email.split('@')[1];

    if (!domain) {
      return {
        valid: false,
        error: 'Invalid email format',
      };
    }

    // Check if domain has MX records
    const mxRecords = await resolveMx(domain);

    if (!mxRecords || mxRecords.length === 0) {
      return {
        valid: false,
        error: 'Email domain does not have valid mail servers',
      };
    }

    return {
      valid: true,
    };
  } catch (error: any) {
    // DNS lookup failed
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
      return {
        valid: false,
        error: 'Email domain does not exist or cannot receive emails',
      };
    }

    // Other DNS errors (timeout, etc.)
    console.error('Email MX validation error:', error);
    return {
      valid: false,
      error: 'Unable to verify email domain',
    };
  }
}

/**
 * Validate email format using regex
 * More comprehensive than basic email validation
 *
 * @param email - Email address to validate
 * @returns boolean
 */
export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}
