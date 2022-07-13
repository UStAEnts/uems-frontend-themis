import React from 'react';
import { GenericList, GenericRecord, genericRender } from '../../../components/components/generic-list/GenericList';
import {
    FallibleReactComponent,
    FallibleReactStateType,
} from '../../../components/components/error-screen/FallibleReactComponent';
import { loadAPIData } from '../../../utilities/DataUtilities';
import {UIUtilities} from "../../../utilities/UIUtilities";
import {NotificationPropsType} from "../../../context/NotificationContext";
import {withNotificationContext} from "../../../components/WithNotificationContext";
import apiInstance, { State } from "../../../utilities/APIPackageGen";

export type ListStatePropsType = {} & NotificationPropsType;

export type ListStateStateType = {
    states?: State[],
} & FallibleReactStateType;

class ListStateClass extends FallibleReactComponent<ListStatePropsType, ListStateStateType> {

    static displayName = 'ListState';

    constructor(props: Readonly<ListStatePropsType>) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        loadAPIData<ListStateStateType>(
            [{
                call: apiInstance.states().get,
                stateName: 'states',
                params: [{}],
            }],
            this.setState.bind(this),
            () => UIUtilities.tryShowPartialWarning(this),
        );
    }

    realRender() {
        if (!this.state.states) return null;

        const states: GenericRecord<State>[] = this.state.states.map((e) => ({
            identifier: e.id,
            target: `/states/${e.id}`,
            value: e,
        }));

        return (
            <div className="list-states" style={{ padding: '30px' }}>
                <h1>States</h1>
                <GenericList
                    records={states}
                    dontPad
                    render={genericRender<State>()}
                />
            </div>
        );
    }
}

export const ListState = withNotificationContext(ListStateClass);