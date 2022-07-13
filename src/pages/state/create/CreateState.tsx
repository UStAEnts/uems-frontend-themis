import React from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { TwitterPicker } from 'react-color';
import { faNetworkWired, faQuestionCircle, faSkullCrossbones, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { NotificationContextType } from '../../../context/NotificationContext';
import { TextField } from '../../../components/atoms/text-field/TextField';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { Button } from '../../../components/atoms/button/Button';
import { Theme } from '../../../theme/Theme';
import { UIUtilities } from '../../../utilities/UIUtilities';
import { withNotificationContext } from '../../../components/WithNotificationContext';
import { OptionType } from '../../../components/atoms/icon-picker/EntrySelector';
import { IconSelector } from '../../../components/atoms/icon-picker/IconPicker';
import { IconBox } from '../../../components/atoms/icon-box/IconBox';
import apiInstance from "../../../utilities/APIPackageGen";

export type CreateStatePropsType = {
	isPage?: boolean,
	notificationContext?: NotificationContextType,
};

export type CreateStateStateType = {
	state: {
		name?: string,
		color?: string,
		icon?: OptionType,
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
					`You must provide a ${ key } value`,
					faSkullCrossbones,
					Theme.FAILURE,
				);
				return;
			}
		}

		// TODO; sensible defaults?
		UIUtilities.load(this.props, apiInstance.states().post({
			color: this.state.state.color ?? '#000000',
			icon: this.state.state.icon?.identifier ?? 'faTag',
			name: this.state.state.name as string, // This is verified in the for loop above but the typing doesnt work
		}), (e) => `Failed to create your state! ${ e }`)
			.data((id) => {
				if (id.length !== 1 || typeof (id[0]) !== 'string') {
					UIUtilities.tryShowNotification(
						this.props.notificationContext,
						'Failed to save',
						`Received an error response: ID was not returned`,
						faNetworkWired,
						Theme.FAILURE,
					);
				}

				failEarlyStateSet(this.state, this.setState.bind(this), 'ui', 'redirect')(`/states/${ id[0] }`);
			});
	}

	render() {
		return (
			<div className={ `create-event ${ this.props.isPage ? 'page' : '' }` }>
				{
					this.state.ui.redirect ? <Redirect to={ this.state.ui.redirect }/> : undefined
				}
				<div className="title">Create State</div>
				<TextField
					name="State Name"
					initialContent={ this.state.state.name }
					onChange={ failEarlyStateSet(this.state, this.setState.bind(this), 'state', 'name') }
					required
				/>

				<TextField
					style={ {
						borderBottom: `5px solid ${ this.state.state.color }`,
					} }
					onChange={ failEarlyStateSet(this.state, this.setState.bind(this), 'state', 'color') }
					name="Color"
					initialContent={ this.state.state.color }
				/>

				<TwitterPicker
					color={ this.state.state.color }
					onChange={ (e) => failEarlyStateSet(this.state, this.setState.bind(this), 'state', 'color')(e.hex) }
				/>

				<div
					className="icon-title"
					style={ {
						marginTop: '20px',
						marginBottom: '10px',
						fontSize: '0.8em',
						color: 'gray',
					} }
				>
					Icon
				</div>

				<div
					style={ {
						display: 'flex',
						alignItems: 'flex-start',
						marginBottom: '20px',
					} }
				>
					<IconBox
						icon={
							(this.state.state.icon ? ['fas', this.state.state.icon.identifier] : faQuestionCircle) as
								unknown as IconDefinition
						}
						style={ {
							marginRight: '10px',
						} }
						color={ this.state.state.color }
					/>
					<IconSelector
						searchable
						value={ this.state.state.icon }
						displayType="boxes"
						onSelect={ failEarlyStateSet(this.state, this.setState.bind(this), 'state', 'icon') }
					/>
				</div>

				<Button
					color={ Theme.SUCCESS }
					text="Submit"
					fullWidth={ this.props.isPage }
					onClick={ this.save }
				/>
				{
					this.props.isPage ? undefined
						: (
							<Button color={ Theme.FAILURE } text="Cancel"/>
						)
				}
			</div>
		);
	}
}

export const CreateState = withRouter(withNotificationContext(CreateStateClass));
