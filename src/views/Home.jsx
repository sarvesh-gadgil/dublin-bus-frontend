import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import GoogleMap from '../components/GoogleMap';
import home_banner from '../images/home_banner.jpg';

class Home extends React.Component {
    render() {
        return (
            <div style={{
                width: "100%",
                height: "650px",
                backgroundImage: `url(${home_banner})`,
                backgroundSize: 'cover',
                padding: "10px"
            }}>
                {!this.props.isAuthenticated ? (
                    <div>
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