import Axios from 'axios';
import urljoin from 'url-join';
import Config from '../config/Config';
import {
    CommentResponse,
    CommentUpdate,
    EntsStateCreation,
    EntsStateResponse,
    EventCreation,
    EventResponse,
    EventUpdate,
    EventWithChangelogResponse,
    FileCreation,
    FileResponse,
    SignupCreation,
    SignupResponse,
    SignupUpdate, StateCreation,
    StateResponse, StateUpdate, TopicCreation, TopicResponse, TopicUpdate,
    User, VenueCreation, VenueResponse, VenueUpdate,
} from './APITypes';

/**
 * Represents a single api function. It is a callable function which takes any number of parameters and returns a typed
 * promise of data from the API
 */
type APIFunction<T> = {
    (...args: any[]): Promise<T>,
    uri: string,
    description: string,
};

/**
 * Binds a callable function taking a URI and any number of parameters returning a typed promise and attaches the uri
 * and description. The passed in function will have the uri bound to it as a parameter meaning that the returned API
 * function will be callable with just the arguments.
 * @param call the function to bind into an API function
 * @param uri the uri that this API function operates on
 * @param description the description of this API endpoint
 */
function bind<T>(call: (uri: string, ...args: any[]) => Promise<T>, uri: string, description: string): APIFunction<T> {
    const func = (call.bind(undefined, uri) as unknown) as APIFunction<T>;

    func.description = description;
    func.uri = uri;

    return func;
}

function formatUri(uri: string, substitutions?: { [key: string]: any }): string {
    let result = uri;
    if (substitutions) {
        for (const entry of Object.entries(substitutions)) {
            result = result.replace(`{${entry[0]}}`, encodeURIComponent(entry[1]));
        }
    }

    // Join it on to the gateway URI
    result = urljoin(
        Config.BASE_GATEWAY_URI,
        result,
    );

    return result;
}

function datalessRequest<T>(
    uri: string,
    method: 'get' | 'delete',
    substitutions?: { [key: string]: any },
) {
    const result = formatUri(uri, substitutions);

    return new Promise<T>((resolve, reject) => {
        Axios[method](
            result,
            {
                headers: {
                    accept: 'application/json',
                },
            },
        ).then((data) => {
            if (method === 'delete') resolve();
            else resolve(data.data.result);
        }).catch(reject);
    });
}

/**
 * Basic get request format which substitutes values into the URI (these are URI encoded) and then does a basic AXIOS
 * GET request resolving with the data in a Successful API Response result as defined in the OpenAPI spec. On error the
 * returned promise rejects
 * @param uri a uei which uses {value} as substitution values
 * @param substitutions an object of substitutions, each key will be wrapped in {} and then that string will be replaced
 * with the value in the URI. This are uri encoded but caution should still be given for user input
 */
function getRequest<T>(
    uri: string,
    substitutions?: { [key: string]: any },
): Promise<T> {
    return datalessRequest<T>(uri, 'get', substitutions);
}

function deleteRequest<T>(
    uri: string,
    substitutions?: { [key: string]: any },
): Promise<T> {
    return datalessRequest<T>(uri, 'delete', substitutions);
}

function requestWithData<T, K>(
    uri: string,
    data: K,
    method: 'post' | 'patch',
    substitutions?: { [key: string]: any },
): Promise<T> {
    const result = formatUri(uri, substitutions);

    return new Promise<T>((resolve, reject) => {
        Axios[method](
            result,
            JSON.stringify(data),
            {
                headers: {
                    'content-type': 'application/json',
                    accept: 'application/json',
                },
            },
        ).then((resData) => {
            resolve(resData.data.result);
        }).catch(reject);
    });
}

function postRequest<T, K>(
    uri: string,
    data: K,
    substitutions?: { [key: string]: any },
) {
    return requestWithData<T, K>(uri, data, 'post', substitutions);
}

