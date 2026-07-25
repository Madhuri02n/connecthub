const { body, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Runs after a chain of express-validator checks; throws a 400 ApiError
 * with all validation messages joined together if any check failed.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    throw new ApiError(messages.join(', '), 400);
  }
  next();
};

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('username')
    .trim()
    .toLowerCase()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters')
    .matches(/^[a-z0-9_.]+$/)
    .withMessage('Username can only contain letters, numbers, underscores and dots'),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const postRules = [
  body('caption')
    .optional({ checkFalsy: true })
    .isLength({ max: 2200 })
    .withMessage('Caption cannot exceed 2200 characters'),
];

const commentRules = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Comment text is required')
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
];

const profileUpdateRules = [
  body('name').optional().trim().isLength({ max: 50 }),
  body('bio').optional().trim().isLength({ max: 160 }),
  body('username')
    .optional()
    .trim()
    .toLowerCase()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-z0-9_.]+$/)
    .withMessage('Username can only contain letters, numbers, underscores and dots'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  postRules,
  commentRules,
  profileUpdateRules,
};
