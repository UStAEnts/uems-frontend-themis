import * as React from 'react';

import './ProgressBar.scss';

export type ProgressBarPropsType = {
    /**
     * The total possible value that 'value' could be
     */
    total: number,
    /**
     * The current value of the progress
     */
    value: number,
    /**
     * The color of the bar, blue if none is provided
     */
    color: string,
};

export function ProgressBar(props: ProgressBarPropsType) {
    const percent = (props.value / props.total) * 100;
    return (
        <div className="progress-bar">
            <div className="inner" style={{ width: `${percent}%`, backgroundColor: props.color }} />
        </div>
    );
}

ProgressBar.defaultProps = {
    total: 100,
    value: 0,
    color: '#0f93e6',
} as Partial<ProgressBarPropsType>;
