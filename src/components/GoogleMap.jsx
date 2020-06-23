import React from 'react';

const google = window.google;

class GoogleMap extends React.Component {

    constructor(props) {
        super();
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

    createMarker = () => {
        const marker = new google.maps.Marker({
            position: { lat: 53.346519, lng: -6.268644 },
            map: this.mapObject
        });

        marker.addListener('click', function () {
            alert('clicked!');
        });
    }

    render() {
        return (
            <>
                <button type="button" onClick={this.createMarker.bind(this)}>Create marker</button>
                <div id="map" ref={this.map} style={{ width: '400px', height: '300px' }}></div>
            </>
        );
    }
}

export default GoogleMap;