import React from 'react';
import { API, StateResponse } from '../../../utilities/APIGen';
import { GenericList, GenericRecord, genericRender } from '../../../components/components/generic-list/GenericList';
import {
    FallibleReactComponent,
    FallibleReactStateType,
} from '../../../components/components/error-screen/FallibleReactComponent';
import { loadAPIData } from '../../../utilities/DataUtilities';

export type ListStatePropsType = {};

export type ListStateStateType = {
    states?: StateResponse[],
} & FallibleReactStateType;

export class ListState extends FallibleReactComponent<ListStatePropsType, ListStateStateType> {

    static displayName = 'ListState';

    constructor(props: Readonly<ListStatePropsType>) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        loadAPIData<ListStateStateType>(
            [{
                call: API.states.get,
                stateName: 'states',
                params: [],
            }],
            this.setState.bind(this),
        );
    }

    realRender() {
        if (!this.state.states) return null;

        const states: GenericRecord<StateResponse>[] = this.state.states.map((e) => ({
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
                    render={genericRender<StateResponse>()}
                />
            </div>
        );
    }
}
