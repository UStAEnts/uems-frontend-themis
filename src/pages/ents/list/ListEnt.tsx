import React from 'react';
import {
	GenericList,
	GenericRecord,
	genericRender,
} from '../../../components/components/generic-list/GenericList';
import { loadAPIData } from '../../../utilities/DataUtilities';
import {
	FallibleReactComponent,
	FallibleReactStateType,
} from '../../../components/components/error-screen/FallibleReactComponent';
import { UIUtilities } from '../../../utilities/UIUtilities';
import { NotificationPropsType } from '../../../context/NotificationContext';
import { withNotificationContext } from '../../../components/WithNotificationContext';
import apiInstance, { EntState } from '../../../utilities/APIPackageGen';

export type ListEntPropsType = {} & NotificationPropsType;

export type ListEntStateType = {
	ents?: EntState[];
} & FallibleReactStateType;

class ListEntClass extends FallibleReactComponent<
	ListEntPropsType,
	ListEntStateType
> {
	static displayName = 'ListEnt';

	constructor(props: Readonly<ListEntPropsType>) {
		super(props);

		this.state = {};
	}

	componentDidMount() {
		loadAPIData<ListEntStateType>(
			[
				{
					params: [],
					stateName: 'ents',
					call: () => apiInstance.ents().get({}),
				},
			],
			this.setState.bind(this),
			() => UIUtilities.tryShowPartialWarning(this)
		);
	}

	realRender() {
		if (!this.state.ents) return null;

		const ents: GenericRecord<EntState>[] = this.state.ents.map((e) => ({
			identifier: e.id,
			target: `/ents/${e.id}`,
			value: e,
		}));

		return (
			<div className="list-ents" style={{ padding: '30px' }}>
				<h1>Ents</h1>
				<GenericList
					records={ents}
					dontPad
					render={genericRender<EntState>()}
				/>
			</div>
		);
	}
}

export const ListEnt = withNotificationContext(ListEntClass);
