/**
 * @format
 *
 * index.js – application entry point
 *
 * Two registrations are required:
 *  1. The main React component (standard RN)
 *  2. The widget task handler (react-native-android-widget headless JS)
 *
 * The widget handler MUST be registered here (not inside App.tsx) so that
 * Android can wake it via a headless JS task even when the app is closed.
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {registerWidgetTaskHandler} from 'react-native-android-widget';
import {widgetTaskHandler} from './src/widgetTaskHandler.tsx';

// Register the widget task handler for headless background execution
registerWidgetTaskHandler(widgetTaskHandler);

// Register the main React Native app
AppRegistry.registerComponent(appName, () => App);
