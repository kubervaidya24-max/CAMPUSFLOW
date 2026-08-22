/**
 * Recursive sanitization function to strip MongoDB query operators ($ and .)
 * from user inputs (req.body, req.query, req.params)
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const clean = {};
  for (const key of Object.keys(obj)) {
    // Strip leading '$' or any key containing '.'
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    clean[key] = sanitizeObject(obj[key]);
  }
  return clean;
};

/**
 * Express middleware to prevent NoSQL injection attacks
 */
export const sanitize = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
};

export default sanitize;
