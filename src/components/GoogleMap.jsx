import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import axios from 'axios';
import { API_URL } from '../constants';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import moment from 'moment';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

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

class GoogleMap extends React.Component {

    constructor(props) {
        super();
        this.state = {
            startBusStopSearchedValues: [],
            startBusStopValue: null,
            destinationBusStopSearchedValues: [],
            destinationBusStopValue: null,
            dateTimeValue: '',
            busToggleButton: '',
            busArrivingAtMarkers: []
        }
        this.mapObject = null;
        this.map = React.createRef();
    }

    initMap = () => {
        this.mapObject = new google.maps.Map(this.map.current, {
            zoom: 12,
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
        newState.busArrivingAtMarkers = marker.get('all_bus_numbers');
        this.setState(newState);
    }

    startBusStopOnInputChange = (event, value, reason) => {
        if (!value) {
            let newState = { ...this.state };
            newState.startBusStopSearchedValues = [];
            newState.startBusStopValue = null;
            newState.busArrivingAtMarkers = [];
            newState.handleBusToggle = '';
            this.setState(newState);
            clearAllMarkersForStart();
            sourceMarker = null;
        } else {
            this.getGoogleMapsAutocomplete(value).then(
                res => {
                    let newState = { ...this.state };
                    if (destinationMarker != null) {
                        let filteredResult = [];
                        for (var i = 0; i < res.data.length; i++) {
                            if (res.data[i].fromDB) {
                                if (res.data[i].id !== destinationMarker.get('stop_id')) {
                                    filteredResult.push(res.data[i]);
                                }
                            } else {
                                filteredResult.push(res.data[i]);
                            }
                        }
                        newState.startBusStopSearchedValues = filteredResult;
                    } else {
                        newState.startBusStopSearchedValues = res.data;
                    }
                    this.setState(newState);
                }, err => {
                    console.log('error in startBusStopOnInputChange', err)
                })
        }
    }

    startBusStopOnSelect = (event, value, reason) => {
        if (!!value) {
            if (!value.fromDB) {
                this.getGoogleMapsNearestStops(value.id).then(
                    res => {
                        clearAllMarkersForStart();
                        this.markersOnMap = [];
                        var markerBounds = new google.maps.LatLngBounds();
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
                                stop_name: res.data[i].stop_name,
                                all_bus_numbers: res.data[i].all_bus_numbers
                            });

                            markerBounds.extend({ lat: parseFloat(res.data[i].stop_lat), lng: parseFloat(res.data[i].stop_lng) })

                            marker.addListener('click', this.handleSourceMarkerOnclick.bind(this, marker));

                            marker.addListener('mouseover', function () {
                                const busNoAndDirections = marker.get('all_bus_numbers');
                                let allBusNoArray = [];
                                for (var i = 0; i < busNoAndDirections.length; i++) {
                                    allBusNoArray.push(busNoAndDirections[i].bus_number
                                        + "(" + busNoAndDirections[i].direction + ")");
                                }

                                const infowindow = new google.maps.InfoWindow({
                                    content: "Stop Name: <b>" + marker.get('stop_name') + "</b><br>"
                                        + "Stop No: <b>" + marker.get('stop_id') + "</b><br>"
                                        + "Bus No: <b>" + allBusNoArray.join(" | ")
                                });
                                markersInfoWindow.push(infowindow);
                                infowindow.open(marker.get('map'), marker);
                            });

                            marker.addListener('mouseout', function () {
                                closeAllOtherInfo()
                            })

                            markersOnMap.push(marker);
                        }
                        this.mapObject.fitBounds(markerBounds);
                    },
                    err => {
                        console.log('error in startBusStopOnSelect', err)
                    })
            } else {
                clearAllMarkersForStart();

                var markerBounds = new google.maps.LatLngBounds();
                const marker = new google.maps.Marker({
                    position: { lat: parseFloat(value.stop_lat), lng: parseFloat(value.stop_lng) },
                    map: this.mapObject,
                    icon: require('../images/marker_black.png'),
                    animation: google.maps.Animation.DROP,
                    stop_id: value.id,
                    stop_name: value.title,
                    all_bus_numbers: value.all_bus_numbers
                });

                markerBounds.extend({ lat: parseFloat(value.stop_lat), lng: parseFloat(value.stop_lng) })

                this.markersOnMap = [];
                markersOnMap.push(marker);
                sourceMarker = marker;

                this.mapObject.fitBounds(markerBounds);

                this.setState({
                    busArrivingAtMarkers: marker.get('all_bus_numbers')
                });
            }
        }
    }

    handleBusToggle = (event, newToggleValue) => {
        this.setState({
            busToggleButton: newToggleValue
        })
        alert(newToggleValue);
    }

    render() {
        return (
            <div style={{ flexGrow: 1 }}>
                <Grid container spacing={2}
                    direction="row"
                    justify="space-between"
                    alignItems="flex-start"
                >
                    <Grid item xs={12} sm={12} lg={3} md={3}>
                        <CssBaseline />
                        <Paper elevation={2} style={{ padding: "10px", height: "inherit", backgroundColor: ("rgb(250,251,252)") }}>
                            <Typography>
                                <b style={{ fontSize: "29px" }}>Welcome to Dublin Bus</b>
                            </Typography>
                            <br />
                            <Typography>
                                <span style={{ fontSize: "15px" }}>Fill in the below details to get travel time estimates and more!</span>
                            </Typography>

                            <Autocomplete
                                id="start_bus_stop_search"
                                freeSolo
                                onInputChange={this.startBusStopOnInputChange.bind(this)}
                                onChange={this.startBusStopOnSelect.bind(this)}
                                size="small"
                                value={this.state.startBusStopValue}
                                options={this.state.startBusStopSearchedValues}
                                getOptionLabel={option => option.title}
                                renderInput={(params) => <TextField {...params} label="Search source stop" margin="normal" variant="outlined" />}
                            />

                            {sourceMarker && (
                                <div style={{ width: 'inherit', overflowX: 'auto' }}>
                                    <ToggleButtonGroup
                                        value={this.state.busToggleButton}
                                        exclusive
                                        onChange={this.handleBusToggle.bind(this)}
                                    >
                                        {this.state.busArrivingAtMarkers.map((bus, index) =>

                                            <ToggleButton
                                                value={bus.bus_number + "(" + bus.direction + ")"}
                                                style={{ color: 'black' }} key={index}
                                            >
                                                {bus.bus_number + "(" + bus.direction + ")"}
                                            </ToggleButton>
                                        )}
                                    </ToggleButtonGroup>
                                </div>
                            )}

                            <TextField
                                id="journey_date"
                                label="Journey date"
                                type="datetime-local"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                margin="normal"
                                variant="outlined"
                                fullWidth
                                size="small"
                                onChange={(event) => {
                                    let newState = { ...this.state };
                                    newState.dateTimeValue = event.target.value;
                                    this.setState(newState);
                                }}
                                InputProps={{
                                    inputProps: {
                                        max: moment().add('days', 5).format('YYYY-MM-DDTHH:MM'),
                                        min: moment().format('YYYY-MM-DDTHH:MM'),
                                    }
                                }}
                            />
                            <br />
                            <br />
                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                style={{ backgroundColor: '#1c8715', color: 'white' }}
                                size="large"
                            > Login </Button>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={12} lg={9} md={9}>
                        <CssBaseline />
                        <Paper elevation={2} style={{ padding: "3px", height: "inherit" }}>
                            <div id="map" ref={this.map} style={{ width: 'inherit', height: '600px' }}></div>
                        </Paper>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default GoogleMap;