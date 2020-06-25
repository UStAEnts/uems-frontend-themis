import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { Transition } from 'react-transition-group';

import './Select.scss';
import { MutableRefObject } from 'react';
import InputUtilities from '../../../utilities/InputUtilities';

type KeyValueOption = { key: string, value: string };

export type SelectPropsType = {
    placeholder: string,
    name: string,
    options: string[] | KeyValueOption[],
};

export type SelectStateType = {
    selected: string | KeyValueOption | undefined,
    active: boolean,
};

export class Select extends React.Component<SelectPropsType, SelectStateType> {

    static displayName = 'Select';

    private wrapperRef: MutableRefObject<any>;

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

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    private handleClickOutside(event: MouseEvent) {
        if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
            this.deactivateList();
        }
    }

    private handleKeyPress(e: React.KeyboardEvent, option: string | KeyValueOption) {
        if (e.key === ' ') this.handleEntryClick(option);
    }

    private handleEntryClick(option: string | KeyValueOption) {
        this.setState((oldState) => ({
            ...oldState,
            selected: option,
            active: false,
        }));
    }

    private activateList() {
        this.setState((oldState) => ({
            ...oldState,
            active: true,
        }));
    }

    private deactivateList() {
        this.setState((oldState) => ({
            ...oldState,
            active: false,
        }));
    }

    private refTest(incoming: boolean) {
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
                    onEnter={() => this.refTest(true)}
                    onExited={() => this.refTest(false)}
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
