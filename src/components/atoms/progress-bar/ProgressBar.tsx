import * as React from 'react';

import './ProgressBar.scss';

export type ProgressBarPropsType = {
    total: number,
    value: number,
    color: string,
};

export type ProgressBarStateType = {};

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
