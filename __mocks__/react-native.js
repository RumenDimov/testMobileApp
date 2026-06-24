// Manual mock for react-native in Jest.
// Prevents native module errors (DevMenu, TurboModuleRegistry) in test env.

// eslint-disable-next-line @typescript-eslint/no-require-imports -- Jest manual mock is CommonJS
const React = require('react');

// ActivityIndicator mock
const ActivityIndicator = React.forwardRef((props, ref) =>
  React.createElement('ActivityIndicator', { ...props, ref }),
);
ActivityIndicator.displayName = 'ActivityIndicator';

// Pressable mock
const Pressable = React.forwardRef((props, ref) =>
  React.createElement('Pressable', { ...props, ref, accessibilityRole: 'button' }),
);
Pressable.displayName = 'Pressable';

// Text mock
const Text = React.forwardRef((props, ref) =>
  React.createElement('Text', { ...props, ref }),
);
Text.displayName = 'Text';

// View mock
const View = React.forwardRef((props, ref) =>
  React.createElement('View', { ...props, ref }),
);
View.displayName = 'View';

// ScrollView mock
const ScrollView = React.forwardRef((props, ref) =>
  React.createElement('RCTScrollView', { ...props, ref }),
);
ScrollView.displayName = 'ScrollView';

// Linking mock
const Linking = {
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
};

// Share mock
const Share = {
  share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })),
};

// Platform mock
const Platform = {
  OS: 'android',
  Version: '34',
  select: (obj) => obj.android ?? obj.default,
};

// StyleSheet mock
const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => style,
  hairlineWidth: 1,
};

// Dimensions mock
const Dimensions = {
  get: jest.fn(() => ({ width: 390, height: 844 })),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
};

// FlatList stub — just renders children
const FlatList = React.forwardRef((props, ref) =>
  React.createElement('RCTFlatList', { ...props, ref }),
);
FlatList.displayName = 'FlatList';

// Animated API stub
const AnimatedView = React.forwardRef((props, ref) =>
  React.createElement('AnimatedView', { ...props, ref }),
);
AnimatedView.displayName = 'Animated.View';

// TouchableOpacity stub
const TouchableOpacity = React.forwardRef((props, ref) =>
  React.createElement('TouchableOpacity', { ...props, ref }),
);
TouchableOpacity.displayName = 'TouchableOpacity';

// Modal stub
const Modal = React.forwardRef((props, ref) =>
  React.createElement('Modal', { ...props, ref }),
);
Modal.displayName = 'Modal';

module.exports = {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  ScrollView,
  Linking,
  Share,
  Platform,
  StyleSheet,
  Dimensions,
  FlatList,
  // Other commonly imported RN APIs
  Animated: {
    View: AnimatedView,
  },
  TouchableOpacity,
  Modal,
  Alert: {
    alert: jest.fn(),
  },
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  BackHandler: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  NativeModules: {},
  NativeEventEmitter: jest.fn(() => ({
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  })),
  TurboModuleRegistry: {
    getEnforcing: jest.fn(() => ({})),
    get: jest.fn(() => null),
  },
  UIManager: {
    getViewManagerConfig: jest.fn(() => ({})),
  },
};
