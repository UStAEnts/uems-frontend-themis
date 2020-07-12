export type EventState = {
    state: string,
    icon?: IconDefinition,
    color?: string,
}

export type EntsStatus = {
    name: string,
    color?: string,
}

export type GatewayEvent = {
    _id: string,
    name: string,
    venue: string,
    bookingStart: Date,
    bookingEnd: Date,
    attendance: number,

    icon?: IconDefinition,
    color?: string,
    state?: EventState,
    entsStatus?: EntsStatus,
}

export type User = {
    username: string,
    name: string,
    profile?: string,
}

export type ContentClass = {
    name: string,
    description?: string,
    color?: string,
}

export type Comment = {
    poster: User,
    posted: Date,
    content: string,
    type: ContentClass,
}

/**
 * Source: https://xiomi.stoplight.io/docs/uems-gateway-api/reference/kill-me.yaml/components/schemas/FileResponse
 */
export type GatewayFile = {
    id: string,
    filename: string,
    created: number,
    author: User,
    size: number,
    downloadURL: string,
    name: string,
    private: boolean,
}

/**
 * Source: https://xiomi.stoplight.io/docs/uems-gateway-api/reference/kill-me.yaml/components/schemas/ActionResponse
 */
export type EventChange = {
    id: string,
    occurred: number,
    change: string,
    user?: User,
}
