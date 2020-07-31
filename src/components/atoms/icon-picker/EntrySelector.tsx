import React, { CSSProperties, RefObject } from 'react';
import './EntrySelector.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icon from '@fortawesome/free-solid-svg-icons';
import { TextField } from '../text-field/TextField';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { Theme } from '../../../theme/Theme';
import InputUtilities from '../../../utilities/InputUtilities';

export type OptionType = {
    name: string,
    identifier: string,
    additionalSearch?: string,
}

export type EntrySelectorPropsType = {
    options: OptionType[],
    render: (identifier: string) => React.ReactNode,
    searchable?: boolean,
    displayType?: 'rows' | 'boxes',
    onSelect?: (option: OptionType) => void,
    value?: OptionType,
};

export type EntrySelectorStateType = {
    searchValue: string,
    active: boolean,
    selected?: OptionType,
};

export class EntrySelector extends React.Component<EntrySelectorPropsType, EntrySelectorStateType> {

    static displayName = 'EntrySelector';

    private ref: RefObject<HTMLDivElement>;

    constructor(props: Readonly<EntrySelectorPropsType>) {
        super(props);
        this.state = {
            searchValue: '',
            active: false,
        };

        this.ref = React.createRef<HTMLDivElement>();
    }

    componentDidMount() {
        if (this.ref.current) {
            this.ref.current.addEventListener('mouseenter', this.enter);
            this.ref.current.addEventListener('mouseleave', this.exit);
        }
    }

    componentWillUnmount() {
        if (this.ref.current) {
            this.ref.current.removeEventListener('mouseenter', this.enter);
            this.ref.current.removeEventListener('mouseleave', this.exit);
        }
    }

    private enter = () => {
        failEarlyStateSet(this.state, this.setState.bind(this), 'active')(true);
    }

    private exit = () => {
        failEarlyStateSet(this.state, this.setState.bind(this), 'active')(false);
        if (this.ref.current) {
            this.ref.current.scrollTo({
                behavior: 'smooth',
                left: 0,
                top: 0,
            });
        }
    }

    private notify = (option: OptionType) => {
        if (this.props.onSelect) this.props.onSelect(option);
        failEarlyStateSet(this.state, this.setState.bind(this), 'selected')(option);
    }

    private search = (input: string): OptionType[] => {
        const tokens = input.split(' ');
        const mapping: [number, OptionType][] = [];

        for (const option of this.props.options) {
            let score = 0;

            for (const token of tokens) {
                if (option.name.includes(token)) score += 1;

                if (option.identifier.includes(token)) score += 1;

                if (option.additionalSearch && option.additionalSearch.includes(token)) score += 1;

            }

            mapping.push([score, option]);
        }

        const average = mapping.map(([score]) => score).reduce((prev, curr) => prev + curr) / mapping.length;
        const limit = average / 2;

        return mapping
            .filter(([score]) => score > limit)
            .sort(([aScore], [bScore]) => aScore - bScore)
            .map((a) => a[1]);
    };

    private renderEntry = (option: OptionType, spaceOnSelected?: boolean) => {
        const styleOverrides: CSSProperties | undefined = this.state.selected?.identifier
        === option.identifier
            ? { background: Theme.NOTICE, color: 'white', ...(spaceOnSelected ? { marginRight: '20px' } : {}) }
            : undefined;
        return (
            <div
                className={this.props.displayType === 'rows' ? 'row' : 'box'}
                onClick={() => this.notify(option)}
                key={option.identifier}
                style={styleOverrides}
                onKeyPress={(e) => InputUtilities.bindKeyPress(e, 32, () => this.notify(option), this, option)}
                role="option"
                tabIndex={0}
                aria-label={option.name}
                aria-selected={this.state.selected?.identifier === option.identifier}
            >
                {
                    this.props.render(option.identifier)
                }
                {
                    this.props.displayType === 'rows' ? option.name : undefined
                }
            </div>
        );
    }

    render() {
        const options = this.state.searchValue.length > 0 ? this.search(this.state.searchValue) : this.props.options;

        return (
            <div className={`entry-selector${this.state.active ? ' active' : ''}`} ref={this.ref}>
                <TextField
                    onChange={failEarlyStateSet(this.state, this.setState.bind(this), 'searchValue')}
                    name="Search"
                />
                {
                    this.state.selected
                        ? this.renderEntry(this.state.selected, true)
                        : undefined
                }
                {
                    options.map((option) => this.renderEntry(option))
                }
            </div>
        );
    }

}

export class IconSelector extends React.Component<Omit<EntrySelectorPropsType, 'options' | 'render'>, {}> {

    private readonly options: OptionType[] = [];

    constructor(props: Readonly<Omit<EntrySelectorPropsType, 'options' | 'render'>>) {
        super(props);

        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

        const icons = Object.keys(Icon).filter(
            (name) => !(name.toLowerCase() === 'prefix'
                || name.toLowerCase() === 'fastopwatch20'
                || name.toLowerCase() === 'fas'),
        ).filter((entry) => entry in Icon);

        for (const icon of icons) {
            let identifierOutput = '';
            const rawName = String(icon);

            for (let i = 2; i < rawName.length; i++) {
                // it is upper case
                if (upper.includes(rawName.charAt(i))) {
                    if (i === 2) {
                        identifierOutput += rawName.charAt(i).toLowerCase();
                    } else {
                        identifierOutput += `-${rawName.charAt(i).toLowerCase()}`;
                    }
                } else {
                    identifierOutput += rawName.charAt(i);
                }
            }

            this.options.push({
                name: rawName,
                identifier: identifierOutput,
            });
        }
    }

    private renderIcon = (identifier: string) => (
        <FontAwesomeIcon icon={['fas', identifier] as unknown as Icon.IconDefinition} />
    )

    render() {
        return (
            <EntrySelector
                options={this.options}
                render={this.renderIcon}
                onSelect={this.props.onSelect}
                value={this.props.value}
                displayType={this.props.displayType}
                searchable={this.props.searchable}
            />
        );
    }
}
