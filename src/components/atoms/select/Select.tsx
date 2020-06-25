import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { Transition } from 'react-transition-group';

import './Select.scss';
import { MutableRefObject } from 'react';
import InputUtilities from '../../../utilities/InputUtilities';

type KeyValueOption = { key: string, value: string };

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
};

export type SelectStateType = {
    /**
     * The currently selected element or undefined if it is currently displaying the placeholder
     */
    selected: string | KeyValueOption | undefined,
    /**
     * If the menu is currently open for this select
     */
    active: boolean,
};

export class Select extends React.Component<SelectPropsType, SelectStateType> {

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
            selected: undefined,
            active: false,
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
            if (typeof (option) === 'string') {
                list.push(
                    <li
                        onKeyPress={(e) => InputUtilities.bindKeyPress(e, 32, this.handleEntryClick, this, option)}
                        onClick={() => this.handleEntryClick(option)}
                        className={`md-sl-li${this.state.selected === option ? ' md-sl-active' : ''}`}
                        value={option}
                        key={option}
                    >
                        {option}
                    </li>,
                );
            } else {
                list.push(
                    <li
                        onKeyPress={(e) => InputUtilities.bindKeyPress(e, 32, this.handleEntryClick, this, option)}
                        key={option.value}
                        className={`md-sl-li${this.state.selected === option ? ' md-sl-active' : ''}`}
                        value={option.value}
                        onClick={() => this.handleEntryClick(option)}
                    >
                        {option.key}
                    </li>,
                );
            }
        }

        let selectedKey;
        if (this.state.selected) {
            if (typeof (this.state.selected) === 'string') selectedKey = this.state.selected;
            else selectedKey = this.state.selected.key;
        }

        const text = this.state.selected
            ? (
                <div
                    onKeyPress={InputUtilities.higherOrderPress(32, this.activateList, this)}
                    tabIndex={0}
                    role="button"
                    className="md-sl-text"
                    onClick={() => this.activateList()}
                >
                    {this.state.selected}
                </div>
            ) : (
                <div
                    onKeyPress={InputUtilities.higherOrderPress(32, this.activateList, this)}
                    tabIndex={0}
                    role="button"
                    className="md-sl-text inactive"
                    onClick={() => this.activateList()}
                >
                    &nbsp;
                </div>
            );

        return (
            <div ref={this.wrapperRef} className="select">
                <label htmlFor={this.props.name} className={this.state.selected ? 'moved' : 'neutral'}>
                    Some Description

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
