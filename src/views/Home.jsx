import React from 'react';
import GoogleMap from '../components/GoogleMap';
import home_banner from '../images/home_banner.jpg';
// import login_banner from '../images/login_banner.jpg';

class Home extends React.Component {
    render() {
        return (
            <div style={{
                width: "100%",
                height: "115vh",
                backgroundImage: `url(${home_banner})`,
                backgroundSize: 'cover',
                padding: "8px"
            }}>
                <GoogleMap />
            </div>
        );
    }
}

export default Home;