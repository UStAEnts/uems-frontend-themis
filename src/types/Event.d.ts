export type EventState = {
    state: string,
    icon?: IconDefinition,
    color?: string,
}

export type EntsStatus = {
    name: string,
    color?: string,
}

export type Event = {
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
