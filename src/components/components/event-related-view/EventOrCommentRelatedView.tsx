import React from 'react';
import moment from 'moment';
import Loader from 'react-loader-spinner';
import { faBolt, faChartLine, faPalette, faTag, faTicketAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Redirect, withRouter } from 'react-router-dom';
import { CommentResponse, EventResponse } from '../../../utilities/APIGen';
import { Theme } from '../../../theme/Theme';
import { EventTable } from '../event-table/EventTable';
import { EditableProperty } from '../editable-property/EditableProperty';
import { IconBox } from '../../atoms/icon-box/IconBox';
import { ValueSquare } from '../../atoms/value-square/ValueSquare';
import { OptionType } from '../../atoms/icon-picker/EntrySelector';
import { CommentList } from '../comment-list/CommentList';
import { Button } from '../../atoms/button/Button';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import './EventOrCommentRelatedView.scss';

export type Override<T> = {
    property: Extract<keyof T, string>,
    type: 'color' | 'icon' | 'text' | 'number' | 'textarea',
}

export type EventRelatedViewPropsType<T, C> = {
    obj: T,
    configOverrides?: Override<T>[],
    events?: EventResponse[],
    comments?: CommentResponse[],
    patch: (changes: C) => void,
    nameKey?: Extract<keyof T, string>,
    excluded?: Extract<keyof T, string>[],
    delete?: {
        redirect: string,
        onDelete: () => boolean | Promise<boolean>,
    }
};

export type EventRelatedViewStateType = {
    isDeleting?: boolean,
    redirect?: string,
};

