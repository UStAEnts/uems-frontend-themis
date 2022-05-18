import classes from './Sidebar.module.scss';
import React, {MouseEventHandler} from "react";
import {NavLink, useLocation} from 'react-router-dom';

const and = (...c: (string | undefined)[]) => c.filter((e) => e !== undefined).join(' ');
const activeIfTrue = (current: string, path: RegExp) => path.test(current) ? classes.active : undefined;

const MdiViewDashboardOutline = () => (<svg style={{width: '24px', height: '24px'}} viewBox="0 0 24 24">
    <path fill="currentColor"
          d="M19,5V7H15V5H19M9,5V11H5V5H9M19,13V19H15V13H19M9,17V19H5V17H9M21,3H13V9H21V3M11,3H3V13H11V3M21,11H13V21H21V11M11,15H3V21H11V15Z"/>
</svg>);
const MdiTicketOutline = () => (<svg style={{width: '24px', height: '24px'}} viewBox="0 0 24 24">
    <path fill="currentColor"
          d="M4,4A2,2 0 0,0 2,6V10A2,2 0 0,1 4,12A2,2 0 0,1 2,14V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V14A2,2 0 0,1 20,12A2,2 0 0,1 22,10V6A2,2 0 0,0 20,4H4M4,6H20V8.54C18.76,9.25 18,10.57 18,12C18,13.43 18.76,14.75 20,15.46V18H4V15.46C5.24,14.75 6,13.43 6,12C6,10.57 5.24,9.25 4,8.54V6Z"/>
</svg>);
const MdiPlusCircleOutline = () => (<svg style={{width: '24px', height: '24px'}} viewBox="0 0 24 24">
    <path fill="currentColor"
          d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M13,7H11V11H7V13H11V17H13V13H17V11H13V7Z"/>
</svg>);
const MdiMapMarkerOutline = () => (<svg style={{width: '24px', height: '24px'}} viewBox="0 0 24 24">
    <path fill="currentColor"
          d="M12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5M12,2A7,7 0 0,1 19,9C19,14.25 12,22 12,22C12,22 5,14.25 5,9A7,7 0 0,1 12,2M12,4A5,5 0 0,0 7,9C7,10 7,12 12,18.71C17,12 17,10 17,9A5,5 0 0,0 12,4Z"/>
</svg>);
const MdiLabelVariantOutline = () => (<svg style={{width: '24px', height: '24px'}} viewBox="0 0 24 24">
    <path fill="currentColor"
          d="M6.5,17H15L18.5,12L15,7H6.5L10,12L6.5,17M15,19H3L7.5,12L3,5H15C15.69,5 16.23,5.3 16.64,5.86L21,12L16.64,18.14C16.23,18.7 15.69,19 15,19Z"/>
</svg>);
const MdiLabelOutline = () => (<svg style={{width: '24px', height: '24px'}} viewBox="0 0 24 24">
    <path fill="currentColor"
          d="M16,17H5V7H16L19.55,12M17.63,5.84C17.27,5.33 16.67,5 16,5H5A2,2 0 0,0 3,7V17A2,2 0 0,0 5,19H16C16.67,19 17.27,18.66 17.63,18.15L22,12L17.63,5.84Z"/>
</svg>);
const MdiToolBoxOutline = () => (<svg style={{width: '24px', height: '24px'}} viewBox="0 0 24 24">
    <path fill="currentColor"
          d="M20,18V14H17V15H15V14H9V15H7V14H4V18H20M6.33,8L4.59,12H7V11H9V12H15V11H17V12H19.41L17.67,8H6.33M9,5V6H15V5H9M21.84,12.61C21.94,12.83 22,13.09 22,13.41V18C22,18.53 21.79,19 21.4,19.41C21,19.81 20.55,20 20,20H4C3.45,20 3,19.81 2.6,19.41C2.21,19 2,18.53 2,18V13.41C2,13.09 2.06,12.83 2.16,12.61L4.5,7.22C4.84,6.41 5.45,6 6.33,6H7V5C7,4.45 7.18,4 7.57,3.59C7.96,3.2 8.44,3 9,3H15C15.56,3 16.04,3.2 16.43,3.59C16.82,4 17,4.45 17,5V6H17.67C18.55,6 19.16,6.41 19.5,7.22L21.84,12.61Z"/>
</svg>);
const MdiSendOutline = () => (<svg style={{width: '24px', height: '24px'}} viewBox="0 0 24 24">
    <path fill="currentColor"
          d="M4 6.03L11.5 9.25L4 8.25L4 6.03M11.5 14.75L4 17.97V15.75L11.5 14.75M2 3L2 10L17 12L2 14L2 21L23 12L2 3Z"/>
</svg>);
const MdiCardTextOutline = () => (<svg style={{width: '24px', height: '24px'}} viewBox="0 0 24 24">
    <path fill="currentColor" d="M20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20M4,6V18H20V6H4M6,9H18V11H6V9M6,13H16V15H6V13Z" />
</svg>)

