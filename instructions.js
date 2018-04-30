import React, { Component } from 'react'
import { StackNavigator } from 'react-navigation'
import {
  TouchableOpacity,
  Text,
  AppRegistry,
  View,
  StyleSheet,
} from 'react-native'

import App from './App';

class Instructions extends Component {

  static navigationOptions = {
    header: null
  }

  render () {

    //const { navigate } = this.props.navigation;

    return (

        <View style={{backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', height: '100%'}}>

          <Text style={{color: '#000'}}> Elije el color de la ruta y crea tu camino </Text>
          <Text></Text><Text></Text><Text></Text><Text></Text>
          <TouchableOpacity
            style={styles.start}
            onPress={() => this.props.navigation.navigate('App')}>
            <Text style={{color: '#000', alignItems: 'center'}}> Empezar </Text>
          </TouchableOpacity>

        </View>
    )
  }
}

export default Instructions

const styles = StyleSheet.create({
  start:{
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
  }
});

export const WelcomeScreen = StackNavigator({
  App: { screen: App },
  Bienvenido: { screen: Instructions}
}, {
  initialRouteName: 'Bienvenido',
})

AppRegistry.registerComponent('ble_test', () => WelcomeScreen)
