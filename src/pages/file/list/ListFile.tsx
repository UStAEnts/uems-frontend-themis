import React from 'react';
import { GenericList, GenericRecord, genericRender } from '../../../components/components/generic-list/GenericList';
import { Theme } from "../../../theme/Theme";
import { UIUtilities } from "../../../utilities/UIUtilities";
import { loadAPIData } from "../../../utilities/DataUtilities";
import { FallibleReactComponent, FallibleReactStateType } from "../../../components/components/error-screen/FallibleReactComponent";
import {NotificationPropsType} from "../../../context/NotificationContext";
import {withNotificationContext} from "../../../components/WithNotificationContext";
import apiInstance, { UEMSFile } from "../../../utilities/APIPackageGen";

export type ListFilePropsType = {} & NotificationPropsType;

export type ListFileStateType = {
    files?: UEMSFile[],
} & FallibleReactStateType;

class ListFileClass extends FallibleReactComponent<ListFilePropsType, ListFileStateType> {

    static displayName = 'ListFile';

    constructor(props: Readonly<ListFilePropsType>) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        loadAPIData<ListFileStateType>(
            [{
                call: apiInstance.files().get,
                stateName: 'files',
                params: [{}],
            }],
            this.setState.bind(this),
            () => UIUtilities.tryShowPartialWarning(this),
        );
    }

    realRender() {
        if (!this.state.files) return null;

        const files: GenericRecord<any>[] = this.state.files.map((e) => ({
            identifier: e.id,
            target: `/files/${e.id}`,
            value: {
                name: e.name,
                // TODO: private files?
                icon: /*e.private*/false ? 'lock' : 'globe',
                filename: e.filename,
                size: UIUtilities.sizeToHuman(e.size),
                id: e.id,
                // TODO: private files?
                color: /*e.private*/false ? Theme.RED_LIGHT : Theme.GRAY_LIGHT,
            },
        }));

        return (
            <div className="list-files" style={{ padding: '30px' }}>
                <h1>Files</h1>
                <GenericList
                    records={files}
                    dontPad
                    searchable={(value: GenericRecord<UEMSFile>) => ([
                        value.value.filename,
                        value.value.name,
                    ])}
                    render={genericRender<UEMSFile>()}
                />
            </div>
        );
    }
}

export const ListFile = withNotificationContext(ListFileClass);