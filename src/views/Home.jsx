import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

class Home extends React.Component {
    render() {
        return (
            <div>
                {!this.props.isAuthenticated ? (
                    <div>
                        Welcome to Dublin Bus
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