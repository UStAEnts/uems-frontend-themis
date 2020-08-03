import React from 'react';
import { API, FileResponse } from '../../../utilities/APIGen';
import { failEarlyStateSet } from '../../../utilities/AccessUtilities';
import { GenericList, GenericRecord, genericRender } from '../../../components/components/generic-list/GenericList';
import { Theme } from "../../../theme/Theme";
import { UIUtilities } from "../../../utilities/UIUtilities";
import { loadAPIData } from "../../../utilities/DataUtilities";
import { ViewTopicStateType } from "../../topic/view/ViewTopic";
import {
    FallibleReactComponent,
    FallibleReactStateType
} from "../../../components/components/error-screen/FallibleReactComponent";

export type ListFilePropsType = {};

export type ListFileStateType = {
    files?: FileResponse[],
} & FallibleReactStateType;

export class ListFile extends FallibleReactComponent<ListFilePropsType, ListFileStateType> {

    static displayName = 'ListFile';

    constructor(props: Readonly<ListFilePropsType>) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        loadAPIData<ListFileStateType>(
            [{
                call: API.files.get,
                stateName: 'files',
                params: [],
            }],
            this.setState.bind(this),
        );
    }

    realRender() {
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
