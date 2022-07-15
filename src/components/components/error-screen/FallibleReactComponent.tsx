import React from 'react';
import Loader from 'react-loader-spinner';
import { Theme } from '../../../theme/Theme';
import { UIUtilities } from '../../../utilities/UIUtilities';
import { ErrorScreen } from './ErrorScreen';

export type FallibleReactStateType = {
	error?: React.ReactNode;
	loading?: boolean;
};

export abstract class FallibleReactComponent<
	Props extends any,
	State extends FallibleReactStateType
> extends React.Component<Props, State> {
	constructor(props: Readonly<Props>) {
		super(props);

		this.state = { loading: true } as Readonly<State>;
	}

	abstract realRender(): React.ReactNode;

	render() {
		if (this.state.error) {
			return <ErrorScreen error={this.state.error} />;
		}

		if (this.state.loading) {
			return (
				<div
					style={{
						width: '100%',
						height: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Loader color={Theme.PINK} type={UIUtilities.randomLoaderType()} />
				</div>
			);
		}

		return this.realRender();
	}
}
