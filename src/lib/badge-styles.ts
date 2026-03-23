/**
 * Centralized badge color styles using semantic names.
 *
 * Each entity maps its own statuses to these colors — the mapping lives in
 * the component, while the visual definition lives here.
 */
export const badgeStyles = {
  success:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  warning:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  neutral: 'bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400',
} as const;

export type BadgeStyle = keyof typeof badgeStyles;
