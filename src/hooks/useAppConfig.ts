import { useEffect, useState } from 'react';
import { getAppConfig, type AppConfig } from '../lib/api/appConfig';

export function useAppConfig(): AppConfig | null {
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAppConfig()
      .then((c) => {
        if (!cancelled) setConfig(c);
      })
      .catch(() => {
        // no configured/reachable WordPress backend — leave config null, callers render nothing
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return config;
}