export default function Sidebar() {
    const location = useLocation();
    const ait = activeIfTrue.bind(undefined, location.pathname);

    const navLinkClick: MouseEventHandler<HTMLElement> = (e) => {
        // const sidebar = e.currentTarget.closest(`.${classes.sidebar}`);
        // if (!sidebar) return;
        //
        // const markerActive = sidebar.querySelector(`.${classes.marker}.${classes.active}`);
        // const linkActive = sidebar.querySelector(`.${classes.navigationLink}.${classes.active}`);
        //
        // if (markerActive) markerActive.classList.remove(classes.active);
        // if (linkActive) linkActive.classList.remove(classes.active);
        //
        // e.currentTarget.classList.add(classes.active);
        // if (e.currentTarget.parentElement && e.currentTarget.parentElement.classList.contains(classes.marker)) e.currentTarget.parentElement.classList.add(classes.active);
    }

    return (
        <div className={and(classes.sidebar, classes.expanded)}>
            <img className={classes.header} src={"/ents-crew-white.png"} style={{filter: 'invert(1)'}} alt={"UEMS Logo: the text UEMS in a geometric font at the bottom of a black stroked rectangle"}/>
            <div className={classes.spacer}/>
            <NavLink to="/" exact className={classes.navigationLink} onClick={navLinkClick}
                     activeClassName={classes.active}>
                <div className={classes.icon}>
                    <MdiViewDashboardOutline/>
                </div>
                <span className={classes.name}>Dashboard</span>
            </NavLink>

            <div className={and(classes.marker, ait(/\/events\/?.*/))}>
                <NavLink to="/events" className={classes.navigationLink} onClick={navLinkClick} activeClassName={classes.active}>
                    <div className={classes.icon}>
                        <MdiTicketOutline/>
                    </div>
                    <span className={classes.name}>Events</span>
                </NavLink>
                <NavLink to="/events/create" exact className={and(classes.navigationLink, classes.sub)}
                         onClick={navLinkClick} activeClassName={classes.active}>
                    <div className={classes.icon}>
                        <MdiPlusCircleOutline/>
                    </div>
                    <span className={classes.name}>Create</span>
                </NavLink>
            </div>

            <div className={and(classes.marker, ait(/\/venues\/?.*/))}>
                <NavLink to="/venues" className={classes.navigationLink} onClick={navLinkClick} activeClassName={classes.active}>
                    <div className={classes.icon}>
                        <MdiMapMarkerOutline/>
                    </div>
                    <span className={classes.name}>Venues</span>
                </NavLink>
                <NavLink to="/venues/create" exact className={and(classes.navigationLink, classes.sub)}
                         onClick={navLinkClick} activeClassName={classes.active}>
                    <div className={classes.icon}>
                        <MdiPlusCircleOutline/>
                    </div>
                    <span className={classes.name}>Create</span>
                </NavLink>
            </div>

            <div className={and(classes.marker, ait(/\/ents\/?.*/))}>
                <NavLink to="/ents" className={classes.navigationLink} onClick={navLinkClick} activeClassName={classes.active}>
                    <div className={classes.icon}>
                        <MdiLabelVariantOutline/>
                    </div>
                    <span className={classes.name}>Ent States</span>
                </NavLink>
                <NavLink to="/ents/create" exact className={and(classes.navigationLink, classes.sub)}
                         onClick={navLinkClick} activeClassName={classes.active}>
                    <div className={classes.icon}>
                        <MdiPlusCircleOutline/>
                    </div>
                    <span className={classes.name}>Create</span>
                </NavLink>
            </div>

            <div className={and(classes.marker, ait(/\/states\/?.*/))}>
                <NavLink to="/states" className={classes.navigationLink} onClick={navLinkClick} activeClassName={classes.active}>
                    <div className={classes.icon}>
                        <MdiLabelOutline/>
                    </div>
                    <span className={classes.name}>States</span>
                </NavLink>
                <NavLink to="/states/create" exact className={and(classes.navigationLink, classes.sub)}
                         onClick={navLinkClick} activeClassName={classes.active}>
                    <div className={classes.icon}>
                        <MdiPlusCircleOutline/>
                    </div>
                    <span className={classes.name}>Create</span>
                </NavLink>
            </div>

            <div className={and(classes.marker, ait(/\/topics\/?.*/))}>
                <NavLink to="/topics" className={classes.navigationLink} onClick={navLinkClick} activeClassName={classes.active}>
                    <div className={classes.icon}>
                        <MdiCardTextOutline/>
                    </div>
                    <span className={classes.name}>Topics</span>
                </NavLink>
                <NavLink to="/topics/create" exact className={and(classes.navigationLink, classes.sub)}
                         onClick={navLinkClick} activeClassName={classes.active}>
                    <div className={classes.icon}>
                        <MdiPlusCircleOutline/>
                    </div>
                    <span className={classes.name}>Create</span>
                </NavLink>
            </div>

            <div className={and(classes.marker, ait(/\/equipment\/?.*/))}>
                <NavLink to="/equipment" className={classes.navigationLink} onClick={navLinkClick} activeClassName={classes.active}>
                    <div className={classes.icon}>
                        <MdiToolBoxOutline/>
                    </div>
                    <span className={classes.name}>Equipment</span>
                </NavLink>
                <NavLink to="/equipment/create" exact className={and(classes.navigationLink, classes.sub)}
                         onClick={navLinkClick} activeClassName={classes.active}>
                    <div className={classes.icon}>
                        <MdiPlusCircleOutline/>
                    </div>
                    <span className={classes.name}>Create</span>
                </NavLink>
            </div>

            <NavLink to="/workflow/ops" exact className={classes.navigationLink} onClick={navLinkClick} activeClassName={classes.active}>
                <div className={classes.icon}>
                    <MdiSendOutline/>
                </div>
                <span className={classes.name}>Ops Planning</span>
            </NavLink>
        </div>
    )
}