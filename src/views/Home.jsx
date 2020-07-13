import React from 'react';
import GoogleMap from '../components/GoogleMap';
// import home_banner from '../images/home_banner.jpg';
import './Home.css'

class Home extends React.Component {
    render() {
        return (
            // <div style={{
            //     width: "100%",
            //     height: "115vh",
            //     backgroundImage: `url(${home_banner})`,
            //     backgroundSize: 'cover',
            //     padding: "8px"
            // }}>
            <div className="homeBanner">
                <GoogleMap />
                <br />
            </div>
        );
    }
}

export default Home;