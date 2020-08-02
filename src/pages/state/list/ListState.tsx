import React from 'react';
import { API, StateResponse } from '../../../utilities/APIGen';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { GenericList, GenericRecord, genericRender } from '../../../components/components/generic-list/GenericList';

export type ListStatePropsType = {};

export type ListStateStateType = {
    states?: StateResponse[],
};

export class ListState extends React.Component<ListStatePropsType, ListStateStateType> {

    static displayName = 'ListState';

    constructor(props: Readonly<ListStatePropsType>) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        API.states.get().then((data) => failEarlyStateSet(this.state, this.setState.bind(this), 'states')(data.result))
            .catch((err) => console.error(err));
    }

    render() {
        if (!this.state.states) return null;

        const states: GenericRecord<StateResponse>[] = this.state.states.map((e) => ({
            identifier: e.id,
            target: `/states/${e.id}`,
            value: e,
        }));

        return (
            <div className="list-states" style={{padding: '30px'}}>
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
