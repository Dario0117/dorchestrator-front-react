import type { NavItem } from '@domains/shared/components/nav-group.types';

export function checkIsActive(href: string, item: NavItem, mainNav = false) {
  const normalizeUrl = (url: string) => {
    const withoutQuery = url.split('?')[0] as string;
    return withoutQuery.endsWith('/') && withoutQuery.length > 1
      ? withoutQuery.slice(0, -1)
      : withoutQuery;
  };

  const normalizedHref = normalizeUrl(href);
  const normalizedItemUrl = normalizeUrl(item.url ?? '');

  return (
    normalizedHref === normalizedItemUrl ||
    (!item.items &&
      normalizedItemUrl !== '' &&
      normalizedItemUrl !== '/' &&
      normalizedHref.startsWith(`${normalizedItemUrl}/`)) ||
    !!item?.items?.filter((i) => {
      const normalizedSubUrl = normalizeUrl(i.url ?? '');
      return (
        normalizedSubUrl === normalizedHref ||
        (normalizedSubUrl !== '' &&
          normalizedSubUrl !== '/' &&
          normalizedHref.startsWith(`${normalizedSubUrl}/`))
      );
    }).length ||
    (mainNav &&
      href.split('/')[1] !== '' &&
      href.split('/')[1] === item?.url?.split('/')[1])
  );
}
