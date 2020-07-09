import * as React from 'react';
import { ProgressBar } from '../../atoms/progress-bar/ProgressBar';

import './TaskMeter.scss';

export type TaskMeterPropsType = {
    /**
     * The name of the task to display around the progress bar
     */
    taskName: string,
    /**
     * If the progress should be shown as a percentage or as a fractional value (ie 1 / 4)
     */
    displayType: 'percentage' | 'fraction',
    /**
     * The optional colour of the task
     */
    color?: string,
    /**
     * The maximum possible value of this task meter
     */
    total: number,
    /**
     * The current value of this task meter
     */
    value: number,
    /**
     * If the bar should be rendered as floating or just as part of the layout
     */
    float: boolean,
};

/**
 * Returns a Task Meter component which renders a progress bar with the text in either fraction or percentage form
 * @param props the properties as described by {@link TaskMeterPropsType}
 * @constructor
 */
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
