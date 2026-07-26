import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, logout } from '../features/auth/authSlice';
import { ME_QUERY } from '../services/queries';

// NOTE: This assumes your GraphQL API exposes a "Me" query that reads the
// auth cookie and returns the logged-in user (or null/error if not logged in).
// If your backend uses a different query name/fields, update this document
// to match (e.g. rename "Me" or add/remove fields).


export interface MeQueryResult {
  getCurrentUser: {
    _id: string;
    username: string;
    email: string;
    Role: string;
    Isbaned: boolean | null;
    Status: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
}

function useCurrentUser() {
  const dispatch = useDispatch();

  const { data, loading, error, refetch } = useQuery<MeQueryResult>(ME_QUERY, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });

  useEffect(() => {
    console.log(data);
    if (data?.getCurrentUser) {
      dispatch(setUser(data.getCurrentUser));
      
      
    } else if (!loading && (error || !data?.getCurrentUser)) {
      dispatch(logout());
    }
  }, [data, loading, error, dispatch]);

  return { loading, error, refetch };
}

export default useCurrentUser;
