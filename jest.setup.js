// Clear AsyncStorage between tests
const asyncStore = {};

// Mock AsyncStorage for Jest tests
jest.mock('@react-native-async-storage/async-storage', () => {
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key) => {
        return Promise.resolve(asyncStore[key] ?? null);
      }),
      setItem: jest.fn((key, value) => {
        asyncStore[key] = value;
        return Promise.resolve();
      }),
      removeItem: jest.fn((key) => {
        delete asyncStore[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        Object.keys(asyncStore).forEach((k) => delete asyncStore[k]);
        return Promise.resolve();
      }),
    },
  };
});

// Mock react-native-iap native modules (not available in test env)
jest.mock('react-native-iap', () => ({
  initConnection: jest.fn(() => Promise.resolve()),
  endConnection: jest.fn(() => Promise.resolve()),
  fetchProducts: jest.fn(() => Promise.resolve([])),
  requestPurchase: jest.fn(() => Promise.resolve()),
  finishTransaction: jest.fn(() => Promise.resolve()),
  getAvailablePurchases: jest.fn(() => Promise.resolve([])),
  restorePurchases: jest.fn(() => Promise.resolve([])),
  purchaseUpdatedListener: jest.fn(() => ({ remove: jest.fn() })),
  purchaseErrorListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Mock expo-router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
  setParams: jest.fn(),
};

jest.mock('expo-router', () => ({
  router: mockRouter,
  Stack: {
    Screen: jest.fn(() => null),
    Navigator: jest.fn(({ children }) => children),
  },
  useLocalSearchParams: jest.fn(() => ({})),
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  })),
  useRouter: jest.fn(() => mockRouter),
  usePathname: jest.fn(() => '/'),
  useSegments: jest.fn(() => ['']),
  Link: jest.fn(({ children }) => children),
  Redirect: jest.fn(() => null),
  ErrorBoundary: jest.fn(({ children }) => children),
}));

// Mock expo-sqlite context
const mockSQLiteContext = {
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn(),
  runAsync: jest.fn(),
  execAsync: jest.fn(),
  withTransactionAsync: jest.fn((fn) => fn()),
};

jest.mock('expo-sqlite', () => ({
  useSQLiteContext: jest.fn(() => mockSQLiteContext),
  SQLiteProvider: jest.fn(({ children }) => children),
  openDatabaseAsync: jest.fn(() => Promise.resolve(mockSQLiteContext)),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      version: '1.0.0',
      extra: {
        posthogApiKey: 'test-key',
        posthogHost: 'https://test.posthog.com',
      },
    },
  },
}));

// Mock react-native Share
jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })),
}));

// Mock react-native Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Mock posthog-react-native
jest.mock('posthog-react-native', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      capture: jest.fn(),
      flush: jest.fn(),
      identify: jest.fn(),
      reset: jest.fn(),
      screen: jest.fn(),
    })),
  };
});

// Mock NativeWind (tailwindcss-react-native)
jest.mock('nativewind', () => ({
  withNativeWind: jest.fn((Component) => Component),
  useColorScheme: jest.fn(() => 'light'),
}));


