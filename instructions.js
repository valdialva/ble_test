import React, { Component } from 'react'
import { StackNavigator } from 'react-navigation'
import {
  TouchableOpacity,
  Text,
  AppRegistry,
} from 'react-native'

import App from './App';

class Instructions extends Component {

  static navigationOptions = {
    title: 'Bienvenido',
    headerStyle: {
      backgroundColor: '#ee7600'
    },
    headerTitleStyle: {
      color: '#000',
      fontSize: 20
    }
  }

  render () {

    //const { navigate } = this.props.navigation;

    return (

      <TouchableOpacity
        onPress={() => this.props.navigation.navigate('App')}>
        <Text>Empezar</Text>
      </TouchableOpacity>
    )
  }
}

export default Instructions



export const WelcomeScreen = StackNavigator({
  App: { screen: App },
  Bienvenido: { screen: Instructions}
}, {
  initialRouteName: 'Bienvenido',
})

AppRegistry.registerComponent('ble_test', () => WelcomeScreen)
