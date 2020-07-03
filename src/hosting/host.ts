import express, { Request, Response } from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import * as path from 'path';
import passport from 'passport';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import CookieStrategy from 'passport-cookie';
import cookieParser from 'cookie-parser';

// @ts-ignore
const app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false,
}));
app.use(cookieParser());

// TODO, Authentication
passport.use(new BearerStrategy(
    (token, done) => done(null, 1),
));
passport.use(new CookieStrategy(
    (token, done) => done(null, 1),
));

const standardAuthMiddleware = passport.authenticate(
    ['bearer', 'cookie'],
    {
        session: false,
        // eslint-disable-next-line global-require,import/no-dynamic-require
        failureRedirect: require(path.join(__dirname, '..', 'config.js')).authUri,
    },
);

app.use((req, res, next) => {
    // @ts-ignore
    req.cookies.token = 'hi';
    next();
});

// App must be authenticated
app.use(standardAuthMiddleware, express.static(path.join(__dirname, '..', 'public')));
app.get('*', standardAuthMiddleware, (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`App listening on ${process.env.PORT || 3000}`);
});
