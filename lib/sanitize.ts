/**
 * Server-side HTML sanitization (for API routes)
 * Simple but effective sanitization without external dependencies
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') return '';
  
  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');
  
  // Allow only safe tags and attributes
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'div', 'span', 'mark', 'del', 'ins'];
  const allowedAttrs = ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel'];
  
  // Basic tag whitelisting (remove disallowed tags)
  const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  sanitized = sanitized.replace(tagPattern, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      // Remove disallowed attributes
      let cleaned = match.replace(/\s+(\w+)\s*=\s*["'][^"']*["']/gi, (attrMatch, attrName) => {
        if (allowedAttrs.includes(attrName.toLowerCase())) {
          return attrMatch;
        }
        return '';
      });
      return cleaned;
    }
    return '';
  });
  
  return sanitized.trim();
}

/**
 * Client-side HTML sanitization using DOMPurify
 * Only imported on client-side to avoid build issues
 */
export function sanitizeHTMLClient(html: string): string {
  if (typeof window === 'undefined') {
    // Fallback to server-side sanitization
    return sanitizeHTML(html);
  }
  
  // Dynamic import for client-side only
  try {
    const DOMPurify = require('dompurify');
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img',
        'div', 'span', 'mark', 'del', 'ins',
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel'],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });
  } catch {
    return sanitizeHTML(html);
  }
}

/**
 * Sanitize plain text to prevent XSS
 * Client-safe version
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[<>]/g, '') // Remove < and >
    .trim()
    .slice(0, 10000); // Max length
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  return email
    .trim()
    .toLowerCase()
    .replace(/[^\w@.-]/g, '') // Remove invalid characters
    .slice(0, 255); // Max email length
}

/**
 * Sanitize name (person name)
 */
export function sanitizeName(name: string): string {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\p{L}\s'-]/gu, '') // Allow only letters, spaces, hyphens, apostrophes
    .slice(0, 100); // Max length
}

/**
 * Sanitize textarea content
 */
export function sanitizeTextArea(text: string, maxLength: number = 10000): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')
    .slice(0, maxLength);
}

/**
 * Sanitize URL
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') return '';
  try {
    const parsed = new URL(url);
    // Only allow http, https, mailto, tel protocols
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString().slice(0, 2048); // Max URL length
  } catch {
    return '';
  }
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  return phone
    .trim()
    .replace(/[^\d+\-() ]/g, '') // Allow only digits, +, -, (, ), spaces
    .slice(0, 20); // Max phone length
}

/**
 * Sanitize project idea or similar longer text fields
 */
export function sanitizeProjectIdea(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')
    .slice(0, 5000); // Max length for project ideas
}
