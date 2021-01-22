import React from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { faNetworkWired, faSkullCrossbones } from '@fortawesome/free-solid-svg-icons';
import Axios from 'axios';
import { NotificationContextType } from '../../../context/NotificationContext';
import { API } from '../../../utilities/APIGen';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { Theme } from '../../../theme/Theme';
import { UIUtilities } from '../../../utilities/UIUtilities';
import { TextField } from '../../../components/atoms/text-field/TextField';
import { withNotificationContext } from '../../../components/WithNotificationContext';
import { Button } from '../../../components/atoms/button/Button';
import { FileUpload } from '../../../components/atoms/file-upload/FileUpload';
import { TaskMeter } from '../../../components/components/task-meter/TaskMeter';

export type CreateFilePropsType = {
    isPage?: boolean,
    notificationContext?: NotificationContextType,
};

export type CreateFileStateType = {
    file: {
        name?: string,
        private: boolean,
        file?: File,
        type?: string,
    },
    ui: {
        progress?: number,
        redirect?: string,
    }
};

class CreateFileClass extends React.Component<CreateFilePropsType, CreateFileStateType> {

    static displayName = 'CreateFile';

    constructor(props: Readonly<CreateFilePropsType>) {
        super(props);

        this.state = {
            file: {
                private: false,
            },
            ui: {},
        };
    }

    componentDidMount() {
    }

    private save = () => {
        if (this.state.file.file === undefined) {
            UIUtilities.tryShowNotification(
                this.props.notificationContext,
                'Invalid details',
                `You must provide a file before saving`,
                faSkullCrossbones,
                Theme.FAILURE,
            );
            return;
        }

        for (const key of ['name', 'file', 'type'] as (keyof CreateFileStateType['file'])[]) {
            if (this.state.file[key] === undefined) {
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

        API.files.post({
            name: this.state.file.name as string,
            filename: this.state.file.file.name,
            size: this.state.file.file.size,
            type: this.state.file.type as string,
        }).then((id) => {
            if (id.result.length !== 1 || typeof (id.result[0]) !== 'string') {
                UIUtilities.tryShowNotification(
                    this.props.notificationContext,
                    'Failed to save',
                    `Received an error response: ID was not returned`,
                    faNetworkWired,
                    Theme.FAILURE,
                );
            }

            // Once the metadata is created, we need to upload
            const formData = new FormData();
            formData.append('data', this.state.file.file as File);

            Axios.post(id.uploadURI, formData, {
                onUploadProgress: (progress) => {
                    failEarlyStateSet(this.state, this.setState.bind(this), 'ui', 'progress')(
                        Math.round((progress.loaded * 100) / progress.total),
                    );
                },
            }).then(() => {
                failEarlyStateSet(this.state, this.setState.bind(this), 'ui', 'redirect')(`/file/${id.result[0]}`);
            }).catch((err) => {
                UIUtilities.tryShowNotification(
                    this.props.notificationContext,
                    'Failed to upload file',
                    `Received an error response: ${err.message ?? 'unknown'}. This file may show up as a 
                    phantom in the system for some time until it is automatically cleared. Please contact support if 
                    this problem persists`,
                    faNetworkWired,
                    Theme.FAILURE,
                );
            });

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
                <div className="title">Create File</div>
                <TextField
                    name="File Name"
                    initialContent={this.state.file.name}
                    onChange={failEarlyStateSet(this.state, this.setState.bind(this), 'file', 'name')}
                    required
                />

                <FileUpload onFileSelect={failEarlyStateSet(this.state, this.setState.bind(this), 'file', 'file')} />

                <div className="private">
                    <input
                        type="checkbox"
                        onChange={() => failEarlyStateSet(this.state, this.setState.bind(this), 'file', 'private')(
                            !this.state.file.private,
                        )}
                    />
                    Private
                </div>

                <TextField
                    name="File Type"
                    initialContent={this.state.file.type}
                    onChange={failEarlyStateSet(this.state, this.setState.bind(this), 'file', 'type')}
                    required
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
                {
                    this.state.ui.progress
                        ? (
                            <TaskMeter
                                taskName="Upload"
                                displayType="percentage"
                                total={100}
                                value={this.state.ui.progress}
                                float={false}
                                color={Theme.GREEN_LIGHT}
                            />
                        )
                        : undefined
                }
            </div>
        );
    }
}

export const CreateFile = withRouter(withNotificationContext(CreateFileClass));
