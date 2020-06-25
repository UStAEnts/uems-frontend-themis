import * as React from 'react';
import { ProgressBar } from '../../atoms/progress-bar/ProgressBar';

import './TaskMeter.scss';

export type TaskMeterPropsType = {
    taskName: string,
    displayType: 'percentage' | 'fraction',
    color?: string,
    total: number,
    value: number,
    float: boolean,
};

export function TaskMeter(props: TaskMeterPropsType) {
    let progress;

    if (props.displayType === 'percentage') {
        const percentage = `${Math.round((props.value / props.total) * 100)}%`;
        progress = <div className="progress">{percentage}</div>;
    } else {
        progress = (
            <div className="progress">
                {props.value}
                {' '}
                /
                {' '}
                {props.total}
            </div>
        );
    }

    return (
        <div className={`task-meter ${props.float ? 'floating' : ''}`}>
            <div className="header" style={{ color: props.color }}>
                {progress}
                <div className="spacer" />
                <div className="task">{props.taskName}</div>
            </div>
            <ProgressBar value={props.value} total={props.total} color={props.color} />
        </div>
    );
}

TaskMeter.defaultProps = {
    total: 100,
    value: 0,
    displayType: 'percentage',
    color: '#0f93e6',
    float: false,
} as Partial<TaskMeterPropsType>;
