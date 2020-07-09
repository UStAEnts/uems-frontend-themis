// eslint-disable-next-line import/no-extraneous-dependencies
import JavascriptTimeAgo from 'javascript-time-ago';
// eslint-disable-next-line import/no-extraneous-dependencies
import en from 'javascript-time-ago/locale/en';

import React from 'react';
import ReactDOM from 'react-dom';
import './pages/index/index.scss';
import './pages/index/flexboxgrid.css';
import { BrowserRouter, NavLink, Route, Switch } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faCalendarTimes, faColumns, faPaperPlane, faWrench } from '@fortawesome/free-solid-svg-icons';
import App from './pages/App';
import { Events } from './pages/events/Events';
import Event  from "./pages/event/Event";
import moment from "moment";

import 'react-dates/initialize';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import 'flatpickr/dist/themes/material_green.css'

// Register EN locale for time ago components
JavascriptTimeAgo.addLocale(en);

// Set moment rounding thresholds to get more useful relative times
moment.relativeTimeThreshold('s', 60);
moment.relativeTimeThreshold('m', 60);
moment.relativeTimeThreshold('h', 24);
moment.relativeTimeThreshold('d', 31);
moment.relativeTimeThreshold('M', 12);
moment.relativeTimeThreshold('y', 365);

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <div className="sidebar-real">
                <img
                    src="/ents-crew-white.png"
                    className="header-image"
                    alt="UEMS Logo: The text UEMS in a bold geometric font surrounded by a white outlined rectangle."
                />
                <div className="sidebar-content">
                    <NavLink exact to="/" className="entry">
                        <FontAwesomeIcon icon={faColumns} />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/events" className="entry">
                        <FontAwesomeIcon icon={faCalendarTimes} />
                        <span>Events</span>
                    </NavLink>
                    <NavLink to="/equipment" className="entry">
                        <FontAwesomeIcon icon={faBox} />
                        <span>Equipment</span>
                    </NavLink>
                    <NavLink to="/ents" className="entry">
                        <FontAwesomeIcon icon={faWrench} />
                        <span>Ents</span>
                    </NavLink>
                    <NavLink to="/ops-planning" className="entry">
                        <FontAwesomeIcon icon={faPaperPlane} />
                        <span>Ops Planning</span>
                    </NavLink>
                </div>
            </div>

            <div className="sidebar-spacer" />

            <div className="content">
                <Switch>
                    <Route path="/events/:id" exact>
                        <Event/>
                    </Route>
                    <Route path="/events" exact>
                        <Events />
                    </Route>
                    <Route path="/" exact>
                        <App />
                    </Route>
                </Switch>
            </div>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
