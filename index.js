/**
 * @format
 */
import React from 'react';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-gesture-handler';
import AppStorage from './src/Contexts/AppStorage';

const AppRoot = () => (
  <AppStorage>
    <App />
  </AppStorage>
);

AppRegistry.registerComponent(appName, () => AppRoot);
