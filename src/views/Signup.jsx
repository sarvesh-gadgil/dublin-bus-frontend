import React,{ useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import ReactDOM from 'react-dom';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff'; 
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import login_banner from '../images/login_banner.jpg';
 
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

 const useStyles = (theme) => ({
       root: {
        width: '100%',
        '& > * + *': {
          marginTop: theme.spacing(0),
        },
      },
      paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      },
      avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
      },
      form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(3),
      },
      submit: {
        margin: theme.spacing(3, 0, 2),
      },
  });

export class signup extends React.Component{
   
  constructor(){
    super();
    this.state = {
      firstName : '',
      lastName : '',
      email : '',
      password : '',
      showPassword : false,
      showConfirmPassword: false,
      isFirstNameError : false,
      isLastNameError : false,
      isEmailError : false,
      isPasswordError : false,
      isConfirmPasswordError: false,
      success : '',
      failure : '',
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleClickShowPassword = this.handleClickShowPassword.bind(this);
    this.handleClickShowConfirmPassword = this.handleClickShowConfirmPassword.bind(this);
    this.handleMouseDownPassword = this.handleMouseDownPassword.bind(this);
  }

  handleClickShowPassword(){
    if(this.state.showPassword){
      this.setState({"showPassword":false});
    }else{
      this.setState({"showPassword":true});
    }
  }
    handleClickShowConfirmPassword(){
      if(this.state.showConfirmPassword){
        this.setState({"showConfirmPassword":false});
      }else{
        this.setState({"showConfirmPassword":true});
      }
    
  }

  handleMouseDownPassword(event){
    event.preventDefault();
  }

   handleChange(event, key){
        this.setState({[key]:event.target.value});
        this.setState({"isFirstNameError":false, "isLastNameError":false, "isEmailError":false, "isPasswordError":false,"isConfirmPasswordError":false});
    }

   handleSubmit(event) {
      event.preventDefault();
      // const {first_name, last_name, username, password} = this.state;
      const data = {};
      data.first_name=this.state.firstName;
      data.last_name=this.state.lastName;
      data.username=this.state.email;
      data.password=this.state.password;
     
      const form = new FormData(event.target);
      console.log(form);
      //var letterNumber = /^[0-9]+$/;
      if(data.first_name.length > 50  || data.first_name.length < 1|| (/[^a-zA-Z]/.test(data.first_name))) {
          this.setState({"isFirstNameError" : true});
      }else if(data.last_name.length > 50 || data.last_name.length < 1|| (/[^a-zA-Z]/.test(data.last_name))){
          this.setState({"isLastNameError" : true});
      }else if(data.username.length < 3 || !data.username.includes("@")){
          this.setState({"isEmailError" : true}); 
      }else if(data.password.length < 7){
           this.setState({"isPasswordError" : true});
      }else if(data.password!=this.state.confirmpassword){
          this.setState({"isConfirmPasswordError" : true});
      }else{
        // export const login = (firstname,lastname,username, password) => {
        //   return dispatch => {
        //     return axios.post(API_URL + "api/user/create/",
        //       username,
        //       password
        //     ).then(res => {
        //       localStorage.setItem('authToken', res.data.token);
        //       setAuthToken(res.data.token);
        //       dispatch({ type: LOGIN_ACTION, user: { user_id: res.data.user_id, first_name: res.data.first_name } });
        //     })
        //   }
        // };
        
        console.log(data);
        fetch('/user/create', {
          method: 'POST',
          body: data,
          
        }).then((response)=> {
          if(response.status == 200){
            this.setState({first_name : '',last_name : '',username : '',password : '', success:'true'});
             setTimeout(() => {this.setState({"success":''})}, 3000);

         }else{
          this.setState({first_name : '',last_name : '',username : '',password : '', failure:'true'});
          setTimeout(() => {this.setState({"failure":''})}, 3000);
         }
       

         

      });
    }
   }

  handleClose(event, reason) {
    this.setState({"success":''});
  }

  render(){
    const { classes } = this.props;
    const {isFirstNameError, isLastNameError, isEmailError, isPasswordError, isConfirmPasswordError} = this.state;


  return (

    <Container component="main" maxWidth="xs">
      <Snackbar open= {this.state.success} autoHideDuration={2000} onClose={this.handleClose}>
        <Alert onClose={this.handleClose} severity="success">
          Registered Successfully!!!
        </Alert>
      </Snackbar>
      <Snackbar open= {this.state.failure} autoHideDuration={2000} onClose={this.handleClose}>
       <Alert onClose={this.handleClose} severity="error">
         Error in Registration!!!
       </Alert>
     </Snackbar>
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar} />
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <form className={classes.form}  onSubmit = {this.handleSubmit} >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                error = {isFirstNameError}
                autoComplete="fname"
                name="firstName"
                variant="outlined"
                required
                fullWidth
                id="firstName"
                size="small"
                label="First Name"
                value= {this.state.firstName}
                autoFocus
                onChange = {(e)=>this.handleChange(e, 'firstName')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                error = {isLastNameError}
                variant="outlined"
                required
                fullWidth
                id="lastName"
                size="small"
                label="Last Name"
                value= {this.state.lastName}
                name="lastName"
                autoComplete="lname"
                 onChange = {(e)=>this.handleChange(e, 'lastName')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                error = {isEmailError}
                variant="outlined"
                required
                fullWidth
                id="email"
                size="small"
                label="Email Address"
                value= {this.state.email}
                name="email"
                autoComplete="email"
                 onChange = {(e)=>this.handleChange(e, 'email')}
              />
            </Grid>
            <Grid item xs={12}>
            {/* <InputLabel htmlFor="outlined-adornment-password">
                    Password
              </InputLabel> */}
              
              {/* <OutlinedInput */}
              <TextField
                error = {isPasswordError}
                  required
                  fullWidth
                  label="Password"
                  id="password"
                  size="small"
                  variant="outlined"
                  name="password"
                    // id="outlined-adornment-password"
                    type={this.state.showPassword ? "text" : "password"}
                    value={this.state.password}
                    onChange={(e)=>this.handleChange(e, 'password')}
                    InputProps={{
                      endAdornment : (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={this.handleClickShowPassword}
                          onMouseDown={this.handleMouseDownPassword}
                          edge="end"
                        >
                          {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                      )
                    }}
                 
                   /> 
            </Grid>
            <Grid item xs={12}>
            <TextField
            error = {isConfirmPasswordError}
              required
              fullWidth
              label="Confirm Password"
              id="confirmPassword"
              size="small"
              variant="outlined"
              name="confirmpassword"
                // id="outlined-adornment-password"
                type={this.state.showConfirmPassword ? "text" : "password"}
                value={this.state.confirmpassword}
                onChange={(e)=>this.handleChange(e, 'confirmpassword')}
                InputProps={{
                  endAdornment : (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={this.handleClickShowConfirmPassword}
                      onMouseDown={this.handleMouseDownPassword}
                      edge="end"
                    >
                      {this.state.showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                  )
                }}
              /> 
              </Grid>
            <Button
            type="submit"
            size="large"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign Up
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Link href="#" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
    </Container>

   
  );
  }

}



  export default withStyles(useStyles)(signup)

