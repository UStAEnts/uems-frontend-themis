import React from 'react';
import ReactDOM from 'react-dom';
import './pages/index/index.scss';
import './pages/index/flexboxgrid.css';
import App from './pages/App';
import * as serviceWorker from './worker/serviceWorker';
import {BrowserRouter, Route, Switch} from "react-router-dom";
import {StyleDemo} from "./pages/style-demo/StyleDemo";

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <div className={"sidebar-real"}>
                <img src={"/ents-crew-white.png"} className={"header-image"} alt={"UEMS Logo: The text UEMS in a bold geometric font surrounded by a white outlined rectangle."}/>
            </div>

            <div className={"sidebar-spacer"}>
            </div>

            <div className={"content"}>
                <Switch>
                    <Route path="/style-demo">
                        <StyleDemo/>
                    </Route>
                    <Route path="/" exact>
                        <App/>
                    </Route>
                </Switch>
            </div>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
