import * as React from 'react';
import { MutableRefObject } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { Transition } from 'react-transition-group';
import { v4 } from 'uuid';

import './Select.scss';
import InputUtilities from '../../../utilities/InputUtilities';

export type KeyValueOption = { text: string, value: string, additional?: any };

export type KeyValueConfiguration = {
    options: KeyValueOption[],
    initialOption?: KeyValueOption,
    onSelectListener?: (option: KeyValueOption) => void,
};

export type StringConfiguration = {
    options: string[],
    initialOption?: string,
    onSelectListener?: (option: string) => void,
};

export type SelectPropsType = {
    /**
     * The placeholder value to display in this select when no value is selected
     */
    placeholder: string,
    /**
     * The name of this select to be set as the 'name' and 'id' on the actual input element
     */
    name: string,
    /**
     * The possible options in the select
     */
    options: string[] | KeyValueOption[],
    // /**
    //  * The initially selected option
    //  */
    // initialOption?: string | KeyValueOption
    // /**
    //  * Listener to be called when the option is changed
    //  * @param option the option which is now selected
    //  */
    // onSelectListener?: (option: string | KeyValueOption) => void,
} & (KeyValueConfiguration | StringConfiguration);

export type SelectStateType = {
    /**
     * The currently selected element or undefined if it is currently displaying the placeholder
     */
    selected: string | KeyValueOption | undefined,
    /**
     * If the menu is currently open for this select
     */
    active: boolean,
    /**
     * UUID for prepending to keys
     */
    uuid: string,
};

export class Select extends React.Component<SelectPropsType, SelectStateType> {

    /**
     * When the props change we may need to update the state to allow this component to be controlled and managed from
     * its parents instead of being managed internally. When the initialOption property changes, a new derived state
     * will be returned, otherwise null will be returned to represent that no changes are required
     * @param props the new properties as described by {@link SelectPropsType}
     * @param state the existing state as described by {@link SelectStateType}
     */
    static getDerivedStateFromProps(props: SelectPropsType, state: SelectStateType) {
        if (props.initialOption !== undefined && props.initialOption !== state.selected) {
            return {
                ...state,
                selected: props.initialOption,
            } as SelectStateType;
        }

        return null;
    }

    static displayName = 'Select';

    /**
     * Reference to the entire select element, used to determine if the menu should be closed on click.
     */
    private wrapperRef: MutableRefObject<any>;

    /**
     * Reference to the list of elemewnts to provide CSS transitions
     */
    private ulRef: MutableRefObject<any>;

    constructor(props: Readonly<SelectPropsType>) {
        super(props);

        this.state = {
            selected: (this.props.initialOption || undefined),
            active: false,
            uuid: v4(),
        };

        this.wrapperRef = React.createRef();
        this.ulRef = React.createRef();
        // Make sure handleClickOutside always has the right 'this' value.
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    /**
     * Binds the click listener when the component mounts so we can close the menu when relevant
     */
    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    /**
     * Unbinds click listener described in {@link componentDidMount}
     */
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    /**
     * Determines is a click on the document was outside this element, and if so, deactivates the list
     * @param event the moust event from the HTML listener
     */
    private handleClickOutside(event: MouseEvent) {
        if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
            this.deactivateList();
        }
    }

    /**
     * Selects the given open and closes the menu (active = false) by updating the state
     * @param option the option to select as the active entry
     */
    private handleEntryClick(option: string | KeyValueOption) {
        if (this.props.onSelectListener) { // @ts-ignore
            this.props.onSelectListener(option);
        }
        this.setState((oldState) => ({
            ...oldState,
            selected: option,
            active: false,
        }));
    }

    /**
     * Opens the list (active = true) by updating the state
     */
    private activateList() {
        this.setState((oldState) => ({
            ...oldState,
            active: true,
        }));
    }

    /**
     * Closes the list (active = false) by updating the state
     */
    private deactivateList() {
        this.setState((oldState) => ({
            ...oldState,
            active: false,
        }));
    }

    /**
     * Shows or hides the list reference if it is currently associated with the reference
     * @param incoming if the menu should be shown (true) or hidden (false)
     */
    private showMenuIfCurrent(incoming: boolean) {
        if (this.ulRef.current) {
            this.ulRef.current.style.display = incoming ? 'block' : 'none';
        }
    }

