import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { LOGOUT_ACTION } from '../constants';
import { logout } from '../actions/action'
import SignUp from '../signup';


class Navbar extends React.Component {

    logoutUser = (e) => {
        e.preventDefault();
        this.props.logout().then(res => this.props.history.push('/login'))
    }

    render() {
        return (
            <div>
                
                {this.props.isAuthenticated ? (
                    <ul>
                        <li><a href="#!" onClick={this.logoutUser.bind(this)}>Logout</a></li>
                    </ul>
                ) : (
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/login">Login</Link></li>
                        </ul>
                    )}
                    <SignUp/>
            </div>
            
        )
    }
}

const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.isAuthenticated
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        logout: () => dispatch(logout({ type: LOGOUT_ACTION }))
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Navbar));