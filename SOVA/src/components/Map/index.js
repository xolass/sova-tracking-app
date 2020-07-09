import React, { Component } from 'react';
import { View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import styles from './styles';
import io from 'socket.io-client';
import DeviceInfo from 'react-native-device-info';

/* const socket = io('http://192.168.0.104:6970'); */
/* const socket = io('http://192.168.0.111:7555'); */
const socket = io('http://69cfd8f1658d.ngrok.io');
socket.on('connect', () => console.log(`Conexão com o servidor estabelecida. ID: ${socket.id}`));
socket.on('welcome', (data) => console.log(data));

let DeviceMacAddress;
DeviceInfo.getMacAddress().then(mac => DeviceMacAddress = mac);

const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;


export default class Map extends Component {
    state = {
        region: {
            latitude: LATITUDE,
            longitude: LONGITUDE,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
        },
        initialPosition: 'unknown',
        lastPosition: 'unknown',
    };
    
    componentDidMount(){
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const initialPosition = JSON.stringify(position);

                socket.emit('location', {
                    socketid: socket.id,
                    deviceMacAddress: DeviceMacAddress,
                    location: initialPosition
                });

                this.setState({
                    region: {
                        latitude,
                        longitude,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA,
                    },
                    initialPosition
                });
            },
            (error) => console.log(error), //erro
            {
                enableHighAccuracy: true, 
                timeout:1000,
                maximumAge: 1000
            }
        );
        this.watchID = Geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const lastPosition = JSON.stringify(position);

                socket.emit('location', {
                    socketid: socket.id,
                    deviceMacAddress: DeviceMacAddress,
                    location: lastPosition
                });

                this.setState({
                    region: {
                        latitude,
                        longitude,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA,
                    },
                    lastPosition
                });
            },
            (error) => console.log(error), //erro
            {
                enableHighAccuracy: true, 
                timeout:10000,
                maximumAge: 1000,
                distanceFilter: 10
            }
        );
    };

    componentWillUnmount() {
        this.watchID != null && Geolocation.clearWatch(this.watchID);
    }


    render(){
        return (
            <View style={ styles.container }>
                <MapView
                    style={ styles.map }
                    provider={ PROVIDER_GOOGLE }
                    showsUserLocation={ true }
                    followUserLocation={ true }
                    loadingEnabled={ true }
                    initialRegion={this.state.region}
                >
                </MapView>
            </View>
        );
    }
}
