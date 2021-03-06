/**
 * HEADER: A very complex component that displays at the top of the app.
 * Contains a button to open the drawer.
 * Contains MATERIAL-UI tabs to navigate between contact, about, and support. 
 * Contains a language selector.
 * Contains a sign in button when logged out: otherwise, shows avatar, name, and sign out link. 
 */

/* REACT IMPORTS */
import React, { useEffect } from "react";
import { useHistory, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
/* THIRD PARTY IMPORTS */
import LanguageIcon from "@material-ui/icons/Language";
import {
    Select,
    MenuItem,
    IconButton,
    useMediaQuery,
    makeStyles,
    Avatar,
    AppBar,
    Tabs,
    Tab,
    Button,
    Typography,
} from '@material-ui/core';
/* LOCAL IMPORTS */
import { SideDrawer } from "./Drawer";
import { LoginPage } from '../../LoginPage';
import { userActions, profileActions } from '../../_actions';
import { mainLinks } from './common';

/* Styling of the header of the page */
const useStyles = makeStyles(theme => ({
    appBar: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: '0 15px 0 15px',
        width: '100%',
    },
    selectContainer: {
        display: 'flex',
        alignItems: 'center',
        flex: '0 0 auto',
    },
    selectChild: {
        margin: '0 20px 0 5px',
        color: 'white',
    },
    selectAvatar: {
        marginLeft: '5px',
    },
    tabsContainer: {
        display: 'flex',
        alignItems: 'center',
        flex: '0 0 auto',
    },
    inProgramTabs: {
        visibility: 'hidden',
    },
    notLoggedInMenu: {
        visibility: 'hidden',
    },
    signOutLink: {
        background: 'none !important',
        border: 'none',
        padding: '0 !important',
        color: 'white',
        textDecoration: 'underline',
        cursor: 'pointer',
    },
    title: {
        margin: '0 15px 0 15px',
    }
}));

function ImageAvatars(props) {
    const [open, setOpen] = React.useState(false);
    // Payload is profile data.
    const { classes, payload, loggedIn, dispatch, isMobile } = props;
    // Closes the LoginPage dialog on successful login.
    const onLoginAttempt = result => {
        if(result === 'Success') {
            setOpen(false);
        }
    }
    // Displays name, avatar, and sign out link.
    if (!isMobile && loggedIn && payload) {
        const profile = payload;
        return (
            <React.Fragment>
                <span>
                    {`${profile.first_name} ${profile.last_name} `}
                    <button
                        className={classes.signOutLink}
                        onClick={_ => dispatch(userActions.logout(true))}>
                        (Sign Out)
                    </button>
                </span>
                <Avatar
                    className={classes.selectAvatar}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    src={profile.profile_picture} />
            </React.Fragment>
        );
    }
    // Displays sign in link.
    else if (!loggedIn) {
        return (
            <div>
                <Button
                    aria-modal="true"
                    aria-label="Open sign in"
                    variant="contained"
                    onClick={_ => setOpen(true)}>
                    Sign In
                </Button>
                <LoginPage
                    open={open}
                    onLoginAttempt={onLoginAttempt}
                    handleClose={_ => setOpen(false)} />
            </div>
        );
        // Displays sign out link by itself (no picture or name when in mobile)
    } else {
        return (
            <button
                className={classes.signOutLink}
                onClick={_ => dispatch(userActions.logout(true))}>
                (Sign Out)
            </button>
        );
    }
}

function Header(props) {
    const isMobile = useMediaQuery('(max-width:992px)');
    const classes = useStyles();
    const location = useLocation();
    const history = useHistory();
    const dispatch = props.dispatch;

    const { loggedIn } = props.authentication;
    const { payload, loadingProfile, profileLoaded } = props.profile;

    // Whenever rendered, determine if current path is one of the main links.
    const currentPath = mainLinks.find(link => link.url === location.pathname);

    // Retrieve profile data if not retrieved yet.
    useEffect(() => {
        if (loggedIn && !loadingProfile && !profileLoaded) {
            dispatch(profileActions.getProfile());
        }
    });

    const imageAvatarProps = { classes, loggedIn, payload, dispatch, isMobile };

    return (
        <div>
            <AppBar
                position="relative"
                className={classes.appBar}>
                <div className={classes.tabsContainer}>
                    <IconButton
                        className={!loggedIn && !isMobile ? classes.notLoggedInMenu : ''}
                        disabled={!loggedIn && !isMobile}
                        color="inherit"
                        aria-label="open drawer">
                        <SideDrawer />
                    </IconButton>
                    <Typography
                        className={classes.title}
                        component="h1"
                        variant="h6">
                        REVITALIZE
                    </Typography>
                    {!isMobile ?
                    // If not in mobile, display tabs with pathname selected.
                    <Tabs
                        classes={{ indicator: !currentPath ? classes.inProgramTabs : '' }}
                        variant="fullWidth"
                        aria-label="nav tabs"
                        value={currentPath ? currentPath.value : false}
                    >
                        {mainLinks.map(link =>
                            <Tab
                                key={link.label}
                                label={link.label}
                                component="a"
                                onClick={_ => history.push(link.url)} />)}
                    </Tabs> : null
                    }
                </div>
                <div className={classes.selectContainer}>
                    <LanguageIcon />
                    <Select
                        id="Language selector"
                        value="EN"
                        className={classes.selectChild}
                    >
                        <MenuItem value="EN">EN</MenuItem>
                        <MenuItem value="FR">FR</MenuItem>
                    </Select>
                    <ImageAvatars {...imageAvatarProps} />
                </div>
            </AppBar>
        </div>
    );
}

function mapStateToProps(state) {
    const { authentication, profile } = state;
    return {
        authentication,
        profile,
    };
}

const connectedHeader = connect(mapStateToProps)(Header);
export { connectedHeader as Header };