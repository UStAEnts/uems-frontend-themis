import React from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { TwitterPicker } from 'react-color';
import {
	faNetworkWired,
	faQuestionCircle,
	faSkullCrossbones,
	IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { NotificationContextType } from '../../../context/NotificationContext';
import { TextField } from '../../../components/atoms/text-field/TextField';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { Button } from '../../../components/atoms/button/Button';
import { Theme } from '../../../theme/Theme';
import { UIUtilities } from '../../../utilities/UIUtilities';
import { withNotificationContext } from '../../../components/WithNotificationContext';
import { IconBox } from '../../../components/atoms/icon-box/IconBox';
import { OptionType } from '../../../components/atoms/icon-picker/EntrySelector';
import { IconSelector } from '../../../components/atoms/icon-picker/IconPicker';
import apiInstance from '../../../utilities/APIPackageGen';

export type CreateTopicPropsType = {
	isPage?: boolean;
	notificationContext?: NotificationContextType;
};

export type CreateTopicStateType = {
	topic: {
		name?: string;
		description?: string;
		color?: string;
		icon?: OptionType;
	};
	ui: {
		redirect?: string;
	};
};

class CreateTopicClass extends React.Component<
	CreateTopicPropsType,
	CreateTopicStateType
> {
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
		for (const key of [
			'name',
			'description',
			'color',
		] as (keyof CreateTopicStateType['topic'])[]) {
			if (this.state.topic[key] === undefined) {
				UIUtilities.tryShowNotification(
					this.props.notificationContext,
					'Invalid details',
					`You must provide a ${key} value`,
					faSkullCrossbones,
					Theme.FAILURE
				);
				return;
			}
		}

		// TODO: sensible defaults?
		UIUtilities.load(
			this.props,
			apiInstance.topics().post({
				color: this.state.topic.color ?? '#000000',
				description:
					this.state.topic.description ?? 'No description provided...',
				icon: this.state.topic.icon?.identifier ?? 'faTag',
				name: this.state.topic.name as string, // This is verified in the for loop above but the typing doesnt work
			}),
			(e) => `Failed to create a new topic! ${e}`
		).data((id) => {
			if (id.length !== 1 || typeof id[0] !== 'string') {
				UIUtilities.tryShowNotification(
					this.props.notificationContext,
					'Failed to save',
					`Received an error response: ID was not returned`,
					faNetworkWired,
					Theme.FAILURE
				);
			}

			failEarlyStateSet(
				this.state,
				this.setState.bind(this),
				'ui',
				'redirect'
			)(`/topics/${id[0]}`);
		});
	};

	render() {
		return (
			<div className={`create-event ${this.props.isPage ? 'page' : ''}`}>
				{this.state.ui.redirect ? (
					<Redirect to={this.state.ui.redirect} />
				) : undefined}
				<div className="title">Create Topic</div>
				<TextField
					name="Topic Name"
					initialContent={this.state.topic.name}
					onChange={failEarlyStateSet(
						this.state,
						this.setState.bind(this),
						'topic',
						'name'
					)}
					required
				/>
				<TextField
					name="Description"
					type="textarea"
					initialContent={this.state.topic.description}
					onChange={failEarlyStateSet(
						this.state,
						this.setState.bind(this),
						'topic',
						'description'
					)}
					required
				/>

				<TextField
					style={{
						borderBottom: `5px solid ${this.state.topic.color}`,
					}}
					onChange={failEarlyStateSet(
						this.state,
						this.setState.bind(this),
						'topic',
						'color'
					)}
					name="Color"
					initialContent={this.state.topic.color}
				/>

				<TwitterPicker
					color={this.state.topic.color}
					onChange={(e) =>
						failEarlyStateSet(
							this.state,
							this.setState.bind(this),
							'topic',
							'color'
						)(e.hex)
					}
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
							(this.state.topic.icon
								? ['fas', this.state.topic.icon.identifier]
								: faQuestionCircle) as unknown as IconDefinition
						}
						style={{
							marginRight: '10px',
						}}
						color={this.state.topic.color}
					/>
					<IconSelector
						searchable
						value={this.state.topic.icon}
						displayType="boxes"
						onSelect={failEarlyStateSet(
							this.state,
							this.setState.bind(this),
							'topic',
							'icon'
						)}
					/>
				</div>

				<Button
					color={Theme.SUCCESS}
					text="Submit"
					fullWidth={this.props.isPage}
					onClick={this.save}
				/>
				{this.props.isPage ? undefined : (
					<Button color={Theme.FAILURE} text="Cancel" />
				)}
			</div>
		);
	}
}

export const CreateTopic = withRouter(
	withNotificationContext(CreateTopicClass)
);
