import React from 'react';
import { login } from '../actions/action';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import avatar_img from '../images/login_logo.png';
import CssBaseline from '@material-ui/core/CssBaseline';

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
        this.setState(newState);
    }

    render() {
        return (
            <div>
                <Container component="main" maxWidth="xs">
                    <Grid
                        container
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justify="center"
                        style={{ minHeight: '75vh' }}
                    >
                        <Grid item>
                            <CssBaseline />
                            <Paper elevation={2} style={{ padding: "30px", height: "400px" }}>
                                <Avatar style={{ marginLeft: "auto", marginRight: "auto", width: "50px", height: "50px" }} src={avatar_img} />
                                <Typography component="h1" variant="h6" align="center">
                                    Login to Dublin Bus
                                </Typography>
                                <form>
                                    <TextField
                                        margin="normal"
                                        required
                                        autoFocus
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        autoComplete="email"
                                        size="small"
                                        variant="outlined"
                                        name="username"
                                        onChange={this.handleLoginFormValues.bind(this)}
                                        value={this.state.credentials.username}
                                    // InputLabelProps={{
                                    //     style: { color: 'gray' }
                                    // }}
                                    />
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        label="Password"
                                        type="password"
                                        id="password"
                                        size="small"
                                        variant="outlined"
                                        name="password"
                                        onChange={this.handleLoginFormValues.bind(this)}
                                        value={this.state.credentials.password}
                                    />
                                    <br />
                                    <br />
                                    <Button
                                        type="button"
                                        fullWidth
                                        variant="contained"
                                        style={{ backgroundColor: '#2e7d32', color: 'white' }}
                                        onClick={this.loginUser.bind(this)}
                                        size="large"
                                    >
                                        Login
                                    </Button>
                                    <br />
                                    <br />
                                    <Button
                                        type="button"
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                    >
                                        Register
                                    </Button>
                                </form>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
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