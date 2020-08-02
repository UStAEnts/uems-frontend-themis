import React from 'react';
import { API, EntsStateResponse } from '../../../utilities/APIGen';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { GenericList, GenericRecord, genericRender } from '../../../components/components/generic-list/GenericList';

export type ListEntPropsType = {};

export type ListEntStateType = {
    ents?: EntsStateResponse[],
};

export class ListEnt extends React.Component<ListEntPropsType, ListEntStateType> {

    static displayName = 'ListEnt';

    constructor(props: Readonly<ListEntPropsType>) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        API.ents.get().then((data) => failEarlyStateSet(this.state, this.setState.bind(this), 'ents')(data.result))
            .catch((err) => console.error(err));
    }

    render() {
        if (!this.state.ents) return null;

        const ents: GenericRecord<EntsStateResponse>[] = this.state.ents.map((e) => ({
            identifier: e.id,
            target: `/ents/${e.id}`,
            value: e,
        }));

        return (
            <div className="list-ents" style={{padding: '30px'}}>
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
