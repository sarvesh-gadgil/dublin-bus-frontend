import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import axios from 'axios';
import { API_URL } from '../constants';

const google = window.google;
const markersInfoWindow = [];
const markersOnMap = [];
var sourceMarker = null;
var destinationMarker = null;

const closeAllOtherInfo = () => {
    for (var i = 0; i < markersInfoWindow.length; i++) {
        markersInfoWindow[i].close();
    }
}

const clearAllMarkersForStart = () => {
    if (destinationMarker === null) {
        for (var i = 0; i < markersOnMap.length; i++) {
            markersOnMap[i].setMap(null);
        }
    } else {
        for (var j = 0; j < markersOnMap.length; j++) {
            if (markersOnMap[j].get("stop_id") !== destinationMarker.get('stop_id')) {
                markersOnMap[j].setMap(null);
            }
        }
    }
}

const clearAllMarkersExceptStart = () => {

    if (sourceMarker != null && destinationMarker != null) {
        for (var j = 0; j < markersOnMap.length; j++) {
            if (markersOnMap[j].get("stop_id") !== sourceMarker.get('stop_id')
                && markersOnMap[j].get("stop_id") !== destinationMarker.get('stop_id')) {
                markersOnMap[j].setMap(null);
            }
        }
    } else {
        for (var i = 0; i < markersOnMap.length; i++) {
            if (markersOnMap[i].get("stop_id") !== sourceMarker.get('stop_id')) {
                markersOnMap[i].setMap(null);
            }
        }
    }
}

const clearAllMarkersExceptDestination = () => {
    if (sourceMarker != null && destinationMarker != null) {
        for (var j = 0; j < markersOnMap.length; j++) {
            if (markersOnMap[j].get("stop_id") !== sourceMarker.get('stop_id')
                && markersOnMap[j].get("stop_id") !== destinationMarker.get('stop_id')) {
                markersOnMap[j].setMap(null);
            }
        }
    } else {
        for (var i = 0; i < markersOnMap.length; i++) {
            if (markersOnMap[i].get("stop_id") !== destinationMarker.get('stop_id')) {
                markersOnMap[i].setMap(null);
            }
        }
    }
}

const clearAllMarkersForDestination = () => {
    if (sourceMarker === null) {
        for (var i = 0; i < markersOnMap.length; i++) {
            markersOnMap[i].setMap(null);
        }
    } else {
        for (var j = 0; j < markersOnMap.length; j++) {
            if (markersOnMap[j].get("stop_id") !== sourceMarker.get('stop_id')) {
                markersOnMap[j].setMap(null);
            }
        }
    }
}

class GoogleMap extends React.Component {

    constructor(props) {
        super();
        this.state = {
            startBusStopSearchedValues: [],
            startBusStopValue: null,
            destinationBusStopSearchedValues: [],
            destinationBusStopValue: null
        }
        this.mapObject = null;
        this.map = React.createRef();
    }

    initMap = () => {
        this.mapObject = new google.maps.Map(this.map.current, {
            zoom: 14,
            center: {
                lat: 53.346519,
                lng: -6.268644
            }
        });
    }

    componentDidMount() {
        this.initMap();
    }

    getGoogleMapsAutocomplete = (query) => {
        return axios.get(API_URL + "api/google/get/places", {
            params: { query }
        })
    }

    getGoogleMapsNearestStops = (place_id) => {
        return axios.get(API_URL + "api/google/get/place/coordinates", {
            params: { place_id }
        })
    }

    handleSourceMarkerOnclick = (marker) => {
        if (sourceMarker != null && sourceMarker.get('stop_id') === marker.get('stop_id')) {
            return;
        }
        if (sourceMarker != null) {
            sourceMarker.setIcon(require('../images/marker_red.png'));
            sourceMarker = null;
        };
        sourceMarker = marker;
        marker.setIcon(require('../images/marker_black.png'));

        clearAllMarkersExceptStart();

        let newState = { ...this.state };
        newState.startBusStopSearchedValues = [];
        newState.startBusStopValue = {
            title: marker.get('stop_name')
                + " (" + marker.get('stop_id') + ")"
        };
        this.setState(newState);
    }

    handleDestinationMarkerOnclick = (marker) => {
        if (destinationMarker != null && destinationMarker.get('stop_id') === marker.get('stop_id')) {
            return;
        }
        if (destinationMarker != null) {
            destinationMarker.setIcon(require('../images/marker_red.png'));
            destinationMarker = null;
        };
        destinationMarker = marker;
        marker.setIcon(require('../images/marker_green.png'));

        clearAllMarkersExceptDestination();

        let newState = { ...this.state };
        newState.destinationBusStopSearchedValues = [];
        newState.destinationBusStopValue = {
            title: marker.get('stop_name')
                + " (" + marker.get('stop_id') + ")"
        };
        this.setState(newState);
    }

    startBusStopOnInputChange = (event, value, reason) => {
        let newState = { ...this.state };
        if (!value) {
            newState.startBusStopSearchedValues = [];
            newState.startBusStopValue = null;
            this.setState(newState);
            clearAllMarkersForStart();
            sourceMarker = null;
        } else {
            this.getGoogleMapsAutocomplete(value).then(
                res => {
                    newState.startBusStopSearchedValues = res.data;
                    this.setState(newState);
                }, err => {
                    console.log('error in startBusStopOnInputChange', err)
                })
        }
    }

