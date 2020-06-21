import React from 'react';
import { login } from '../actions/action';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

class Login extends React.Component {

    state = {
        credentials: { username: '', password: '' }
    }

    loginUser = () => {
        this.props.login(this.state.credentials.username, this.state.credentials.password).then(
            (res) => this.props.history.push('/'),
            (err) => { console.log(err) }
        );
    }

    handleLoginFormValues = (event) => {
        let newState = { ...this.state };
        newState.credentials[event.target.name] = event.target.value;
        this.setState({ newState });
    }

    render() {
        return (
            <div>
                Login Page < br />
                <input type="text" name="username" onChange={this.handleLoginFormValues.bind(this)} value={this.state.credentials.username}></input>
                <input type="password" name="password" onChange={this.handleLoginFormValues.bind(this)} value={this.state.credentials.password}></input>
                <button type="button" onClick={this.loginUser.bind(this)}>Login</button>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.isAuthenticated
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        login: (username, password) => dispatch(login({ username, password }))
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login));