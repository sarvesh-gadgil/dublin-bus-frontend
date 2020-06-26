import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import GoogleMap from '../components/GoogleMap';
import heroImage from '../images/bus_hero_image.jpg';
import Typography from '@material-ui/core/Typography';

class Home extends React.Component {
    render() {
        return (
            <div>
                {!this.props.isAuthenticated ? (
                    <div>
                        <img src={heroImage} alt="" style={{ height: "50vh", width: "100vw", objectFit: 'cover' }} />
                        <Typography component="h1" variant="h4" align="center">
                            Welcome to Dublin Bus
                                </Typography>
                        <GoogleMap isAuthenticated={false} />
                    </div>
                ) : (
                        <div>
                            Successfully logged in. Hello {this.props.user.first_name}!
                    </div>
                    )}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.isAuthenticated,
        user: state.user
    }
}

export default withRouter(connect(mapStateToProps)(Home));