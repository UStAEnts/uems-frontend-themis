import React from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { TwitterPicker } from 'react-color';
import { faNetworkWired, faQuestionCircle, faSkullCrossbones, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { NotificationContextType } from '../../../context/NotificationContext';
import { API } from '../../../utilities/APIGen';
import { TextField } from '../../../components/atoms/text-field/TextField';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { Button } from '../../../components/atoms/button/Button';
import { Theme } from '../../../theme/Theme';
import { UIUtilities } from '../../../utilities/UIUtilities';
import { withNotificationContext } from '../../../components/WithNotificationContext';
import { OptionType } from '../../../components/atoms/icon-picker/EntrySelector';
import { IconBox } from '../../../components/atoms/icon-box/IconBox';
import { IconSelector } from '../../../components/atoms/icon-picker/IconPicker';

export type CreateEntsPropsType = {
    isPage?: boolean,
    notificationContext?: NotificationContextType,
};

export type CreateEntsStateType = {
    ents: {
        name?: string,
        color?: string,
        icon?: OptionType,
    },
    ui: {
        redirect?: string,
    },
};

class CreateEntsClass extends React.Component<CreateEntsPropsType, CreateEntsStateType> {

    static displayName = 'CreateEnts';

    constructor(props: Readonly<CreateEntsPropsType>) {
        super(props);

        this.state = {
            ents: {
                color: '#000000',
            },
            ui: {},
        };
    }

    private save = () => {
        for (const key of ['name', 'color', 'icon'] as (keyof CreateEntsStateType['ents'])[]) {
            if (this.state.ents[key] === undefined) {
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

        API.ents.post({
            icon: (this.state.ents.icon as OptionType).identifier,
            color: this.state.ents.color as string,
            name: this.state.ents.name as string, // This is verified in the for loop above but the typing doesnt work
        }).then((id) => {
            failEarlyStateSet(this.state, this.setState.bind(this), 'ui', 'redirect')(`/ents/${id.result.id}`);
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
                <div className="title">Create Ents</div>
                <TextField
                    name="Ents Name"
                    initialContent={this.state.ents.name}
                    onChange={failEarlyStateSet(this.state, this.setState.bind(this), 'ents', 'name')}
                    required
                />
                <TextField
                    style={{
                        borderBottom: `5px solid ${this.state.ents.color}`,
                    }}
                    onChange={failEarlyStateSet(this.state, this.setState.bind(this), 'ents', 'color')}
                    name="Color"
                    initialContent={this.state.ents.color}
                />

                <TwitterPicker
                    color={this.state.ents.color}
                    onChange={(e) => failEarlyStateSet(this.state, this.setState.bind(this), 'ents', 'color')(e.hex)}
                />

                <div
                    className="icon-title"
                    style={{
                        marginTop: '20px',
                        marginBottom: '10px',
                        fontSize: '0.8em',
                        color: 'gray',
                    }}
                >
                    Icon
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        marginBottom: '20px',
                    }}
                >
                    <IconBox
                        icon={
                            (this.state.ents.icon ? ['fas', this.state.ents.icon.identifier] : faQuestionCircle) as
                                unknown as IconDefinition
                        }
                        style={{
                            marginRight: '10px',
                        }}
                        color={this.state.ents.color}
                    />
                    <IconSelector
                        searchable
                        value={this.state.ents.icon}
                        displayType="boxes"
                        onSelect={failEarlyStateSet(this.state, this.setState.bind(this), 'ents', 'icon')}
                    />
                </div>

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

export const CreateEnts = withRouter(withNotificationContext(CreateEntsClass));
