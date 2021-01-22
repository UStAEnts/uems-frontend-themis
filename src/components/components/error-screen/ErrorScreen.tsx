import React from 'react';

import './ErrorScreen.scss';

export const ErrorScreen: React.FunctionComponent<{
    error: React.ReactNode,
}> = ({ error }) => (
    <div className="error-screen">
        <img
            src="/hole-failure.png"
            alt="A tear in the screen (as if you've punched a hole in paper) revealing a landscape of St Andrews
            taken on the Links in sunset looking towards the Rusacks Hotel"
        />
        <h1>Something&apos;s gone wrong!</h1>
        <div>
            <div className="intro">
                In the process of loading this page, something serious went wrong that we couldn't recover from.
            </div>
            <div className="detail">
                {error}
            </div>
        </div>
    </div>
);
