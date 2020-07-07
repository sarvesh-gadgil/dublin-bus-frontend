import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import axios from 'axios';
import { API_URL } from '../constants';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import moment from 'moment';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import {
    MuiPickersUtilsProvider,
    KeyboardTimePicker,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
// import Switch from '@material-ui/core/Switch';

const google = window.google;
const markersInfoWindow = [];
const markersOnMap = [];
var sourceMarker = null;
var destinationMarker = null;
var mapObj;
var directionRendererArray = [];
var routeDataArray = [];
var allBusStopsArray = [];

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
            dateTimeValue: moment(),
            startBusStopSearchedValues: [],
            startBusStopValue: null,
            destinationBusStopSearchedValues: [],
            destinationBusStopValue: null,
            busToggleButton: '',
            busArrivingAtMarkers: [],
            routeDataArrayForStepper: [],
            isBusNoVisible: false,
            isDestinationToggled: true,
            searchValue: 'Search destination stop'
        }
        // this.mapObject = null;
        this.map = React.createRef();
    }

    initMap = () => {
        mapObj = new google.maps.Map(this.map.current, {
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
        newState.isBusNoVisible = true;
        this.setState(newState);
    }

    startBusStopOnInputChange = (event, value, reason) => {
        if (!value) {
            let newState = { ...this.state };
            newState.startBusStopSearchedValues = [];
            newState.startBusStopValue = null;
            newState.busArrivingAtMarkers = [];
            newState.busToggleButton = '';
            newState.routeDataArrayForStepper = [];
            newState.isBusNoVisible = false;
            this.setState(newState);
            sourceMarker = null;
            destinationMarker = null;
            clearAllMarkersForStart();
            this.removeRoute();
            routeDataArray = [];
            allBusStopsArray = [];
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
                                map: mapObj,
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
                        mapObj.fitBounds(markerBounds);
                    },
                    err => {
                        console.log('error in startBusStopOnSelect', err)
                    })
            } else {
                clearAllMarkersForStart();

                var markerBounds = new google.maps.LatLngBounds();
                const marker = new google.maps.Marker({
                    position: { lat: parseFloat(value.stop_lat), lng: parseFloat(value.stop_lng) },
                    map: mapObj,
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

                mapObj.fitBounds(markerBounds);

                this.setState({
                    busArrivingAtMarkers: marker.get('all_bus_numbers'),
                    isBusNoVisible: true
                });
            }
        }
    }

    handleBusToggle = (event, newToggleValue) => {
        if (!!newToggleValue) {
            this.setState({
                busToggleButton: newToggleValue
            })
            const busNoAndDirection = newToggleValue.split('(');
            axios.get(API_URL + "api/bus/get/routes", {
                params: {
                    bus_number: busNoAndDirection[0].trim(),
                    direction: busNoAndDirection[1].replace(")", "").trim(),
                    stop_id: sourceMarker.get('stop_id')
                }
            }).then(res => {
                clearAllMarkersExceptStart();
                routeDataArray = []
                allBusStopsArray = res.data;
                this.createRoute(res.data);
            }, err => {
                console.log("error in handleBusToggle", err);
            })
        }
    }

    removeRoute = () => {
        for (var i = 0; i < directionRendererArray.length; i++) {
            directionRendererArray[i].setMap(null);
        }
        directionRendererArray = [];
    }

    deselectDestinationMarker = () => {
        destinationMarker = null;
        clearAllMarkersExceptStart();
        this.setState({
            routeDataArrayForStepper: [],
            isBusNoVisible: true
        })
        this.createRoute(allBusStopsArray);
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

        google.maps.event.clearInstanceListeners(marker);

        marker.addListener('mouseover', function () {
            const infowindow = new google.maps.InfoWindow({
                content: "Stop Name: <b>" + marker.get('stop_name') + "</b><br>"
                    + "Stop No: <b>" + marker.get('stop_id') + "</b><br>"
                    + "(Click this marker to deselect destination)"
            });
            markersInfoWindow.push(infowindow);
            infowindow.open(marker.get('map'), marker);
        });

        marker.addListener('mouseout', function () {
            closeAllOtherInfo()
        })

        marker.addListener('click', this.deselectDestinationMarker.bind(this));

        markersOnMap.push(marker);

        clearAllMarkersExceptStart();

        let newState = { ...this.state };
        newState.isBusNoVisible = false;
        this.setState(newState)

        let newRouteTillDest = [];
        for (var i = 0; i < routeDataArray.length; i++) {
            if (routeDataArray[i].stop_id === destinationMarker.get('stop_id')) {
                newRouteTillDest.push(routeDataArray[i]);
                break;
            } else {
                newRouteTillDest.push(routeDataArray[i]);
            }
        }
        this.setState({
            routeDataArrayForStepper: newRouteTillDest
        })
        this.createRoute(newRouteTillDest)
    }

    createRoute = (res) => {
        this.removeRoute();
        routeDataArray = res;

        // Create markers except start
        if (destinationMarker === null) {
            for (var m = 1; m < res.length; m++) {
                const marker = new google.maps.Marker({
                    position: { lat: parseFloat(res[m].stop_lat), lng: parseFloat(res[m].stop_lng) },
                    map: mapObj,
                    icon: require('../images/marker_red.png'),
                    animation: google.maps.Animation.DROP,
                    stop_id: res[m].stop_id,
                    stop_name: res[m].stop_name,
                    program_number: res[m].program_number
                });

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

                marker.addListener('click', this.handleDestinationMarkerOnclick.bind(this, marker));

                markersOnMap.push(marker);
            }
        } else {
            for (var d = 1; d < res.length; d++) {
                if (res[d].stop_id !== destinationMarker.get('stop_id')) {
                    const marker = new google.maps.Marker({
                        position: { lat: parseFloat(res[d].stop_lat), lng: parseFloat(res[d].stop_lng) },
                        map: mapObj,
                        icon: require('../images/marker_red.png'),
                        animation: google.maps.Animation.DROP,
                        stop_id: res[d].stop_id,
                        stop_name: res[d].stop_name,
                        program_number: res[d].program_number
                    });

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
            }
        }

        // Ref for below code: https://stackoverflow.com/questions/8779886/exceed-23-waypoint-per-request-limit-on-google-directions-api-business-work-lev
        var directionsService = new google.maps.DirectionsService();

        for (var k = 0, parts = [], max = 25 - 1; k < res.length; k = k + max) {
            parts.push(res.slice(k, k + max + 1));
        }

        // Service callback to process service results
        var service_callback = function (response, status) {
            if (status === 'OK') {
                var directionsRenderer = new google.maps.DirectionsRenderer();
                directionsRenderer.setOptions({
                    polylineOptions: {
                        strokeWeight: 7,
                        strokeOpacity: 4,
                        strokeColor: 'blue'
                    },
                    suppressMarkers: true
                });
                directionsRenderer.setDirections(response);
                directionsRenderer.setMap(mapObj);
                directionRendererArray.push(directionsRenderer);
            } else {
                console.log('Directions request failed due to ' + status);
                return;
            }
        }

        // Send requests to service to get route (for stations count <= 25 only one request will be sent)
        for (var i = 0; i < parts.length; i++) {
            // Waypoints does not include first station (origin) and last station (destination)
            var waypoints = [];
            for (var j = 1; j < parts[i].length - 1; j++) {
                waypoints.push({ location: new google.maps.LatLng(parts[i][j].stop_lat, parts[i][j].stop_lng), stopover: true });
            }

            // Service options
            var request = {
                origin: new google.maps.LatLng(parts[i][0].stop_lat, parts[i][0].stop_lng),
                destination: new google.maps.LatLng(parts[i][parts[i].length - 1].stop_lat, parts[i][parts[i].length - 1].stop_lng),
                waypoints: waypoints,
                travelMode: 'DRIVING'
            };
            // Send request
            directionsService.route(request, service_callback);
        }
    }

    handleOnchangeDateTime = (date, value) => {
        let newState = { ...this.state };
        newState.dateTimeValue = date;
        this.setState(newState);
    }

    handleOnSourceDestToggleChange = () => {
        let newState = { ...this.state };
        newState.startBusStopSearchedValues = [];
        newState.busArrivingAtMarkers = [];
        newState.busToggleButton = '';
        newState.routeDataArrayForStepper = [];
        newState.isBusNoVisible = false;
        newState.isDestinationToggled = !this.state.isDestinationToggled
        if (newState.isDestinationToggled) {
            newState.searchValue = "Search destination stop";
        } else {
            newState.searchValue = "Search source stop"
        }
        newState.startBusStopValue = { title: null };
        this.setState(newState);
        sourceMarker = null;
        destinationMarker = null;
        clearAllMarkersForStart();
        this.removeRoute();
        routeDataArray = [];
        allBusStopsArray = [];
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
                        <Paper elevation={2} style={{ padding: "10px", height: "inherit", backgroundColor: ("rgb(250,251,252)"), maxHeight: "600px" }}>
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
                                renderInput={(params) => <TextField {...params} label="Search for stops" margin="normal" variant="outlined" />}
                            // renderInput={(params) =>
                            //     <Grid container spacing={2}
                            //         direction="row"
                            //         justify="space-between"
                            //         alignItems="center"
                            //     >
                            //         <Grid item xs={10} sm={11} lg={9} md={9}>
                            //             <TextField
                            //                 {...params}
                            //                 label={this.state.searchValue}
                            //                 margin="normal"
                            //                 variant="outlined"
                            //                 fullWidth
                            //                 autoFocus
                            //             />
                            //         </Grid>
                            //         <Grid item xs={2} sm={1} lg={3} md={3} style={{ width: 'inherit' }}>
                            //             <Switch
                            //                 defaultChecked
                            //                 color="default"
                            //                 onChange={this.handleOnSourceDestToggleChange.bind(this)}
                            //             />
                            //         </Grid>
                            //     </Grid>
                            // }
                            />

                            {sourceMarker && !destinationMarker && this.state.isBusNoVisible && (
                                <div style={{ width: 'inherit', overflow: 'auto' }}>
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

                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <Grid container justify="space-around">
                                    <KeyboardDatePicker
                                        margin="normal"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        id="date_picker"
                                        label="Pick journey date"
                                        format="dd/MM/yyyy"
                                        maxDate={moment().add(4, 'days').format('YYYY-MM-DD')}
                                        minDate={moment().format('YYYY-MM-DD')}
                                        value={this.state.dateTimeValue}
                                        onChange={this.handleOnchangeDateTime.bind(this)}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change date',
                                        }}
                                    />
                                    <KeyboardTimePicker
                                        margin="normal"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        id="time_picker"
                                        label="Pick journey time"
                                        value={this.state.dateTimeValue}
                                        onChange={this.handleOnchangeDateTime.bind(this)}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change time',
                                        }}
                                    />
                                </Grid>
                            </MuiPickersUtilsProvider>
                            {sourceMarker && destinationMarker && (
                                <div style={{ height: '280px', overflow: 'auto' }}>
                                    <Stepper orientation="vertical" style={{ backgroundColor: "transparent" }}>
                                        {this.state.routeDataArrayForStepper.map((busData, index) => (
                                            <Step key={index} active>
                                                <StepLabel>{busData.stop_name + "(" + busData.stop_id + ")"}</StepLabel>
                                                <StepContent>
                                                    <Typography>Estimated travel time:</Typography>
                                                </StepContent>
                                            </Step>
                                        ))}
                                    </Stepper>
                                </div>
                            )}
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={12} lg={9} md={9}>
                        <CssBaseline />
                        <Paper elevation={2} style={{ padding: "3px", height: "inherit" }}>
                            <div id="map" ref={this.map} style={{ width: 'inherit', height: '600px' }}></div>
                        </Paper>
                    </Grid>
                </Grid>
            </div >
        );
    }
}

export default GoogleMap;