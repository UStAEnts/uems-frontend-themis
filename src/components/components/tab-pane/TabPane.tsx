import * as React from 'react';
import InputUtilities from '../../../utilities/InputUtilities';

import './TabPane.scss';

export type Pane = {
	/**
	 * The title of the pane to be rendered
	 */
	name: string;
	/**
	 * An optional tooltip to be displayed on the pane title
	 */
	tooltip?: string;
	/**
	 * The content of the pane to be rendered
	 */
	content: React.ReactElement;
	/**
	 * The key of the pane which should be unique across all tabs
	 */
	key: string;
	/**
	 * If this tab should be the initial tab to be opened
	 */
	initial?: boolean;
};

export type TabPanePropsType = {
	/**
	 * The styles to be applied to the container of this tab pane
	 */
	style?: React.CSSProperties;
	/**
	 * The class overrides to be applied to tabs and bodies when they are active to allow for custom styling
	 */
	classes?: {
		/**
		 * The class to be added to tabs. This will always be present, even when activated
		 */
		tab?: string;
		/**
		 * The class to be added to active tabs. This will only be present when the tab is currently active
		 */
		activeTab?: string;
		/**
		 * The class to be added to bodies. This will always be present, even when activated
		 */
		body?: string;
		/**
		 * The class to be added to active bodies. This will only be present when the tab is currently active
		 */
		activeBody?: string;
	};
	/**
	 * If the other panes should be removed from the render hierarchy when not active. If false or unspecified, the
	 * other body elements will be kept in the DOM tree but hidden
	 */
	unmountHidden?: boolean;
	/**
	 * The panes to render in this tab pane
	 */
	panes: Pane[];
	listeners?: {
		/**
		 * The listener to be called when a new tab is selected. The old pane may be passed if it has been stored but
		 * it is not guaranteed to be in every call
		 * @param oldPane the old pane if stored
		 * @param newPane the new pane which has been selected
		 */
		onTabChange?: (oldPane: Pane | undefined, newPane: Pane) => void;
	};
};

export type TabPaneStateType = {
	/**
	 * The key of the currently active pane
	 */
	activeTabKey: string;
};

export class TabPane extends React.Component<
	TabPanePropsType,
	TabPaneStateType
> {
	static displayName = 'TabPane';

	constructor(props: Readonly<TabPanePropsType>) {
		super(props);

		this.state = {
			activeTabKey:
				this.props.panes.length === 0
					? ''
					: (this.props.panes.find((e) => e.initial) || this.props.panes[0])
							.key,
		};

		this.changeTab = this.changeTab.bind(this);
	}

	/**
	 * Returns the class for the given type. This will provide either the default value or the overrides if they are
	 * defined. Unless otherwise provided, they will be 'tab' and 'body' with 'active' added to any active entry.
	 * @param type the type of tab to fetch a class from
	 */
	private getClass(type: 'tab' | 'activeTab' | 'body' | 'activeBody'): string {
		const defaults = {
			tab: 'tab',
			activeTab: 'active',
			body: 'body',
			activeBody: 'active',
		};

		const result = { ...defaults, ...(this.props.classes || {}) };
		return result[type];
	}

	/**
	 * Changes the currently active tab. It will notify the listener if one is provided and then the state will be
	 * updated with the new active tab key
	 * @param newPane the pane which should be switched to
	 */
	private changeTab(newPane: Pane) {
		if (this.props.listeners && this.props.listeners.onTabChange) {
			this.props.listeners.onTabChange(
				this.props.panes.find((e) => e.key === this.state.activeTabKey),
				newPane
			);
		}

		this.setState((oldState) => ({
			...oldState,
			activeTabKey: newPane.key,
		}));
	}

	/**
	 * Generates a new tab with accessibility features. It will return a div with the tab name and an on click listener
	 * key listener and a valid tab index.
	 * @param pane the pane for which this tab should be generated
	 * @param isActive if this tab is currently active
	 */
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
				onKeyPress={InputUtilities.higherOrderPress(
					32,
					() => this.changeTab(pane),
					this
				)}
			>
				{pane.name}
			</div>
		);
	}

	/**
	 * Generates a new tab pane containing the children of the provided pane. This will generate a class via
	 * {@link getClass}.
	 * @param pane the pane which should be rendered
	 * @param isActive if this pane is currently active
	 */
	private generatePane(pane: Pane | undefined, isActive: boolean) {
		if (pane === undefined) return undefined;

		let className = this.getClass('body');

		if (isActive) className += ` ${this.getClass('activeBody')}`;

		return (
			<div key={pane.key} className={className}>
				{pane.content}
			</div>
		);
	}

	render() {
		if (this.props.panes.length === 0) return undefined;

		const tabs = this.props.panes.map((e) =>
			this.generateTab(e, e.key === this.state.activeTabKey)
		);

		let elements;

		if (this.props.unmountHidden) {
			// If we are unmounting the hidden elements then we need to make sure we don't render any of them except the
			// active one
			elements = [
				this.generatePane(
					this.props.panes.find((e) => e.key === this.state.activeTabKey),
					true
				),
			];
		} else {
			// If we are keeping them all mounted we need to have all of them but only one active
			elements = this.props.panes.map((pane) =>
				this.generatePane(pane, pane.key === this.state.activeTabKey)
			);
		}

		return (
			<div className="tabbed-pane" style={this.props.style}>
				<div className="tabs">{tabs}</div>
				<div className="bodies">{elements}</div>
			</div>
		);
	}
}