    startBusStopOnSelect = (event, value, reason) => {
        if (!!value) {
            this.getGoogleMapsNearestStops(value.id).then(
                res => {
                    clearAllMarkersForStart();
                    this.markersOnMap = [];
                    for (var i = 0; i < res.data.length; i++) {
                        if (sourceMarker != null && res.data[i].stop_id === sourceMarker.get('stop_id')) {
                            continue;
                        }
                        if (destinationMarker != null && res.data[i].stop_id === destinationMarker.get('stop_id')) {
                            continue;
                        }
                        const marker = new google.maps.Marker({
                            position: { lat: parseFloat(res.data[i].stop_lat), lng: parseFloat(res.data[i].stop_lng) },
                            map: this.mapObject,
                            icon: require('../images/marker_red.png'),
                            animation: google.maps.Animation.DROP,
                            stop_id: res.data[i].stop_id,
                            stop_name: res.data[i].stop_name
                        });

                        marker.addListener('click', this.handleSourceMarkerOnclick.bind(this, marker));

                        marker.addListener('mouseover', function () {
                            const infowindow = new google.maps.InfoWindow({
                                content: "Stop Name: <b>" + marker.get('stop_name') + "</b><br>"
                                    + "Stop No: <b>" + marker.get('stop_id') + "</b>"
                            });
                            markersInfoWindow.push(infowindow);
                            infowindow.open(marker.get('map'), marker);
                        });

                        marker.addListener('mouseout', function () {
                            closeAllOtherInfo()
                        })

                        markersOnMap.push(marker);
                    }
                },
                err => {
                    console.log('error in startBusStopOnSelect', err)
                })
        }
    }

    destinationBusStopOnInputChange = (event, value, reason) => {
        let newState = { ...this.state };
        if (!value) {
            newState.destinationBusStopSearchedValues = [];
            newState.destinationBusStopValue = null;
            this.setState(newState);
            clearAllMarkersForDestination();
            destinationMarker = null;
        } else {
            this.getGoogleMapsAutocomplete(value).then(
                res => {
                    newState.destinationBusStopSearchedValues = res.data;
                    this.setState(newState);
                }, err => {
                    console.log('error in destinationBusStopOnInputChange', err)
                })
        }
    }

    destinationBusStopOnSelect = (event, value, reason) => {
        if (!!value) {
            this.getGoogleMapsNearestStops(value.id).then(
                res => {
                    clearAllMarkersForDestination();
                    this.markersOnMap = [];
                    for (var i = 0; i < res.data.length; i++) {
                        if (sourceMarker != null && res.data[i].stop_id === sourceMarker.get('stop_id')) {
                            continue;
                        }
                        if (destinationMarker != null && res.data[i].stop_id === destinationMarker.get('stop_id')) {
                            continue;
                        }
                        const marker = new google.maps.Marker({
                            position: { lat: parseFloat(res.data[i].stop_lat), lng: parseFloat(res.data[i].stop_lng) },
                            map: this.mapObject,
                            icon: require('../images/marker_red.png'),
                            animation: google.maps.Animation.DROP,
                            stop_id: res.data[i].stop_id,
                            stop_name: res.data[i].stop_name
                        });

                        marker.addListener('click', this.handleDestinationMarkerOnclick.bind(this, marker));

                        marker.addListener('mouseover', function () {
                            const infowindow = new google.maps.InfoWindow({
                                content: "Stop Name: <b>" + marker.get('stop_name') + "</b><br>"
                                    + "Stop No: <b>" + marker.get('stop_id') + "</b>"
                            });
                            markersInfoWindow.push(infowindow);
                            infowindow.open(marker.get('map'), marker);
                        });

                        marker.addListener('mouseout', function () {
                            closeAllOtherInfo()
                        })

                        markersOnMap.push(marker);
                    }
                },
                err => {
                    console.log('error in startBusStopOnSelect', err)
                })
        }
    }

    render() {
        return (
            <>
                <Autocomplete
                    id="start_bus_stop_search"
                    freeSolo
                    onInputChange={this.startBusStopOnInputChange.bind(this)}
                    onChange={this.startBusStopOnSelect.bind(this)}
                    size="small"
                    value={this.state.startBusStopValue}
                    options={this.state.startBusStopSearchedValues}
                    getOptionLabel={option => option.title}
                    style={{ width: "300px" }}
                    renderInput={(params) => <TextField {...params} label="Search Start Bus Stop" margin="normal" variant="outlined" />}
                />

                <Autocomplete
                    id="destination_bus_stop_search"
                    freeSolo
                    onInputChange={this.destinationBusStopOnInputChange.bind(this)}
                    onChange={this.destinationBusStopOnSelect.bind(this)}
                    size="small"
                    value={this.state.destinationBusStopValue}
                    options={this.state.destinationBusStopSearchedValues}
                    getOptionLabel={option => option.title}
                    style={{ width: "300px" }}
                    renderInput={(params) => <TextField {...params} label="Search Destination Bus Stop" margin="normal" variant="outlined" />}
                />

                <br />

                <div id="map" ref={this.map} style={{ width: '1000px', height: '600px' }}></div>
            </>
        );
    }
}

export default GoogleMap;