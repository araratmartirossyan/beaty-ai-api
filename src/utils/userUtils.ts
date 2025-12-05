import { User } from '../entities/User';

/**
 * Helper function to sanitize user object by removing sensitive fields
 */
export const sanitizeUser = (user: User): Omit<User, 'password'> => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