    render() {
        const list: any[] = [];
        for (const option of this.props.options) {
            // Generate a list entry option for every option. They must support a key press to comply with accessibility
            // options so they are bound to space. Their key is produced from this classes UUID and the option name
            // to ensure multiple selects of the same type can exist without any key overlap.
            if (typeof (option) === 'string') {
                list.push(
                    <li
                        onKeyPress={(e) => InputUtilities.bindKeyPress(e, 32, this.handleEntryClick, this, option)}
                        role="option"
                        aria-label={option}
                        aria-selected={this.state.selected === option}
                        onClick={() => this.handleEntryClick(option)}
                        className={`md-sl-li${this.state.selected === option ? ' md-sl-active' : ''}`}
                        value={option}
                        key={`${this.state.uuid}.${option}`}
                    >
                        {option}
                    </li>,
                );
            } else {
                list.push(
                    <li
                        onKeyPress={(e) => InputUtilities.bindKeyPress(e, 32, this.handleEntryClick, this, option)}
                        role="option"
                        aria-label={option.text}
                        aria-selected={this.state.selected === option}
                        key={`${this.state.uuid}.${option.value}`}
                        className={`md-sl-li${this.state.selected === option ? ' md-sl-active' : ''}`}
                        value={option.value}
                        onClick={() => this.handleEntryClick(option)}
                    >
                        {option.text}
                    </li>,
                );
            }
        }

        // If there is a selected element we need to extract its key if it is an object or just the selected value if
        // not so we can apply the right value
        let selectedKey;
        if (this.state.selected) {
            if (typeof (this.state.selected) === 'string') selectedKey = this.state.selected;
            else selectedKey = this.state.selected.text;
        }

        const text = this.state.selected
            // Because the generated divs for this select are meant to represent an input, we need to make them comply
            // with the accessibility options. Therefore they need to be marked as a button because the user can click
            // it and from before because they have an on click handler they also need a key listener and to ensure they
            // fit into the natural flow of the page, they need to have a tab index.
            ? (
                <div
                    onKeyPress={InputUtilities.higherOrderPress(32, this.activateList, this)}
                    tabIndex={0}
                    role="button"
                    data-testid={`launch-menu-${this.props.name}`}
                    aria-label="launch-menu"
                    className="md-sl-text"
                    onClick={() => this.activateList()}
                >
                    {typeof (this.state.selected) === 'string' ? this.state.selected : this.state.selected.text}
                </div>
            ) : (
                <div
                    onKeyPress={InputUtilities.higherOrderPress(32, this.activateList, this)}
                    tabIndex={0}
                    role="button"
                    data-testid={`launch-menu-${this.props.name}`}
                    aria-label="launch-menu"
                    className="md-sl-text inactive"
                    onClick={() => this.activateList()}
                >
                    &nbsp;
                </div>
            );

        return (
            <div ref={this.wrapperRef} className="select">
                <label htmlFor={this.props.name} className={this.state.selected ? 'moved' : 'neutral'}>
                    {this.props.placeholder}

                    {/* Warning: This input will raise a warning with React because it is a hidden but controlled
                    input which are not recommended for use. */}

                    <input
                        type="hidden"
                        id={this.props.name}
                        name={this.props.name}
                        className="md-sl-inp"
                        value={selectedKey}
                    />
                </label>
                {text}
                <FontAwesomeIcon icon={faCaretDown} />

                {/* A transition is included for the opening and closing of the menu. This is handled through the SCSS
                file for the properties but the menu is controlled from here. */}

                <Transition
                    in={this.state.active}
                    timeout={300}
                    nodeRef={this.ulRef}
                    onEnter={() => this.showMenuIfCurrent(true)}
                    onExited={() => this.showMenuIfCurrent(false)}
                >
                    {(state) => (
                        <ul
                            ref={this.ulRef}
                            role="listbox"
                            key="loo"
                            className={`md-sl-ul ${state}`}
                        >
                            {list}
                        </ul>
                    )}
                </Transition>
            </div>
        );
    }

}
