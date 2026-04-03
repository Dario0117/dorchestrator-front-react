type AppLinkVariant = 'card' | 'underline';

const APP_LINK_VARIANT: Record<AppLinkVariant, string> = {
  card: 'flex justify-between items-center p-2 rounded-md hover:bg-muted transition-colors',
  underline: 'underline-offset-4 hover:underline',
};

export { APP_LINK_VARIANT };
