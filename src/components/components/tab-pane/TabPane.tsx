import * as React from 'react';
import InputUtilities from '../../../utilities/InputUtilities';

import './TabPane.scss';

export type Pane = {
    name: string,
    tooltip?: string,
    content: React.ReactElement,
    key: string,
    initial?: boolean
}

export type TabPanePropsType = {
    style?: React.CSSProperties,
    classes?: {
        tab?: string,
        activeTab?: string,
        body?: string,
        activeBody?: string,
    },
    unmountHidden?: boolean,
    panes: Pane[],
    listeners?: {
        onTabChange?: (oldPane: Pane | undefined, newPane: Pane) => void,
    },
}

export type TabPaneStateType = {
    activeTabKey: string,
};

export class TabPane extends React.Component<TabPanePropsType, TabPaneStateType> {

    static displayName = 'TabPane';

    constructor(props: Readonly<TabPanePropsType>) {
        super(props);

        this.state = {
            activeTabKey: this.props.panes.length === 0 ? '' : (this.props.panes.find((e) => e.initial) || this.props.panes[0]).key,
        };

        this.changeTab = this.changeTab.bind(this);
    }

    private getClass(type: 'tab' | 'activeTab' | 'body' | 'activeBody'): string {
        const defaults = {
            tab: 'tab',
            activeTab: 'active',
            body: 'body',
            activeBody: 'active',
        };

        const result = { ...defaults, ...this.props.classes || {} };
        // if (type === 'tab')
        return result[type];
    }

    private changeTab(newPane: Pane) {
        if (this.props.listeners && this.props.listeners.onTabChange) {
            this.props.listeners.onTabChange(
                this.props.panes.find((e) => e.key === this.state.activeTabKey),
                newPane,
            );
        }

        this.setState((oldState) => ({
            ...oldState,
            activeTabKey: newPane.key,
        }));
    }

    private generateTab(pane: Pane | undefined, isActive: boolean) {
        if (pane === undefined) return undefined;

        let className = this.getClass('tab');
        if (isActive) className += ` ${this.getClass('activeTab')}`;

        return (
            <div
                className={className}
                onClick={() => this.changeTab(pane)}
                role="button"
                key={pane.key}
                tabIndex={0}
                onKeyPress={InputUtilities.higherOrderPress(32, () => this.changeTab(pane), this)}
            >
                {pane.name}
            </div>
        );
    }

    private generatePane(pane: Pane | undefined, isActive: boolean) {
        if (pane === undefined) return undefined;

        let className = this.getClass('body');

        if (isActive) className += ` ${this.getClass('activeBody')}`;

        return (
            <div
                key={pane.key}
                className={className}
            >
                {pane.content}
            </div>
        );
    }

    render() {
        if (this.props.panes.length === 0) return undefined;

        const tabs = this.props.panes.map((e) => this.generateTab(e, e.key === this.state.activeTabKey));

        let elements;

        if (this.props.unmountHidden) {
            // If we are unmounting the hidden elements then we need to make sure we don't render any of them except the
            // active one
            elements = [this.generatePane(
                this.props.panes.find((e) => e.key === this.state.activeTabKey),
                true,
            )];
        } else {
            // If we are keeping them all mounted we need to have all of them but only one active
            elements = this.props.panes.map((pane) => this.generatePane(pane, pane.key === this.state.activeTabKey));
        }

        return (
            <div className="tabbed-pane">
                <div className="tabs">
                    {tabs}
                </div>
                <div className="bodies">
                    {elements}
                </div>
            </div>
        );
    }
}
