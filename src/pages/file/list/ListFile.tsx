import React from 'react';
import { API, FileResponse } from '../../../utilities/APIGen';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { GenericList, GenericRecord, genericRender } from '../../../components/components/generic-list/GenericList';
import { Theme } from "../../../theme/Theme";
import { UIUtilities } from "../../../utilities/UIUtilities";

export type ListFilePropsType = {};

export type ListFileStateType = {
    files?: FileResponse[],
};

export class ListFile extends React.Component<ListFilePropsType, ListFileStateType> {

    static displayName = 'ListFile';

    constructor(props: Readonly<ListFilePropsType>) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        API.files.get().then((data) => failEarlyStateSet(this.state, this.setState.bind(this), 'files')(data.result))
            .catch((err) => console.error(err));
    }

    render() {
        if (!this.state.files) return null;

        const files: GenericRecord<any>[] = this.state.files.map((e) => ({
            identifier: e.id,
            target: `/files/${e.id}`,
            value: {
                name: e.name,
                icon: e.private ? 'lock' : 'globe',
                filename: e.filename,
                size: UIUtilities.sizeToHuman(e.size),
                id: e.id,
                color: e.private ? Theme.RED_LIGHT : Theme.GRAY_LIGHT,
            },
        }));

        return (
            <div className="list-files" style={{ padding: '30px' }}>
                <h1>Files</h1>
                <GenericList
                    records={files}
                    dontPad
                    searchable={(value: GenericRecord<FileResponse>) => ([
                        value.value.filename,
                        value.value.name,
                    ])}
                    render={genericRender<FileResponse>()}
                />
            </div>
        );
    }
}
