import React from 'react';
import {
    faCheckSquare,
    faDownload,
    faLock,
    faLockOpen,
    faQuestion, faSquare, faTimesCircle,
    IconDefinition,
    IconName
} from '@fortawesome/free-solid-svg-icons';
import { Link, Redirect, RouteComponentProps, withRouter } from 'react-router-dom';
import ReactTimeAgo from 'react-time-ago';
import Loader from 'react-loader-spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import { Theme } from '../../../theme/Theme';
import { Button } from '../../../components/atoms/button/Button';
import { IconBox } from '../../../components/atoms/icon-box/IconBox';
import { GenericList, genericRender } from '../../../components/components/generic-list/GenericList';
import './ViewFile.scss';
import { EditableProperty } from '../../../components/components/editable-property/EditableProperty';
import { API, EventResponse, FileResponse } from '../../../utilities/APIGen';
import { UIUtilities } from '../../../utilities/UIUtilities';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { ColorUtilities } from '../../../utilities/ColorUtilities';
import { TextField } from "../../../components/atoms/text-field/TextField";

export type ViewFilePropsType = {} & RouteComponentProps<{
    id: string,
}>;

export type ViewFileStateType = {
    file?: FileResponse,
    events?: EventResponse[],
    attached?: EventResponse[],
    redirect?: string,
    search?: string,
};

class ViewFileClass extends React.Component<ViewFilePropsType, ViewFileStateType> {

    static displayName = 'ViewFile';

    private loaderType = UIUtilities.randomLoaderType();

    constructor(props: Readonly<ViewFilePropsType>) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        API.events.get().then(
            (data) => failEarlyStateSet(this.state, this.setState.bind(this), 'events')(data.result),
        ).catch(console.error);

        API.files.id.events.get(this.props.match.params.id).then(
            (data) => failEarlyStateSet(this.state, this.setState.bind(this), 'attached')(data.result),
        ).catch(console.error);

