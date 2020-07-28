import React from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { TwitterPicker } from 'react-color';
import { faNetworkWired, faSkullCrossbones } from '@fortawesome/free-solid-svg-icons';
import { NotificationContextType } from '../../../context/NotificationContext';
import { API, StateCreation } from '../../../utilities/APIGen';
import { TextField } from '../../../components/atoms/text-field/TextField';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { Button } from '../../../components/atoms/button/Button';
import { Theme } from '../../../theme/Theme';
import { UIUtilities } from '../../../utilities/UIUtilities';
import { withNotificationContext } from '../../../components/WithNotificationContext';

export type CreateStatePropsType = {
    isPage?: boolean,
    notificationContext?: NotificationContextType,
};

export type CreateStateStateType = {
    state: {
        name?: string,
        color?: string,
    },
    ui: {
        redirect?: string,
    },
};

class CreateStateClass extends React.Component<CreateStatePropsType, CreateStateStateType> {

    static displayName = 'CreateState';

    constructor(props: Readonly<CreateStatePropsType>) {
        super(props);

        this.state = {
            state: {
                color: '#000000',
            },
            ui: {},
        };
    }

    private save = () => {
        for (const key of ['name', 'color'] as (keyof CreateStateStateType['state'])[]) {
            if (this.state.state[key] === undefined) {
                UIUtilities.tryShowNotification(
                    this.props.notificationContext,
                    'Invalid details',
                    `You must provide a ${key} value`,
                    faSkullCrossbones,
                    Theme.FAILURE,
                );
                return;
            }
        }

        API.states.post({
            color: this.state.state.color,
            name: this.state.state.name as string, // This is verified in the for loop above but the typing doesnt work
        }).then((id) => {
            failEarlyStateSet(this.state, this.setState.bind(this), 'ui', 'redirect')(`/states/${id.result.id}`);
        }).catch((err) => {
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
                <div className="title">Create State</div>
                <TextField
                    name="State Name"
                    initialContent={this.state.state.name}
                    onChange={failEarlyStateSet(this.state, this.setState.bind(this), 'state', 'name')}
                    required
                />

                <TextField
                    style={{
                        borderBottom: `5px solid ${this.state.state.color}`,
                    }}
                    onChange={failEarlyStateSet(this.state, this.setState.bind(this), 'state', 'color')}
                    name="Color"
                    initialContent={this.state.state.color}
                />

                <TwitterPicker
                    color={this.state.state.color}
                    onChange={(e) => failEarlyStateSet(this.state, this.setState.bind(this), 'state', 'color')(e.hex)}
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

export const CreateState = withRouter(withNotificationContext(CreateStateClass));
