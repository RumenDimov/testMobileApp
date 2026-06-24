import { type ReactElement } from 'react';
import { render, type RenderAPI } from '@testing-library/react-native';
import { SQLiteProvider } from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';
import { setDb } from '../../src/lib/db';

/**
 * Renders a component wrapped with SQLiteProvider and sets up the global db
 * singleton so that stores using getDb() work in tests.
 */
export function renderWithDb(
  ui: ReactElement,
  mockDb: SQLiteDatabase,
): RenderAPI {
  setDb(mockDb);

  // SQLiteProvider requires an actual database, so we wrap with a no-op provider
  // that still renders children. The mockDb is already set via setDb() above.
  const Wrapper = ({ children }: { children: ReactElement }): ReactElement => {
    return (
      <SQLiteProvider databaseName=":memory:">
        {children}
      </SQLiteProvider>
    );
  };

  return render(ui, { wrapper: Wrapper });
}
