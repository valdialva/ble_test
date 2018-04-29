import React, { Component } from 'react';
import {
  AppRegistry,
  NativeAppEventEmitter,
  NativeEventEmitter,
  NativeModules,
  Platform,
  PermissionsAndroid,
  AppState
} from 'react-native';

import BleManager from 'react-native-ble-manager';
import { stringToBytes } from 'convert-string';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

//Propiedades del MoonBoard
var peripheral = 'B8:27:EB:02:13:F1';
var service = "12345678-1234-5678-1234-56789abc0010";
var characteristic = "12345678-1234-5678-1234-56789abc0000";

componentDidMount() {
  AppState.addEventListener('change', this.handleAppStateChange);

  BleManager.start({showAlert: false});

  this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral );
  this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan );

  if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
          if (result) {
            console.log("Permission is OK");
          } else {
            PermissionsAndroid.requestPermission(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
              if (result) {
                console.log("User accept");
              } else {
                console.log("User refuse");
              }
            });
          }
    });
  }
}

handleAppStateChange = (nextAppState) => {
  if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
    console.log('App has come to the foreground!')
    BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
      console.log('Connected peripherals: ' + peripheralsArray.length);
    });
  }
  this.setState({appState: nextAppState});
}

componentWillUnmount = () => {
  this.handlerDiscover.remove();
  this.handlerStop.remove();
  this.handlerDisconnect.remove();
  this.handlerUpdate.remove();
}

handleDiscoverPeripheral = (peripheral) =>{
  if (peripheral.name == "MoonBoard"){
    this.peripheral = peripheral.id;
    console.warn(peripheral.name.toString());
    connect();
  }
}

startScan = () => {
  if (!scanning) {
    BleManager.scan([], 10, true).then((results) => {
      console.warn(results);
      console.log('Scanning...');
      scanning = true;
    });
  }
}

handleStopScan = () => {
  console.log('Scan is stopped');
  scanning = false;
}

connect = () => {
  BleManager.connect(peripheral)
  .then(() => {
    // Success code
    console.warn('Connected');
  })
  .catch((error) => {
    // Failure code
    console.warn(error);
    console.warn(peripheral);
  });
}

disconnect = () =>{
  BleManager.disconnect(peripheral)
      .then(() => {
   // Success code
   console.log('Disconnected');
 })
 .catch((error) => {
   // Failure code
   console.log(error);
 });
}

send = () =>{
  var temp = "";
  for (var i = 0; i < buttons.length; i++) {
    temp+=buttons[i].state;
  }
  setTimeout(() => {
    BleManager.retrieveServices(peripheral).then((peripheralInfo) => {
      console.warn(peripheralInfo);
      setTimeout(() => {
        BleManager.write(peripheral, service, characteristic, stringToBytes(`${temp},${Color}fin`)).then(() => {
          console.warn('Sent');
        }).catch(error => {
          console.warn(error);
        });

      }, 500);
    });

  }, 900);
}

sendData = (id, color) =>{
  setTimeout(() => {
    BleManager.retrieveServices(peripheral).then((peripheralInfo) => {
      console.warn(peripheralInfo);
      setTimeout(() => {
        BleManager.write(peripheral, service, characteristic, stringToBytes(`${id},${color}fin`)).then(() => {
          console.warn('Sent');
        }).catch(error => {
          console.warn(error);
        });

      }, 500);
    });

  }, 900);
}
