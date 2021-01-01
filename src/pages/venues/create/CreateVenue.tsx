import React from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { TwitterPicker } from 'react-color';
import { faNetworkWired, faSkullCrossbones } from '@fortawesome/free-solid-svg-icons';
import { TextField } from '../../../components/atoms/text-field/TextField';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { Button } from '../../../components/atoms/button/Button';
import { Theme } from '../../../theme/Theme';
import { withNotificationContext } from '../../../components/WithNotificationContext';
import { UIUtilities } from '../../../utilities/UIUtilities';
import { NotificationContextType } from '../../../context/NotificationContext';
import { API } from '../../../utilities/APIGen';

export type CreateVenuePropsType = {
    isPage?: boolean,
    notificationContext?: NotificationContextType,
}

export type CreateVenueStateType = {
    venue: {
        name?: string,
        capacity?: number,
        color?: string,
    },
    ui: {
        redirect?: string,
    }
}

class CreateVenueClass extends React.Component<CreateVenuePropsType, CreateVenueStateType> {

    static displayName = 'Create Venue';

    constructor(props: Readonly<CreateVenuePropsType>) {
        super(props);
        this.state = {
            venue: {
                color: '#000000',
            },
            ui: {},
        };
    }

    private save = () => {
        if (this.state.venue.capacity === undefined) {
            UIUtilities.tryShowNotification(
                this.props.notificationContext,
                'Invalid details',
                'Venues must have a capacity',
                faSkullCrossbones,
                Theme.FAILURE,
            );
            return;
        }

        if (this.state.venue.name === undefined) {
            UIUtilities.tryShowNotification(
                this.props.notificationContext,
                'Invalid details',
                'Venues must have a name',
                faSkullCrossbones,
                Theme.FAILURE,
            );
            return;
        }

        API.venues.post({
            color: this.state.venue.color,
            capacity: this.state.venue.capacity,
            name: this.state.venue.name,
        }).then((id) => {
            console.log(id);
            if (id.result.length !== 1 || typeof (id.result[0]) !== 'string') {
                UIUtilities.tryShowNotification(
                    this.props.notificationContext,
                    'Failed to save',
                    `Received an error response: ID was not returned`,
                    faNetworkWired,
                    Theme.FAILURE,
                );
            }

            console.log(id);

            failEarlyStateSet(this.state, this.setState.bind(this), 'ui', 'redirect')(`/venues/${id.result[0]}`);
        }).catch((err) => {
            console.error(err);
            UIUtilities.tryShowNotification(
                this.props.notificationContext,
                'Failed to save',
                `Received an error response: ${err.message ?? 'unknown'}`,
                faNetworkWired,
                Theme.FAILURE,
            );
        });
    }

    render() {
        return (
            <div className={`create-event ${this.props.isPage ? 'page' : ''}`}>
                {
                    this.state.ui.redirect ? <Redirect to={this.state.ui.redirect} /> : undefined
                }
                <div className="title">Create Venue</div>
                <TextField
                    name="Venue Name"
                    initialContent={this.state.venue.name}
                    onChange={failEarlyStateSet(this.state, this.setState.bind(this), 'venue', 'name')}
                    required
                />
                <TextField
                    name="Capacity"
                    type="number"
                    initialContent={this.state.venue.capacity}
                    onChange={failEarlyStateSet(this.state, this.setState.bind(this), 'venue', 'capacity')}
                    required
                />
                {
                    [10, 50, 100, 500, 1000].map(
                        (e) => (
                            <Button
                                color={this.state.venue.color}
                                text={String(e)}
                                onClick={() => failEarlyStateSet(
                                    this.state,
                                    this.setState.bind(this),
                                    'venue', 'capacity',
                                )(e)}
                            />
                        ),
                    )
                }
                <TextField
                    style={{
                        borderBottom: `5px solid ${this.state.venue.color}`,
                    }}
                    onChange={failEarlyStateSet(this.state, this.setState.bind(this), 'venue', 'color')}
                    name="Color"
                    initialContent={this.state.venue.color}
                />

                <TwitterPicker
                    color={this.state.venue.color}
                    onChange={(e) => failEarlyStateSet(this.state, this.setState.bind(this), 'venue', 'color')(e.hex)}
                />

                <Button
                    color={Theme.SUCCESS}
                    text="Submit"
                    fullWidth={this.props.isPage}
                    onClick={this.save}
                />
                {
                    this.props.isPage ? undefined
                        : (
                            <Button color={Theme.FAILURE} text="Cancel" />
                        )
                }
            </div>
        );
    }

}

// @ts-ignore
export const CreateVenue = withRouter(withNotificationContext(CreateVenueClass));
