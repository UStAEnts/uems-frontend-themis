import * as React from "react";
export type StyleDemoPropsType = {};

export type StyleDemoStateType = {};

export class StyleDemo extends React.Component<StyleDemoPropsType, StyleDemoStateType> {

    static displayName = "StyleDemo";



    render() {
        return <div style={{padding: '30px'}}>
            <h1>Component Demos</h1>

        </div>;
    }

}
