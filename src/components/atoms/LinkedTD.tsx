import { Link } from "react-router-dom";
import React from "react";

export type LinkedTDProps = {
    to: string,
};

export const LinkedTD: React.FunctionComponent<LinkedTDProps> = ({ to, children }) => {
    return (
        <td>
            <Link to={to}>
                {children}
            </Link>
        </td>
    )
}
