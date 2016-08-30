import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ToolbarAndroid
} from 'react-native';

import Home from './components/home.js';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d3d1d1',
  },
  toolbar: {
    height: 56,
    backgroundColor: '#ffffff',
  },
});

class TodoApp extends Component {
  render() {
    return (
      <View style={styles.container}>
        <ToolbarAndroid
          title="TodoLite ReactNative Android"
          style={styles.toolbar}>
        </ToolbarAndroid>
        <Home/>
      </View>
    );
  }
}

export default TodoApp;
