import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import axios from 'axios';
import { API_URL } from '../constants';

const google = window.google;

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

    startBusStopOnInputChange = (event, value, reason) => {
        let newState = { ...this.state };
        if (!value) {
            newState.startBusStopSearchedValues = [];
            newState.startBusStopValue = null;
            this.setState(newState);
        } else {
            this.getGoogleMapsAutocomplete(value).then(
                res => {
                    newState.startBusStopSearchedValues = res.data;
                    this.setState(newState);
                }, err => {
                    console.log('in err', err)
                })
        }
    }

    startBusStopOnSelect = (event, value, reason) => {
        if (!!value) {
            alert(value.title);
            alert(value.id);
            // let newState = { ...this.state };
            // newState.startBusStopValue = { title: "test" };
            // this.setState(newState);
        }
    }

    destinationBusStopOnInputChange = (event, value, reason) => {
        let newState = { ...this.state };
        if (!value) {
            newState.destinationBusStopSearchedValues = [];
            newState.destinationBusStopValue = null;
            this.setState(newState);
        } else {
            this.getGoogleMapsAutocomplete(value).then(
                res => {
                    newState.destinationBusStopSearchedValues = res.data;
                    this.setState(newState);
                }, err => {
                    console.log('in err', err)
                })
        }
    }

    destinationBusStopOnSelect = (event, value, reason) => {
        if (!!value) {
            alert(value.title);
            alert(value.id);
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

                <br />

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


                <div id="map" ref={this.map} style={{ width: '400px', height: '300px' }}></div>
            </>
        );
    }
}

export default GoogleMap;