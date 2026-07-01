/**
 * Common utility helpers and service wrappers.
 */
import * as crypto from 'crypto';

export class TokenUtil {
  /**
   * Generates a 6-digit numeric verification code.
   */
  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generates a secure random 64-character hexadecimal token.
   */
  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
