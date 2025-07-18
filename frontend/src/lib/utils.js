import classNames from "classnames";

/**
 * Combines multiple class names into a single string
 * @param  {...string} inputs - Class names to combine
 * @returns {string} - Combined class names
 */
export function cn(...inputs) {
  return classNames(...inputs);
} 