function patchRequest<T, K>(
    uri: string,
    data: K,
    substitutions?: { [key: string]: any },
) {
    return requestWithData<T, K>(uri, data, 'patch', substitutions);
}

export const API = {
    events: {
        // events/
        this: {
            get: bind<EventResponse[]>(
                (uri: string) => getRequest<EventResponse[]>(uri),
                '/events',
                'Lists all events matching the provided query',
            ),
            post: bind<IDOnlyResponse>(
                (uri: string, event: EventCreation) => postRequest<IDOnlyResponse, EventCreation>(uri, event),
                '/events',
                'Creates a new event with the provided parameters',
            ),
        },
        id: {
            // events/{id}
            this: {
                get: bind<EventWithChangelogResponse>(
                    (uri: string, id: string) => getRequest<EventWithChangelogResponse>(uri, { id }),
                    '/events/{id}',
                    'Fetches properties on a single event',
                ),
                patch: bind<IDOnlyResponse>(
                    (uri: string, id: string, event: EventUpdate) => patchRequest<IDOnlyResponse, EventUpdate>(
                        uri,
                        event,
                        { id },
                    ),
                    '/events/{id}',
                    'Updates this event with the given changes',
                ),
                delete: bind<IDOnlyResponse>(
                    (uri: string, id: string) => deleteRequest<IDOnlyResponse>(uri, { id }),
                    '/events/{id}',
                    'Deletes a single event',
                ),
            },

            comments: {
                // events/{id}/comments
                this: {
                    get: bind<CommentResponse[]>(
                        (uri: string, id: string) => getRequest<CommentResponse[]>(uri, { id }),
                        '/events/{id}/comments',
                        'Fetches all comments on this event',
                    ),
                    post: bind<IDOnlyResponse>(
                        (uri: string, id: string, event: CommentUpdate) => postRequest<IDOnlyResponse,
                            typeof event>(uri, event, { id }),
                        '/events/{id}/comments',
                        'Creates a new comment on this event with the provided parameters',
                    ),
                },

                id: {
                    // events/{id}/comments/{id}
                    this: {
                        get: bind<CommentResponse>(
                            (uri: string, eventID: string, commentID: string) => getRequest<CommentResponse>(
                                uri,
                                {
                                    eventID,
                                    commentID,
                                },
                            ),
                            '/events/{eventID}/comments/{commentID}',
                            'Fetches properties on a single comment on an event',
                        ),
                        patch: bind<IDOnlyResponse>(
                            (
                                uri: string,
                                eventID: string,
                                commentID: string,
                                data: CommentUpdate,
                            ) => patchRequest<IDOnlyResponse, typeof data>(uri, data, {
                                eventID,
                                commentID,
                            }),
                            '/events/{eventID}/comments/{commentID}',
                            'Updates this event comment with the given changes',
                        ),
                        delete: bind<void>(
                            (uri: string, eventID: string, commentID: string) => deleteRequest<void>(
                                uri,
                                {
                                    eventID,
                                    commentID,
                                },
                            ),
                            '/events/{eventID}/comments/{commentID}',
                            'Deletes a single comment on an event',
                        ),
                    },
                },
            },

            files: {
                // events/{id}/files/
                this: {
                    get: bind<FileResponse[]>(
                        (uri: string, eventID: string) => getRequest<FileResponse[]>(uri, {
                            eventID,
                        }),
                        '/events/{eventID}/files',
                        'Fetches all files associated with this event',
                    ),
                    post: bind<IDOnlyResponse>(
                        (uri: string, eventID: string, event: IDOnlyResponse) => postRequest<IDOnlyResponse,
                            IDOnlyResponse>(uri, event, { eventID }),
                        '/events/{eventID}/files',
                        'Links a new file with this event',
                    ),
                },

                id: {
                    // events/{id}/files/{id}
                    this: {
                        get: bind<FileResponse>(
                            (uri: string, eventID: string, fileID: string) => getRequest<FileResponse>(
                                uri,
                                {
                                    eventID,
                                    fileID,
                                },
                            ),
                            '/events/{eventID}/files/{fileID}',
                            'Retrieves properties on a single file associated with an event',
                        ),
                        delete: bind<void>(
                            (uri: string, eventID: string, fileID: string) => deleteRequest<void>(
                                uri,
                                {
                                    eventID,
                                    fileID,
                                },
                            ),
                            '/events/{eventID}/files/{fileID}',
                            'Deletes a file association with this event',
                        ),
                    },
                },
            },

            signups: {
                // events/{id}/signups
                this: {
                    get: bind<SignupResponse[]>(
                        (uri: string, eventID: string) => getRequest<SignupResponse[]>(uri, {
                            eventID,
                        }),
                        '/events/{eventID}/signups',
                        'Retrieves all signups to this event',
                    ),
                    post: bind<IDOnlyResponse>(
                        (uri: string, eventID: string, data: SignupCreation) => postRequest<IDOnlyResponse,
                            typeof data>(uri, data, { eventID }),
                        '/events/{eventID}/signups',
                        'Creates a new signup on this event with the provided parameters',
                    ),
                },

                id: {
                    // events/{id}/signups/{id}
                    this: {
                        get: bind<SignupResponse>(
                            (uri: string, eventID: string, signupID: string) => getRequest<SignupResponse>(
                                uri,
                                {
                                    eventID,
                                    signupID,
                                },
                            ),
                            '/events/{eventID}/signups/{signupID}',
                            'Retrieves properties on a single signup on this event',
                        ),
                        patch: bind<IDOnlyResponse>(
                            (
                                uri: string,
                                eventID: string,
                                signupID: string,
                                data: SignupUpdate,
                            ) => patchRequest<IDOnlyResponse, typeof data>(uri, data, {
                                eventID,
                                signupID,
                            }),
                            '/events/{eventID}/signups/{signupID}',
                            'Updates this event signup with the given changes',
                        ),
                        delete: bind<void>(
                            (uri: string, eventID: string, signupID: string) => deleteRequest<void>(
                                uri,
                                {
                                    eventID,
                                    signupID,
                                },
                            ),
                            '/events/{eventID}/signups/{signupID}',
                            'Deletes a single signup on this event',
                        ),
                    },
                },
            },
        },
    },

    ents: {
        // ents
        this: {
            get: bind<EntsStateResponse[]>(
                (uri: string) => getRequest<EntsStateResponse[]>(uri),
                '/ents/',
                'Retrieves all ents states',
            ),
            post: bind<IDOnlyResponse>(
                (uri: string, data: EntsStateCreation) => postRequest<IDOnlyResponse, typeof data>(uri, data),
                '/ents',
                'Creates a new ents state',
            ),
        },

        id: {
            // ents/{id}
            this: {
                get: bind<EntsStateResponse>(
                    (uri: string, entsID: string) => getRequest<EntsStateResponse>(uri, { entsID }),
                    '/ents/{entsID}',
                    'Retrieves the given ents state',
                ),
                patch: bind<IDOnlyResponse>(
                    (
                        uri: string,
                        entsID: string,
                        data: CommentUpdate,
                    ) => patchRequest<IDOnlyResponse, typeof data>(uri, data, { entsID }),
                    '/ents/{entsID}',
                    'Updates this ent state with the given changes',
                ),
                delete: bind<void>(
                    (uri: string, entsID: string) => deleteRequest<void>(uri, { entsID }),
                    '/ents/{entsID}',
                    'Deletes the given ents state',
                ),
            },
        },
    },

    files: {
        // files
        this: {
            get: bind<FileResponse[]>(
                (uri: string) => getRequest<FileResponse[]>(uri),
                '/files',
                'Retrieves all files on the system',
            ),
            post: bind<IDOnlyResponse>(
                (uri: string, data: FileCreation) => postRequest<IDOnlyResponse, typeof data>(uri, data),
                '/files',
                'Creates a new file on the system without data',
            ),
        },

        id: {
            // files/{id}
            this: {
                get: bind<FileResponse>(
                    (uri: string, fileID: string) => getRequest<FileResponse>(uri, { fileID }),
                    '/files/{fileID}',
                    'Retrieves the given file by its ID',
                ),
                put: undefined,
                patch: bind<IDOnlyResponse>(
                    (
                        uri: string,
                        fileID: string,
                        data: CommentUpdate,
                    ) => patchRequest<IDOnlyResponse, typeof data>(uri, data, { fileID }),
                    '/files/{fileID}',
                    'Updates this file with the given changes',
                ),
                delete: bind<void>(
                    (uri: string, fileID: string) => deleteRequest<void>(uri, { fileID }),
                    '/files/{fileID}',
                    'Deletes the given file by its ID',
                ),
            },

            events: {
                // files/{id}/events
                this: {
                    get: bind<EventResponse[]>(
                        (uri: string, fileID: string) => getRequest<EventResponse[]>(uri, { fileID }),
                        '/files/{fileID}/events',
                        'Retrieves all events linked to this file',
                    ),
                },
            },

            comments: {
                // files/{id}/comments
                this: {
                    get: bind<CommentResponse[]>(
                        (uri: string, fileID: string) => getRequest<CommentResponse[]>(uri, { fileID }),
                        '/files/{fileID}/comments',
                        'Retrieves all comments made on this file',
                    ),
                    post: bind<IDOnlyResponse>(
                        (uri: string, fileID: string, data: CommentUpdate) => postRequest<IDOnlyResponse,
                            typeof data>(uri, data, { fileID }),
                        '/files/{fileID}/comments',
                        'Creates a new comment on this file with the provided parameters',
                    ),
                },

                id: {
                    // files/{id}/comments/{id}
                    this: {
                        get: bind<CommentResponse>(
                            (uri: string, fileID: string, commentID: string) => getRequest<CommentResponse>(
                                uri,
                                {
                                    fileID,
                                    commentID,
                                },
                            ),
                            '/files/{fileID}/comments/{commentID}',
                            'Retrieves a single comment made on this file',
                        ),
                        patch: bind<IDOnlyResponse>(
                            (
                                uri: string,
                                fileID: string,
                                commentID: string,
                                data: CommentUpdate,
                            ) => patchRequest<IDOnlyResponse, typeof data>(uri, data, {
                                fileID,
                                commentID,
                            }),
                            '/files/{fileID}/comments/{commentID}',
                            'Updates this file comment with the given changes',
                        ),
                        delete: bind<void>(
                            (uri: string, fileID: string, commentID: string) => deleteRequest<void>(
                                uri,
                                {
                                    fileID,
                                    commentID,
                                },
                            ),
                            '/files/{fileID}/comments/{commentID}',
                            'Deletes a single comment made on this file',
                        ),
                    },
                },
            },
        },
    },

    states: {
        // states/
        this: {
            get: bind<StateResponse[]>(
                (uri: string) => getRequest<StateResponse[]>(uri),
                '/states',
                'Retrieves all possible states',
            ),
            post: bind<IDOnlyResponse>(
                (uri: string, data: StateCreation) => postRequest<IDOnlyResponse, typeof data>(uri, data),
                '/states',
                'Creates a new event state',
            ),
        },

        id: {
            // states/{id}
            this: {
                get: bind<StateResponse>(
                    (uri: string, stateID: string) => getRequest<StateResponse>(uri, { stateID }),
                    '/states/{id}',
                    'Retrieves this individual state',
                ),
                patch: bind<IDOnlyResponse>(
                    (
                        uri: string,
                        stateID: string,
                        data: StateUpdate,
                    ) => patchRequest<IDOnlyResponse, typeof data>(uri, data, { stateID }),
                    '/states/{stateID}',
                    'Updates this event state with the given changes',
                ),
                delete: bind<void>(
                    (uri: string, stateID: string) => deleteRequest<void>(uri, { stateID }),
                    '/states/{id}',
                    'Deletes this individual state',
                ),
            },

            events: {
                // states/{id}/events
                this: {
                    get: bind<EventResponse[]>(
                        (uri: string, stateID: string) => getRequest<EventResponse[]>(uri, { stateID }),
                        '/states/{id}/events',
                        'Retrieves all events marked with this state',
                    ),
                },
            },
        },
    },

    topics: {
        // topics/
        this: {
            get: bind<TopicResponse[]>(
                (uri: string) => getRequest<TopicResponse[]>(uri),
                '/topics',
                'Retrieves all topics',
            ),
            post: bind<IDOnlyResponse>(
                (uri: string, data: TopicCreation) => postRequest<IDOnlyResponse, typeof data>(uri, data),
                '/topics',
                'Creates a new topic with the provided parameters',
            ),
        },

        id: {
            // topics/{id}
            this: {
                get: bind<TopicResponse>(
                    (uri: string, topicID: string) => getRequest<TopicResponse>(uri, { topicID }),
                    '/topics/{topicID}',
                    'Fetches this topic by ID',
                ),
                patch: bind<IDOnlyResponse>(
                    (
                        uri: string,
                        topicID: string,
                        data: TopicUpdate,
                    ) => patchRequest<IDOnlyResponse, typeof data>(uri, data, { topicID }),
                    '/topics/{topicID}',
                    'Updates this topic with the given changes',
                ),
                delete: bind<void>(
                    (uri: string, topicID: string) => deleteRequest<void>(uri, { topicID }),
                    '/topics/{topicID}',
                    'Deletes this topic by ID',
                ),
            },
        },
    },

    users: {
        // users
        this: {
            get: bind<User[]>(
                (uri: string) => getRequest<User[]>(uri),
                '/users',
                'Fetches all users on the system',
            ),
        },

        id: {
            // users/{id}
            this: {
                get: bind<User>(
                    (uri: string, userID: string) => getRequest<User>(uri, { userID }),
                    '/users/{userID}',
                    'Fetches this individual user',
                ),
            },
        },
    },

    venues: {
        // venues
        this: {
            get: bind<VenueResponse[]>(
                (uri: string) => getRequest<VenueResponse[]>(uri),
                '/venues',
                'Retrieves all venues',
            ),
            post: bind<IDOnlyResponse>(
                (uri: string, data: VenueCreation) => postRequest<IDOnlyResponse, typeof data>(uri, data),
                '/venues',
                'Creates a new venue',
            ),
        },

        id: {
            // venues/{id}
            this: {
                get: bind<VenueResponse>(
                    (uri: string, venueID: string) => getRequest<VenueResponse>(uri, { venueID }),
                    '/venues/{venueID}',
                    'Retrieves the given venue',
                ),
                patch: bind<IDOnlyResponse>(
                    (
                        uri: string,
                        venueID: string,
                        data: VenueUpdate,
                    ) => patchRequest<IDOnlyResponse, typeof data>(uri, data, { venueID }),
                    '/venues/{venueID}',
                    'Updates this venue with the given changes',
                ),
                delete: bind<void>(
                    (uri: string, venueID: string) => deleteRequest<void>(uri, { venueID }),
                    '/venues/{venueID}',
                    'Deletes the given venue',
                ),
            },

            events: {
                this: {
                    get: bind<EventResponse[]>(
                        (uri: string, venueID: string) => getRequest<EventResponse[]>(uri, { venueID }),
                        '/venues/{venueID}/events',
                        'Fetches all events taking place in this venue',
                    ),
                },
            },
        },
    },
};

type AugmentedRequired<T extends object,
    K extends keyof T = keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type IDOnlyResponse = {
    id: string,
};
