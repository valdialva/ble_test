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
  Button,
  Switch
} from 'react-native';
import {Icon} from 'react-native-elements';
import colorsys from 'colorsys'
import { ColorWheel } from 'react-native-color-wheel';
import ScrollView, { ScrollViewChild } from 'react-native-directed-scrollview';
import Drawer from 'react-native-drawer'
import { Header } from 'react-navigation';
import BLE from './BLE';


const BleManager = new BLE();

var { height, width } = Dimensions.get('window');

var Color = "#eeeeee";
var color2send = Color;

const buttons = []
//const colors = []
const led_state = []

for(var i = 0 ; i < 20; i++){
  buttons.push(
    {
       id: i,
       state: 0,
     }
  );
  //colors.push("gray");
  led_state.push(0);
}


export default class App extends Component {

    constructor(){
      super()

      this._onPress = this._onPress.bind(this);

      this.state = {
        //colors: [],
        drawer: true,
        liveEdit: false,
        led_state: led_state
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

    BleManager.componentDidMount();

    this._drawer.open()

  }

  componentWillUnmount = () => {
    BleManager.componentWillUnmount();
  }

  connect = () => {
    BleManager.startScan();
  }

  disconnect = () =>{
    BleManager.disconnect();
  }

  send = () =>{
    var temp = "";
    for (var i = 0; i < buttons.length; i++) {
      if(buttons[i].state == 1)
        temp+=i+',';
    }
    temp = temp.slice(0,-1)+';'+Color;
    BleManager.send(temp);
  }

  _onPress = (id) => {
    var color2send = Color;
    if (buttons[id].state == 0) {
      buttons[id].state = 1;
      this.state.led_state[id] = 1;
      //this.state.colors[id] =  Color;
    }else{

      /*
      if(Color == this.state.colors[id]){
        buttons[id].state = 0;
        this.state.led_state[id] = 0;
        //this.state.colors[id] =  "#000000";
        color2send = "#000000";
      }else{
        //this.state.colors[id] =  Color;
      }
      */
      color2send = "#000000";

      buttons[id].state = 0;
      this.state.led_state[id] = 0;
    }

    this.setState({led_state});
    if(this.state.liveEdit){
      //this.setState({colors});
      BleManager.send(id+';'+color2send);
    }
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
          type="overlay"
          content={
            <View style={{alignSelf: 'flex-end', backgroundColor: '#000'}}>
              <View>
              <Button title="Connect" color={'#86b300'} onPress={this.connect}></Button>

              <Button title="Send" color={'#86b300'} onPress={this.send}></Button>

              <Button title="Diconnect" color={'#86b300'} onPress={this.disconnect}></Button>
              </View>
                <ColorWheel
                 initialColor = {Color}
                 onColorChange={color => {Color = colorsys.hsv2Hex(color.h, color.s, color.v)}}
                 style={styles.top_left}
                 thumbStyle={{ height: 30, width: 30, borderRadius: 30}} />



               <View style={{flexDirection: 'row', justifyContent: 'center'}}>
               <Text style={{color: '#eee'}}>Live Edit</Text>
               <View>
                <Switch
                  onValueChange={ (value) => this.setState({ liveEdit: value })}
                  value={ this.state.liveEdit }
                  style={{justifyContent: 'flex-end'}}
                  tintColor={'#eee'}
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
                     <TouchableOpacity style={[styles.button, {backgroundColor: this.state.led_state[btnInfo.id] === 1 ? Color: "gray", height: (height-80)/20, width: (height-Header.HEIGHT)/20}]} key={btnInfo.id} onPress={()=>{this._onPress(btnInfo.id)}}><Text></Text></TouchableOpacity>
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
