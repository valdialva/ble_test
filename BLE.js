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
//const peripheral = 'B8:27:EB:02:13:F1';
const service = "12345678-1234-5678-1234-56789abc0010";
const characteristic = "12345678-1234-5678-1234-56789abc0000";


export default class BLE{

  static peripheral = '';
  static scanning = false;
  constructor(){
  }

  //Initialize BLE components
  componentDidMount() {

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

  componentWillUnmount = () => {
    this.handlerDiscover.remove();
    this.handlerStop.remove();
    this.handlerDisconnect.remove();
    this.handlerUpdate.remove();
  }

  //When device is discovered check name, if it is MoonBoard, connect
  handleDiscoverPeripheral = (peripheral) =>{
    if (peripheral.name == "MoonBoard"){
      this.peripheral = peripheral.id;
      //console.warn(peripheral.name.toString());
      //console.warn(peripheral.id);
      this.connect();
    }
  }

  //Scan for 10 secconds
  startScan = () => {
    if (!this.scanning) {
      BleManager.scan([service], 10, true).then((results) => {
        console.warn(results);
        console.log('Scanning...');
        this.scanning = true;
      });
    }
  }

  //Set scanning to false
  handleStopScan = () => {
    console.log('Scan is stopped');
    this.scanning = false;
  }

  connect = () => {
    console.warn(this.peripheral);
    BleManager.connect(this.peripheral)
    .then(() => {
      // Success code
      console.warn('Connected');
    })
    .catch((error) => {
      // Failure code
      console.warn(error);
      console.warn(this.peripheral);
    });
  }

  disconnect = () =>{
    BleManager.disconnect(this.peripheral)
        .then(() => {
     // Success code
     console.log('Disconnected');
   })
   .catch((error) => {
     // Failure code
     console.log(error);
   });
  }

  send = (data) =>{

    setTimeout(() => {
      BleManager.retrieveServices(this.peripheral).then((peripheralInfo) => {
        console.warn(peripheralInfo);
        setTimeout(() => {
          BleManager.write(this.peripheral, service, characteristic, stringToBytes(`${data}fin`)).then(() => {
            console.warn('Sent');
          }).catch(error => {
            console.warn(error);
          });

        }, 500);
      });

    }, 900);
  }

  //Check if device is connected
  isConnected = () =>{
    BleManager.isPeripheralConnected(this.peripheral, [])
    .then((isConnected) => {
      if (isConnected) {
        return true;
      } else {
        return false;
      }
    });
  }

}
