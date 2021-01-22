import React from 'react';
import { API, EntsStateResponse } from '../../../utilities/APIGen';
import { GenericList, GenericRecord, genericRender } from '../../../components/components/generic-list/GenericList';
import { loadAPIData } from "../../../utilities/DataUtilities";
import { FallibleReactComponent, FallibleReactStateType } from "../../../components/components/error-screen/FallibleReactComponent";

export type ListEntPropsType = {};

export type ListEntStateType = {
    ents?: EntsStateResponse[],
} & FallibleReactStateType;

export class ListEnt extends FallibleReactComponent<ListEntPropsType, ListEntStateType> {

    static displayName = 'ListEnt';

    constructor(props: Readonly<ListEntPropsType>) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        loadAPIData<ListEntStateType>([{
            params: [],
            stateName: 'ents',
            call: API.ents.get,
        }], this.setState.bind(this));
    }

    realRender() {
        if (!this.state.ents) return null;

        const ents: GenericRecord<EntsStateResponse>[] = this.state.ents.map((e) => ({
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
                    render={genericRender<EntsStateResponse>()}
                />
            </div>
        );
    }
}
