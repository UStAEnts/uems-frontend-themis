import Axios from 'axios';
import urljoin from 'url-join';
import Config from '../config/Config';

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
) {
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

    return new Promise<T>((resolve, reject) => {
        Axios.get(result).then((data) => {
            resolve(data.data.result);
        }).catch(reject);
    });
}

export const API = {
    events: {
        // events/
        this: {
            get: bind(
                (uri: string) => getRequest<EventResponse[]>(uri),
                '/events',
                'Lists all events matching the provided query',
            ),
            post: undefined,
        },
        id: {
            // events/{id}
            this: {
                get: bind(
                    (uri: string, id: string) => getRequest<EventResponse>(uri, { id }),
                    '/events/{id}',
                    'Fetches properties on a single event',
                ),
                patch: undefined,
                delete: undefined,
            },

            comments: {
                // events/{id}/comments
                this: {
                    get: bind(
                        (uri: string, id: string) => getRequest<CommentResponse[]>(uri, { id }),
                        '/events/{id}/comments',
                        'Fetches all comments on this event',
                    ),
                    post: undefined,
                },

                id: {
                    // events/{id}/comments/{id}
                    this: {
                        get: bind(
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
                        patch: undefined,
                        delete: undefined,
                    },
                },
            },

            files: {
                // events/{id}/files/
                this: {
                    get: bind(
                        (uri: string, eventID: string) => getRequest<FileResponse[]>(uri, {
                            eventID,
                        }),
                        '/events/{eventID}/files',
                        'Fetches all files associated with this event',
                    ),
                    post: undefined,
                },

                id: {
                    // events/{id}/files/{id}
                    this: {
                        get: bind(
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
                        delete: undefined,
                    },
                },
            },

            signups: {
                // events/{id}/signups
                this: {
                    get: bind(
                        (uri: string, eventID: string) => getRequest<SignupResponse[]>(uri, {
                            eventID,
                        }),
                        '/events/{eventID}/signups',
                        'Retrieves all signups to this event',
                    ),
                    post: undefined,
                },

                id: {
                    // events/{id}/signups/{id}
                    this: {
                        get: bind(
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
                        patch: undefined,
                        delete: undefined,
                    },
                },
            },
        },
    },

    ents: {
        // ents
        this: {
            get: bind(
                (uri: string) => getRequest<EntsStateResponse[]>(uri),
                '/ents/',
                'Retrieves all ents states',
            ),
            post: undefined,
        },

        id: {
            // ents/{id}
            this: {
                get: bind(
                    (uri: string, entsID: string) => getRequest<EntsStateResponse>(uri, { entsID }),
                    '/ents/{entsID}',
                    'Retrieves the given ents state',
                ),
                patch: undefined,
                delete: undefined,
            },
        },
    },

    files: {
        // files
        this: {
            get: bind(
                (uri: string) => getRequest<FileResponse[]>(uri),
                '/files',
                'Retrieves all files on the system',
            ),
            post: undefined,
        },

        id: {
            // files/{id}
            this: {
                get: bind(
                    (uri: string, fileID: string) => getRequest<FileResponse>(uri, { fileID }),
                    '/files/{fileID}',
                    'Retrieves the given file by its ID',
                ),
                put: undefined,
                patch: undefined,
                delete: undefined,
            },

            events: {
                // files/{id}/events
                this: {
                    get: bind(
                        (uri: string, fileID: string) => getRequest<EventResponse[]>(uri, { fileID }),
                        '/files/{fileID}/events',
                        'Retrieves all events linked to this file',
                    ),
                },
            },

            comments: {
                // files/{id}/comments
                this: {
                    get: bind(
                        (uri: string, fileID: string) => getRequest<CommentResponse[]>(uri, { fileID }),
                        '/files/{fileID}/comments',
                        'Retrieves all comments made on this file',
                    ),
                    post: undefined,
                },

                id: {
                    // files/{id}/comments/{id}
                    this: {
                        get: bind(
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
                        patch: undefined,
                        delete: undefined,
                    },
                },
            },
        },
    },

    states: {
        // states/
        this: {
            get: bind(
                (uri: string) => getRequest<StateResponse[]>(uri),
                '/states',
                'Retrieves all possible states',
            ),
            post: undefined,
        },

        id: {
            // states/{id}
            this: {
                get: bind(
                    (uri: string, stateID: string) => getRequest<StateResponse>(uri, { stateID }),
                    '/states/{id}',
                    'Retrieves this individual state',
                ),
                patch: undefined,
                delete: undefined,
            },

            events: {
                // states/{id}/events
                this: {
                    get: bind(
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
            get: bind(
                (uri: string) => getRequest<TopicResponse[]>(uri),
                '/topics',
                'Retrieves all topics',
            ),
            post: undefined,
        },

        id: {
            // topics/{id}
            this: {
                get: bind(
                    (uri: string, topicID: string) => getRequest<TopicResponse>(uri, { topicID }),
                    '/topics/{topicID}',
                    'Fetches this topic by ID',
                ),
                patch: undefined,
                delete: undefined,
            },
        },
    },

    users: {
        // users
        this: {
            get: bind(
                (uri: string) => getRequest<User[]>(uri),
                '/users',
                'Fetches all users on the system',
            ),
        },

        id: {
            // users/{id}
            this: {
                get: bind(
                    (uri: string, userID: string) => getRequest<User>(uri, { userID }),
                    '/users/{userID}',
                    'Fetches this individual user',
                ),
            },
        },
    },
};

type AugmentedRequired<T extends object,
    K extends keyof T = keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type EventPropertyChangeResponse = {
    id: string,
    occurred: number,
    change: string,
    user?: User,
};

// region Comments

export type CommentResponse = {
    id: string,
    posted: number,
    poster: User,
    topic: TopicResponse,
} & CommentUpdate;

export type CommentUpdate = {
    content: string,
    topic?: string,
};

// endregion

// region Ents State
export type EntsStateUpdate = Partial<{
    name: string,
    color: string,
    icon: string,
}>;

export type EntsStateCreation = Required<EntsStateUpdate>;

export type EntsStateResponse = EntsStateCreation & {
    id: string,
};

// endregion

// region Events

export type EventUpdate = Partial<{
    name: string,
    startDate: number,
    endDate: number,
}>;

export type EventCreation = Required<EventUpdate>;

export type EventResponse = EventCreation & {
    id: string,
};

// endregion

// region Files

export type FileUpdate = Partial<{
    name: string,
    private: boolean,
}>;

export type FileCreation = Required<FileUpdate>;

export type FileResponse = FileCreation & {
    id: string,
    filename: string,
    created: number,
    author: User,
    size: number,
    downloadURL: string,
};

// endregion

// region Signups

export type SignupUpdate = Partial<{
    name: string,
    role: string,
}>

export type SignupCreation = Required<SignupUpdate> & {
    userID: string,
};

export type SignupResponse = SignupCreation & {
    id: string,
    user: User,
    date: number,
}

// endregion

// region States

export type StateUpdate = Partial<{
    name: string,
    icon: string,
    color: string,
}>;

export type StateCreation = AugmentedRequired<StateUpdate, 'name'>;

export type StateResponse = Required<StateCreation> & {
    id: string,
};

// endregion

// region Topic

export type TopicUpdate = Partial<{
    name: string,
    description: string,
    color: string,
    icon: string,
}>;

export type TopicCreation = AugmentedRequired<TopicUpdate, 'name'>;

export type TopicResponse = Required<TopicCreation> & {
    id: string,
};

// endregion

export type User = {
    name: string,
    username: string,
    profile?: string,
    id: string,
}
