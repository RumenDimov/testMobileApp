import { useEffect, useState, type ReactElement, type ReactNode } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { setDb } from './db';
import { runMigrations } from '../db/migrations';
import { isSeeded } from '../db/seed';
import { seedAllContent } from '../db/seed-content';

type Props = {
  children: ReactNode;
  fallback: ReactElement;
  errorFallback: (message: string) => ReactElement;
};

export function DatabaseInitializer({ children, fallback, errorFallback }: Props): ReactElement {
  const db = useSQLiteContext();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    setDb(db);

    async function init(): Promise<void> {
      try {
        await runMigrations(db);
        const seeded = await isSeeded(db);
        if (!seeded) {
          await seedAllContent(db);
        }
        setReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Database initialization failed');
      }
    }

    init();
  }, [db]);

  if (error) {
    return errorFallback(error);
  }

  if (!ready) {
    return fallback;
  }

  return children as ReactElement;
}
