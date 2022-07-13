import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { IconName } from '@fortawesome/free-solid-svg-icons';
import { ColorUtilities } from "../../../utilities/ColorUtilities";
import { EntState, State } from "../../../utilities/APIPackageGen";

export const Tag: React.FunctionComponent<{
    tag?: EntState | State,
}> = ({ tag }) => {
    if (!tag) return null;
    return (
        <div
            className="tag"
            style={{
                backgroundColor: tag.color ?? '#ffffff',
                color: ColorUtilities.determineForegroundColor(tag.color ?? '#ffffff'),
                padding: '5px 8px',
                borderRadius: '3px',
                display: 'inline-flex',
                alignItems: 'center',
            }}
        >
            {
                tag.icon
                    ? (
                        <FontAwesomeIcon
                            icon={tag.icon as IconName}
                            style={{
                                marginRight: '10px',
                            }}
                        />
                    )
                    : undefined
            }
            {tag.name}
        </div>
    )
};
