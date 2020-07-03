declare module 'passport-cookie' {

    import { VerifyFunction } from "passport-http-bearer";
    import { Strategy } from "passport";
    export type PassportCookieOption = {
        cookieName?: string,
        signed?: boolean,
        passReqToCallback?: boolean,
    };

    export default class CookieStrategy implements Strategy {

        constructor(handler: VerifyFunction);
        constructor(options: PassportCookieOption, handler: VerifyFunction);
        constructor(obj: PassportCookieOption|VerifyFunction, handler?: VerifyFunction);

        authenticate(req: e.Request, options?: any): any;
    }
}