        API.files.id.get(this.props.match.params.id).then(
            (data) => failEarlyStateSet(this.state, this.setState.bind(this), 'file')(data.result),
        ).catch(console.error);
    }

    private renderEvent = (iconType: 'delete' | 'add') => (event: EventResponse) => (
        <div className="event-entry">
            {
                iconType === 'add'
                    ? (
                        <div className="check with-box" />
                    )
                    : (
                        <FontAwesomeIcon icon={faTimesCircle} className="check" />
                    )
            }
            <div className="body">
                <Link to={`/events/${event.id}`}>
                    <div className="name">{event.name}</div>
                    <div className="id">{event.id}</div>
                    <div className="columns">
                        <div className="left">
                            <div className="property collapsed">
                                <div className="label">Attendance</div>
                                <div className="value">{event.attendance}</div>
                            </div>
                            <div className="property collapsed">
                                <div className="label">Start</div>
                                <div className="value">
                                    <ReactTimeAgo date={event.startDate * 1000} />
                                </div>
                            </div>
                            <div className="property collapsed">
                                <div className="label">Duration</div>
                                <div className="value">
                                    {moment.duration(
                                        moment.unix(event.startDate).diff(moment.unix(event.endDate)),
                                    ).humanize()}
                                </div>
                            </div>
                            <div className="property collapsed">
                                <div className="label">Venue</div>
                                {
                                    !event.venue
                                        ? undefined
                                        : (
                                            <div
                                                className="value advanced"
                                                style={{
                                                    backgroundColor: event.venue.color,
                                                    color: event.venue.color
                                                        ? ColorUtilities.determineForegroundColor(event.venue.color)
                                                        : 'black',
                                                }}
                                            >
                                                <div className="name">
                                                    {event.venue.name}
                                                </div>
                                            </div>
                                        )
                                }

                            </div>
                        </div>
                        <div className="right">
                            <div className="property collapsed">
                                <div className="label">Ents</div>
                                <div
                                    className="value advanced"
                                    style={{
                                        backgroundColor: event.ents.color,
                                        color: ColorUtilities.determineForegroundColor(event.ents.color),
                                    }}
                                >
                                    <div className="icon">
                                        <FontAwesomeIcon icon={(event.ents.icon ?? faQuestion) as IconName} />
                                    </div>
                                    <div className="name">
                                        {event.ents.name}
                                    </div>
                                </div>
                            </div>
                            <div className="property collapsed">
                                <div className="label">End</div>
                                <div className="value">
                                    <ReactTimeAgo date={event.endDate * 1000} />
                                </div>
                            </div>
                            <div className="property collapsed">
                                <div className="label">Building</div>
                                <div
                                    className="value advanced"
                                    style={{
                                        backgroundColor: event.state.color,
                                        color: event.state.color
                                            ? ColorUtilities.determineForegroundColor(event.state.color)
                                            : 'black',
                                    }}
                                >
                                    <div className="icon">
                                        <FontAwesomeIcon icon={(event.state.icon ?? faQuestion) as IconName} />
                                    </div>
                                    <div className="name">
                                        {event.state.name}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )

    private generateEventList = () => {
        if (this.state.events === undefined) {
            return (
                <Loader
                    color={Theme.TEAL}
                    type={this.loaderType}
                />
            );
        }

        const attachedEvents = this.state.attached ? this.state.attached.map((e) => e.id) : [];
        let events: EventResponse[] = this.state.events.filter((e) => !attachedEvents.includes(e.id));

        if (this.state.search && this.state.search.trim() !== '') {
            events = UIUtilities.defaultSearch(this.state.search, events, (value) => ([
                value.name,
                value.venue?.name,
                value.ents.name,
                value.state.name,
            ]));
        }

        return (
            <GenericList
                records={events.map((event) => ({
                    identifier: event.id,
                    value: event,
                }))}
                onClick={(entry: EventResponse) => {
                    API.events.id.files.post(entry.id, {
                        fileID: this.props.match.params.id,
                    }).then(() => {
                        this.setState((old) => ({
                            ...old,
                            attached: (old.attached ?? []).concat([entry]),
                            events: (old.events ?? []).filter((e) => e.id !== entry.id),
                        }));
                    }).catch(console.error);
                    // TODO
                }}
                dontPad
                render={this.renderEvent('add')}
            />
        );
    }

    private generateAttachList = () => {
        if (this.state.attached === undefined) {
            return (
                <Loader
                    color={Theme.TEAL}
                    type={this.loaderType}
                />
            );
        }

        let events: EventResponse[] = this.state.attached;

        if (this.state.search && this.state.search.trim() !== '') {
            events = UIUtilities.defaultSearch(this.state.search, events, (value) => ([
                value.name,
                value.venue?.name,
                value.ents.name,
                value.state.name,
            ]));
        }

        return (
            <GenericList
                records={events.map((event) => ({
                    identifier: event.id,
                    value: event,
                }))}
                onClick={(entry: EventResponse) => {
                    API.events.id.files.id.delete(entry.id, this.props.match.params.id).then(() => {
                        this.setState((old) => ({
                            ...old,
                            attached: (old.attached ?? []).filter((e) => e.id !== entry.id),
                            events: (old.events ?? []).concat([entry]),
                        }));
                    }).catch(console.error);
                    // TODO
                }}
                dontPad
                render={this.renderEvent('delete')}
            />
        );
    }

    render() {
        if (this.state.redirect) {
            return (
                <Redirect to={this.state.redirect} />
            );
        }

        const { file } = this.state;

        if (!file) {
            return (
                <div className="view-file loading">
                    <Loader
                        color={Theme.TEAL}
                        type={this.loaderType}
                    />
                </div>
            );
        }

        return (
            <div className="view-file">
                <EditableProperty
                    name="name"
                    config={{
                        type: 'text',
                        value: file.name,
                    }}
                >
                    <h1 className="header">{file.name}</h1>
                </EditableProperty>
                <div className="button-container">
                    <Link to={`/downloads/file/${file.id}`}>
                        <Button
                            color={Theme.DEEP_SKY}
                            text="Download"
                            icon={faDownload}
                            fullWidth
                        />
                    </Link>
                </div>
                <div className="columns">
                    <div className="left">
                        <div className="property">
                            <div className="label">Size</div>
                            <div className="value">{UIUtilities.sizeToHuman(file.size)}</div>
                        </div>
                        <div className="property">
                            <div className="label">Uploaded by</div>
                            <div className="value">
                                <Link to="/">
                                    {file.author.name}
                                    &nbsp;(@
                                    {file.author.username}
                                    )
                                </Link>
                            </div>
                        </div>
                        <div className="property">
                            <div className="label">Uploaded</div>
                            <div className="value">
                                <ReactTimeAgo date={file.created * 1000} />
                            </div>
                        </div>
                        <div className="property">
                            <div className="label">Original File Name</div>
                            <div className="value">
                                <code>{file.filename}</code>
                            </div>
                        </div>
                        <div className="property">
                            <div className="label">Private</div>
                            <div className="value">
                                <IconBox
                                    icon={file.private ? faLock : faLockOpen}
                                    color={Theme.CYAN}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="right">
                        <TextField
                            onChange={failEarlyStateSet(this.state, this.setState.bind(this), 'search')}
                            name="Search"
                        />
                        <h2>Attached Events</h2>
                        {this.generateAttachList()}
                        <h2>Add Attachments</h2>
                        {this.generateEventList()}
                    </div>
                </div>
            </div>
        );
    }

}

export const ViewFile = withRouter(ViewFileClass);
