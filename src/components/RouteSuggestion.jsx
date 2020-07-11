import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowRightAltSharpIcon from '@material-ui/icons/ArrowRightAltSharp';
// import DirectionsBusIcon from '@material-ui/icons/DirectionsBus';
import Paper from '@material-ui/core/Paper';

const welcomeMessageAndSuggestion = (props) => {

    const currentHrs = new Date().getHours();
    let welcomeMsg = null;
    if (currentHrs < 12) {
        welcomeMsg = "Good Morning, ";
    } else if (currentHrs < 18) {
        welcomeMsg = "Good Afternoon, ";
    } else {
        welcomeMsg = "Good Evening, ";
    }

    return (
        <div>
            <Typography variant="h3" style={{ color: "black", fontFamily: "Tahoma" }}>
                {welcomeMsg}{props.user.first_name}
            </Typography>
            <Paper elevation={0} style={{ padding: "10px", backgroundColor: "transparent" }}>
                <div style={{ overflow: "auto" }}>
                    <Typography color="textSecondary">
                        Recent Routes
                    </Typography>
                    <ButtonGroup variant="contained">
                        <Button style={{ textTransform: "none", backgroundColor: "rgb(19,19,19)", color: "white" }}>Limekiln Ave (4392)<ArrowRightAltSharpIcon fontSize="small" /> St. James's Road (2462)</Button>
                        <Button style={{ textTransform: "none", backgroundColor: "rgb(19,19,19)", color: "white" }}>Limekiln Ave (4392)<ArrowRightAltSharpIcon fontSize="small" /> St. James's Road (2462)</Button>
                        <Button style={{ textTransform: "none", backgroundColor: "rgb(19,19,19)", color: "white" }}>Limekiln Ave (4392)<ArrowRightAltSharpIcon fontSize="small" /> St. James's Road (2462)</Button>
                    </ButtonGroup>
                </div>
            </Paper>
            <br />
        </div>
    )
}

export default welcomeMessageAndSuggestion;