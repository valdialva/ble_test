import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  NativeAppEventEmitter,
  NativeEventEmitter,
  NativeModules,
  Platform,
  PermissionsAndroid,
  AppState,
  Button,
  Switch
} from 'react-native';
import {Icon} from 'react-native-elements';
import BleManager from 'react-native-ble-manager';
import { stringToBytes } from 'convert-string';
import colorsys from 'colorsys'
import { ColorWheel } from 'react-native-color-wheel';
import ScrollView, { ScrollViewChild } from 'react-native-directed-scrollview';
import Drawer from 'react-native-drawer'
import { Header } from 'react-navigation';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

var { height, width } = Dimensions.get('window');

var Color = "#eeeeee";
var color2send = Color;

//Propiedades del MoonBoard
var peripheral = 'B8:27:EB:02:13:F1';
var service = "12345678-1234-5678-1234-56789abc0010";
var characteristic = "12345678-1234-5678-1234-56789abc0000";

const buttons = []
const colors = []

for(var i = 0 ; i < 400; i++){
  buttons.push(
    {
       id: i,
       state: 0,
     }
  );
  colors.push("gray")
}


export default class App extends Component {

    constructor(){
      super()

      this.state = {
        appState: '',
        Led: Color,
        colors: colors,
        drawer: true,
        liveEdit: false
      }
    }

    static navigationOptions = ({ navigation }) => {
      const params = navigation.state.params || {};
      return {
        headerTitle: 'Crea tu Ruta',
        headerStyle: {
          backgroundColor: '#ee7600'
        },
        headerTitleStyle: {
          color: '#000',
          fontSize: 20
        },
        headerLeft: (
          <Icon
            onPress={()=>{params.controlMenu()}}
            color="#000"
            type={"material-community"}
            name={params.drawer === true ? "menu-left" : "menu-right"}
            size={60}
          />
        )
      }
    };


    componentWillMount(){
      this.props.navigation.setParams({
        controlMenu: this.controlPanel,
        drawer: this.state.drawer,
      });

    }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);

    BleManager.start({showAlert: false});

    this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic );

    this._drawer.open()

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

  handleUpdateValueForCharacteristic = (data) => {
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
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

  handleDiscoverPeripheral = (peripheral) =>{
    var peripherals = this.state.peripherals;
    if (!peripherals.has(peripheral.id)){
      console.log('Got ble peripheral', peripheral);
      console.warn(peripheral.id.toString());
      peripherals.set(peripheral.id, peripheral);
      this.setState({ peripherals })
    }
  }

  _onPress = (id) => {
    var color2send = Color;
    if (buttons[id].state == 0) {
      buttons[id].state = 1;
      this.state.colors[id] =  Color;
    }else{
      if(Color == this.state.colors[id]){
        buttons[id].state = 0;
        this.state.colors[id] =  "gray";
        color2send = "#000000";
      }else{
        this.state.colors[id] =  Color;
      }
    }
    this.setState({colors});

    if(this.state.liveEdit)
      this.sendData(id, color2send);
  }

  controlPanel = () => {
    if(this.state.drawer)
      this._drawer.close()
    else
      this._drawer.open()

    this.props.navigation.setParams({drawer: !this.state.drawer});

  };

  render() {
    return (
      <View style={styles.container}>

        <Drawer
          onClose={()=>{this.setState({ drawer: false })}}
          onOpen={()=>{this.setState({ drawer: true })}}
          ref={(ref) => this._drawer = ref}
          tapToClose={true}
          openDrawerOffset={0.5} // 20% gap on the right side of drawer
          panCloseMask={0.5}
          closedDrawerOffset={-3}
          tweenDuration={500}
          content={
            <View style={{alignSelf: 'flex-end'}}>
              <View>
              <Button title="Connect" onPress={this.connect}></Button>

              <Button title="Send" onPress={this.send}></Button>

              <Button title="Diconnect" onPress={this.disconnect}></Button>
              </View>
                <ColorWheel
                 initialColor = {Color}
                 onColorChange={color => {Color = colorsys.hsv2Hex(color.h, color.s, color.v)}}
                 style={styles.top_left}
                 thumbStyle={{ height: 30, width: 30, borderRadius: 30}} />



               <View style={{flexDirection: 'row'}}>
               <Text>Live Edit</Text>
               <View>
                <Switch
                  onValueChange={ (value) => this.setState({ liveEdit: value })}
                  value={ this.state.liveEdit }
                  />
                </View>
               </View>
              </View>
          }
          >

        <View style={styles.container}>

          <ScrollView
            bounces={false}
            maximumZoomScale={1.5}
            minimumZoomScale={0.6}
            contentContainerStyle={{ width: (height-Header.HEIGHT), height: height-Header.HEIGHT}}>
            <ScrollViewChild scrollDirection={'both'}>
              <View style={[styles.bottom]}>
                {buttons.map((btnInfo) => {
                   return (
                     <TouchableOpacity style={[styles.button, {backgroundColor: this.state.colors[btnInfo.id], height: (height-80)/20, width: (height-Header.HEIGHT)/20}]} key={btnInfo.id} onPress={()=>{this._onPress(btnInfo.id)}}><Text></Text></TouchableOpacity>
                   );
                })}
              </View>
            </ScrollViewChild>
          </ScrollView>
        </View>

        </Drawer>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  top_left: {
    width: width*0.5,
    height: width*0.5,
  },
  bottom:{
    width: height-Header.HEIGHT,
    height: height-Header.HEIGH,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  button: {
      backgroundColor: "gray",
      borderWidth: 1,
      borderColor: "black",
      borderRadius:100,
  }
});
