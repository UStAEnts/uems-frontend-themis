import React from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { TwitterPicker } from 'react-color';
import { faNetworkWired, faSkullCrossbones } from '@fortawesome/free-solid-svg-icons';
import { NotificationContextType } from '../../../context/NotificationContext';
import { API } from '../../../utilities/APIGen';
import { TextField } from '../../../components/atoms/text-field/TextField';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { Button } from '../../../components/atoms/button/Button';
import { Theme } from '../../../theme/Theme';
import { UIUtilities } from '../../../utilities/UIUtilities';
import { withNotificationContext } from '../../../components/WithNotificationContext';

export type CreateTopicPropsType = {
    isPage?: boolean,
    notificationContext?: NotificationContextType,
};

export type CreateTopicStateType = {
    topic: {
        name?: string,
        description?: string,
        color?: string,
    },
    ui: {
        redirect?: string,
    },
};

class CreateTopicClass extends React.Component<CreateTopicPropsType, CreateTopicStateType> {

    static displayName = 'CreateTopic';

    constructor(props: Readonly<CreateTopicPropsType>) {
        super(props);

        this.state = {
            topic: {
                color: '#000000',
            },
            ui: {},
        };
    }

    private save = () => {
        for (const key of ['name', 'description', 'color'] as (keyof CreateTopicStateType['topic'])[]) {
            if (this.state.topic[key] === undefined) {
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

        API.topics.post({
            color: this.state.topic.color,
            description: this.state.topic.description,
            name: this.state.topic.name as string, // This is verified in the for loop above but the typing doesnt work
        }).then((id) => {
            failEarlyStateSet(this.state, this.setState.bind(this), 'ui', 'redirect')(`/topics/${id.result.id}`);
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
                <div className="title">Create Topic</div>
                <TextField
                    name="Topic Name"
                    initialContent={this.state.topic.name}
                    onChange={failEarlyStateSet(this.state, this.setState.bind(this), 'topic', 'name')}
                    required
                />
                <TextField
                    name="Description"
                    type="textarea"
                    initialContent={this.state.topic.description}
                    onChange={failEarlyStateSet(this.state, this.setState.bind(this), 'topic', 'description')}
                    required
                />

                <TextField
                    style={{
                        borderBottom: `5px solid ${this.state.topic.color}`,
                    }}
                    onChange={failEarlyStateSet(this.state, this.setState.bind(this), 'topic', 'color')}
                    name="Color"
                    initialContent={this.state.topic.color}
                />

                <TwitterPicker
                    color={this.state.topic.color}
                    onChange={(e) => failEarlyStateSet(this.state, this.setState.bind(this), 'topic', 'color')(e.hex)}
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

export const CreateTopic = withRouter(withNotificationContext(CreateTopicClass));