class EventOrCommentRelatedViewClass<T, C> extends React.Component<EventRelatedViewPropsType<T, C>,
    EventRelatedViewStateType> {

    static displayName = 'EventOrCommentRelatedView';

    private static round = (value: number) => Math.round((value + Number.EPSILON) * 10) / 10

    private static mostFrequent = (array: (number | string)[]) => {
        if (array.length === 0) {
            return null;
        }

        const modeMap: { [key: string]: number } = {};
        let maxEl = array[0];
        let maxCount = 1;

        for (let i = 0; i < array.length; i++) {
            const el = array[i];
            if (modeMap[el] === undefined) {
                modeMap[el] = 1;
            } else {
                modeMap[el] += 1;
            }

            if (modeMap[el] > maxCount) {
                maxEl = el;
                maxCount = modeMap[el];
            }
        }

        return maxEl;
    }

    constructor(props: Readonly<EventRelatedViewPropsType<T, C>>) {
        super(props);

        if (props.events && props.comments) {
            console.warn('Only showing events');
        }

        this.state = {};
    }

    private getFrequency = (events: EventResponse[]) => {
        let total = 0;
        let entries = 0;

        for (let i = 0; i < events.length - 1; i++) {
            const event = events[i];
            const next = events[i + 1];

            total += moment.unix(event.startDate).diff(moment.unix(next.startDate));
            entries += 1;
        }

        const avgMillis = total / entries;
        const duration = moment.duration(avgMillis);

        if (duration.asYears() >= 1) {
            return `${EventOrCommentRelatedViewClass.round(duration.asYears())} yrs`;
        }

        if (duration.asMonths() >= 1) {
            return `${EventOrCommentRelatedViewClass.round(duration.asMonths())} mos`;
        }

        if (duration.asWeeks() >= 1) {
            return `${EventOrCommentRelatedViewClass.round(duration.asWeeks())} wks`;
        }

        if (duration.asDays() >= 1) {
            return `${EventOrCommentRelatedViewClass.round(duration.asDays())} days`;
        }

        if (duration.asHours() >= 1) {
            return `${EventOrCommentRelatedViewClass.round(duration.asHours())} hrs`;
        }

        if (duration.asMinutes() >= 1) {
            return `${EventOrCommentRelatedViewClass.round(duration.asMinutes())} mins`;
        }

        return 'unknown';
    }

    private generateColorEdit = (property: keyof T) => (
        <div className="property-edit">
            <div className="title">{property}</div>
            <EditableProperty
                name="color"
                config={{
                    type: 'color',
                    onChange: (value: string) => {
                        // @ts-ignore - not sure how to do this safely (TODO?)
                        const changes: C = {};
                        // @ts-ignore - not sure how to do this safely (TODO?)
                        changes[property] = value;
                        this.props.patch(changes);
                    },
                    // @ts-ignore
                    value: this.props.obj[property] ?? '#000000',
                }}
            >
                <IconBox
                    icon={faPalette}
                    /* @ts-ignore */
                    color={this.props.obj[property] ?? '#000000'}
                />
            </EditableProperty>
        </div>
    )

    private generateIconEdit = (property: Extract<keyof T, string>) => (
        <div className="property-edit">
            <div className="title">{property}</div>
            <EditableProperty
                name={property}
                config={{
                    type: 'icon',
                    onChange: (value: OptionType) => {
                        // @ts-ignore - not sure how to do this safely (TODO?)
                        const changes: C = {};
                        // @ts-ignore - not sure how to do this safely (TODO?)
                        changes[property] = value.identifier;
                        this.props.patch(changes);
                    },
                    // @ts-ignore
                    value: this.props.obj[property],
                }}
            >
                <IconBox
                    /* @ts-ignore */
                    icon={this.props.obj[property]}
                    color={Theme.NOTICE}
                />
            </EditableProperty>
        </div>
    )

    private generateText = (property: Extract<keyof T, string>, type: 'textarea' | 'number' | 'text' = 'text') => (
        <div className="property-edit">
            <div className="title">{property}</div>
            <EditableProperty
                name={property}
                config={{
                    fieldType: type,
                    value: this.props.obj[property],
                    type: 'text',
                    onChange: (value: string | number) => {
                        // @ts-ignore - not sure how to do this safely (TODO?)
                        const changes: C = {};
                        // @ts-ignore - not sure how to do this safely (TODO?)
                        changes[property] = value;
                        this.props.patch(changes);
                    },
                }}
            >
                {this.props.obj[property]}
            </EditableProperty>
        </div>
    )

    private renderCommentRightPane = () => (
        <div className="right-props">
            {
                !this.props.comments
                    ? undefined
                    : (
                        <CommentList
                            comments={this.props.comments}
                            topics={[]}
                            withoutBox
                        />
                    )
            }
        </div>
    )

    private renderEventRightPane = () => {
        let table;

        if (this.props.events) {
            table = (
                <EventTable
                    events={this.props.events}
                />
            );
        } else {
            table = (
                <Loader
                    type="BallTriangle"
                    color={Theme.NOTICE}
                />
            );
        }
        return this.props.events === undefined ? undefined : (
            <div className="right-props">
                <div className="boxes">
                    <ValueSquare
                        value={this.props.events.length}
                        icon={faTicketAlt}
                        name="Events"
                        color={Theme.PINK_LIGHT}
                        style={{ backgroundColor: Theme.PINK }}
                    />
                    <ValueSquare
                        value={this.getFrequency(this.props.events)}
                        icon={faChartLine}
                        name="Event Frequency"
                        color={Theme.PINK_LIGHT}
                        style={{ backgroundColor: Theme.PINK }}
                    />
                    <ValueSquare
                        className="smaller-square"
                        value={
                            EventOrCommentRelatedViewClass.mostFrequent(
                                this.props.events
                                    .map((e) => e.ents?.name)
                                    .filter((e) => e !== undefined),
                            ) as string
                        }
                        icon={faBolt}
                        name="MF Ents"
                        color={Theme.PINK_LIGHT}
                        style={{ backgroundColor: Theme.PINK }}
                    />
                    <ValueSquare
                        className="smaller-square"
                        value={
                            EventOrCommentRelatedViewClass.mostFrequent(
                                this.props.events
                                    .map((e) => e.state?.name)
                                    .filter((e) => e !== undefined),
                            ) as string
                        }
                        icon={faTag}
                        name="MF State"
                        color={Theme.PINK_LIGHT}
                        style={{ backgroundColor: Theme.PINK }}
                    />
                </div>
                {table}
            </div>
        );
    }

    private delete = () => {
        if (!this.props.delete) return;

        Promise.resolve(this.props.delete.onDelete()).then(() => {
            failEarlyStateSet(
                this.state,
                this.setState.bind(this),
                'redirect',
            )(this.props.delete?.redirect ?? '/');
        }).catch((err) => {
            console.error('Handle errors', err);
        });
    };

    render() {
        // Force redirect if the state is set
        if (this.state.redirect) {
            return (
                <Redirect to={this.state.redirect} />
            );
        }

        const properties = [];

        for (const key of Object.keys(this.props.obj) as (Extract<keyof T, string>)[]) {
            console.log(key, this.props.nameKey ?? 'name');
            if (this.props.excluded && this.props.excluded.includes(key)) continue;
            if (String(key) === String(this.props.nameKey ?? 'name')) continue;

            let type = String(typeof (this.props.obj[key as keyof T]));

            if (key === 'color') type = 'color';
            if (key === 'icon') type = 'icon';

            const override = this.props.configOverrides?.find((e) => e.property === key);
            if (override) type = override.type;

            if (type === 'string') properties.push(this.generateText(key));
            if (type === 'number') properties.push(this.generateText(key, 'number'));
            if (type === 'icon') properties.push(this.generateIconEdit(key));
            if (type === 'color') properties.push(this.generateColorEdit(key));
            if (type === 'textarea') properties.push(this.generateText(key, 'textarea'));
        }

        return (
            <div className={`view-venue ${this.props.events ? 'events' : 'comments'}`}>
                <EditableProperty
                    name="name"
                    config={{
                        type: 'text',
                        // @ts-ignore
                        value: this.props.obj[this.props.nameKey ?? 'name'],
                        fieldType: 'text',
                        onChange: (title) => {
                            // @ts-ignore
                            const changes: C = {};
                            // @ts-ignore
                            changes[this.props.nameKey ?? 'name'] = title;
                            this.props.patch(changes);
                        },
                    }}
                >
                    <h1 style={{ display: 'inline-block' }}>
                        {
                            // @ts-ignore
                            this.props.obj[this.props.nameKey ?? 'name']
                        }
                    </h1>
                </EditableProperty>
                <div className="body">
                    <div className="left-props">
                        {properties}
                        {
                            this.props.delete
                                ? (
                                    <div className="delete">
                                        {
                                            this.state.isDeleting
                                                ? (
                                                    <div>
                                                        <div>Are you sure you want to delete?</div>
                                                        <div>
                                                            <Button
                                                                color={Theme.FAILURE}
                                                                text="Confirm"
                                                                onClick={this.delete}
                                                            />
                                                            <Button
                                                                color={Theme.GRAY_DARK}
                                                                text="Cancel"
                                                                onClick={() => failEarlyStateSet(
                                                                    this.state,
                                                                    this.setState.bind(this),
                                                                    'isDeleting',
                                                                )(false)}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                                : (
                                                    <Button
                                                        color={Theme.FAILURE}
                                                        text="Delete"
                                                        fullWidth
                                                        icon={faTrash}
                                                        onClick={() => failEarlyStateSet(
                                                            this.state,
                                                            this.setState.bind(this),
                                                            'isDeleting',
                                                        )(true)}
                                                    />
                                                )
                                        }
                                    </div>
                                )
                                : undefined
                        }
                    </div>
                    {
                        this.props.events
                            ? this.renderEventRightPane()
                            : this.renderCommentRightPane()
                    }

                </div>
            </div>
        );
    }

}

// @ts-ignore
export const EventOrCommentRelatedView: React.ComponentClass<EventRelatedViewPropsType<any, any>,
    // @ts-ignore
    EventRelatedViewStateType> = withRouter(EventOrCommentRelatedViewClass);
