import { Navigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useProfileSuspendedQuery } from '@/services/users/get-profile.http-service';
import { useAuthenticationStore } from '@/stores/authentication.store';
import type { SessionCheckMiddlewareProps } from './session-check-middleware.page.types';

export function SessionCheckMiddleware(props: SessionCheckMiddlewareProps) {
  const { profile, setProfile } = useAuthenticationStore();
  const { data } = useProfileSuspendedQuery();
  useEffect(() => {
    setProfile(data);
  }, [data, setProfile]);
  const mustRedirect = props.whenProfileExist ? !!profile : !profile;
  if (mustRedirect) {
    return (
      <Navigate
        to={props.to}
        replace
      />
    );
  }
  return props.children;
}
