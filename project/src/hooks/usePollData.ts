import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

import { Poll } from '../types';

export function usePollData() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;
  const retryDelay = 2000; // Increased from 1000ms to 2000ms

  const loadPolls = useCallback(async (isRetry = false) => {
    try {
      if (!user) {
        throw new Error(t('error.auth.notLoggedIn'));
      }

      if (!isRetry) {
        setLoading(true);
      }
      setError('');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const { data, error: fetchError } = await supabase
        .from('polls')
        .select(`
          id,
          title,
          description,
          category,
          subcategory,
          created_at,
          is_public,
          created_by,
          points_enabled,
          points_per_completion,
          theme_id,
          template_id
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        throw new Error(t('error.poll.noData'));
      }

      setPolls(data);
      setError('');
      setRetryCount(0); // Reset retry count on success
      setLoading(false);
    } catch (err) {
      console.error('Error loading polls:', err);
      
      if (err.name === 'AbortError') {
        setError(t('error.poll.timeout'));
        if (retryCount < maxRetries) {
          setRetryCount((prev) => prev + 1);
          setTimeout(() => loadPolls(true), retryDelay * Math.pow(2, retryCount));
        } else {
          setError(t('error.poll.maxRetries'));
          setLoading(false);
        }
      } else {
        setError(
          err instanceof Error ? err.message : t('error.unexpected')
        );
        setLoading(false);
      }
    }
  }, [user, retryCount]);

  const refresh = useCallback(() => {
    setRetryCount(0);
    return loadPolls();
  }, [loadPolls]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { returnTo: '/polls' } });
      return;
    }

    loadPolls();

    return () => {
      // Cleanup
      setPolls([]);
      setError('');
      setRetryCount(0);
    };
  }, [user, navigate, loadPolls]);

  return {
    polls,
    loading,
    error,
    refresh,
    isRetrying: retryCount > 0,
    retryCount
  };
}