export enum VenueStatus {
    Open,
    Maintenance,
    Closed,
    Unknown
}

export type Venue = {
    _id: string,
    name: string,
    status: VenueStatus
}