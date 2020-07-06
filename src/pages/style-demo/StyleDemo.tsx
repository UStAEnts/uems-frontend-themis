/* eslint-disable */
import * as React from 'react';
import {
    faAddressCard,
    faAdjust,
    faAppleAlt,
    faBookDead,
    faCoffee,
    faDiceFive,
    faEnvelope,
    faFighterJet,
    faGlassCheers,
    faHandPeace,
    faImage,
    faJedi,
    faKaaba,
    faLandmark,
    faMagic,
    faNetworkWired,
    faOtter,
    faPaintRoller,
    faQrcode,
    faRadiationAlt,
    faSadCry,
    faSignInAlt,
    faTablet,
} from '@fortawesome/free-solid-svg-icons';
import { IconBox } from '../../components/atoms/icon-box/IconBox';
import { ProgressBar } from '../../components/atoms/progress-bar/ProgressBar';
import { TaskMeter } from '../../components/components/task-meter/TaskMeter';
import { Button } from '../../components/atoms/button/Button';
import { TextField } from '../../components/atoms/text-field/TextField';
import { Select } from '../../components/atoms/select/Select';
import { EventCard } from '../../components/atoms/event-card/EventCard';
import { Calendar } from '../../components/components/calendar/Calendar';
import { Comment } from '../../components/atoms/comment/Comment';
import { CommentBox } from '../../components/atoms/comment-box/CommentBox';
import { CommentList } from '../../components/components/comment-list/CommentList';

export type StyleDemoPropsType = {};

export type StyleDemoStateType = {};

export const events = [
    {
        name: 'Jesus, Gandhi and Dan',
        venue: "Sandy's",
        bookingStart: new Date(2020, 5, 24, 3, 0),
        bookingEnd: new Date(2020, 5, 24, 15, 0),
        attendance: 230,
        entsStatus: { name: 'singup' },
    },
    {
        name: 'Gems for Jesus',
        venue: "Sandy's",
        bookingStart: new Date(2020, 5, 28, 16, 30),
        bookingEnd: new Date(2020, 5, 29, 2, 30),
        attendance: 262,
        entsStatus: { name: 'waiting' },
    },
    {
        name: 'Extinction Distinction',
        venue: 'StAge',
        bookingStart: new Date(2020, 5, 24, 14, 0),
        bookingEnd: new Date(2020, 5, 24, 22, 0),
        attendance: 3,
        entsStatus: { name: 'undefined' },
        state: {
            state: 'ready',
            color: '#B53471',
        },
    },
    {
        name: 'Jimmy Buffet’s Granola Fantasy Canteen',
        venue: 'undefined',
        bookingStart: new Date(2020, 5, 29, 11, 0),
        bookingEnd: new Date(2020, 5, 29, 15, 0),
        attendance: 395,
        entsStatus: { name: 'undefined' },
    },
    {
        name: 'Fork in the Roadkill',
        venue: "Sandy's",
        bookingStart: new Date(2020, 5, 28, 14, 0),
        bookingEnd: new Date(2020, 5, 28, 19, 0),
        attendance: 278,
        entsStatus: { name: 'ready' },
        state: {
            state: 'waiting',
            color: '#F79F1F',
        },
    },
    {
        name: 'Dawn of the Dead Festival',
        venue: '601+Stage',
        bookingStart: new Date(2020, 5, 28, 10, 0),
        bookingEnd: new Date(2020, 5, 28, 18, 0),
        attendance: 410,
        entsStatus: { name: 'unknown' },
    },
    {
        name: 'Lambastica',
        venue: "Sandy's",
        bookingStart: new Date(2020, 5, 25, 21, 0),
        bookingEnd: new Date(2020, 5, 26, 0, 0),
        attendance: 568,
        entsStatus: { name: 'unknown' },
    },
    {
        name: 'Cubicide',
        venue: 'undefined',
        bookingStart: new Date(2020, 5, 24, 4, 30),
        bookingEnd: new Date(2020, 5, 24, 7, 30),
        attendance: 329,
        entsStatus: { name: 'ready' },
    },
    {
        name: 'GeekSeek',
        venue: 'StAge',
        bookingStart: new Date(2020, 5, 27, 5, 30),
        bookingEnd: new Date(2020, 5, 27, 7, 30),
        attendance: 280,
        entsStatus: { name: 'waiting' },
        state: {
            state: 'cancelled',
            color: '#EA2027',
        },
    },
    {
        name: 'Bébé Boom',
        venue: '601+Stage',
        bookingStart: new Date(2020, 5, 25, 20, 0),
        bookingEnd: new Date(2020, 5, 25, 23, 0),
        attendance: 263,
        entsStatus: { name: 'unknown' },
    },
];

// eslint-disable-next-line react/prefer-stateless-function
export class StyleDemo extends React.Component<StyleDemoPropsType, StyleDemoStateType> {

    render() {

        return (
            <div style={{ padding: '30px' }}>
                <h1>Component Demos</h1>
                <h2>Icon Boxes</h2>
                <hr />
                <div>
                    <IconBox icon={faAppleAlt} color="#FFC312" />
                    <IconBox icon={faBookDead} color="#C4E538" />
                    <IconBox icon={faCoffee} color="#12CBC4" />
                    <IconBox icon={faDiceFive} color="#FDA7DF" />
                    <IconBox icon={faEnvelope} color="#ED4C67" />
                    <br />
                    <IconBox icon={faFighterJet} color="#F79F1F" />
                    <IconBox icon={faGlassCheers} color="#A3CB38" />
                    <IconBox icon={faHandPeace} color="#1289A7" />
                    <IconBox icon={faImage} color="#D980FA" />
                    <IconBox icon={faJedi} color="#B53471" />
                    <br />
                    <IconBox icon={faKaaba} color="#EE5A24" />
                    <IconBox icon={faLandmark} color="#009432" />
                    <IconBox icon={faMagic} color="#0652DD" />
                    <IconBox icon={faNetworkWired} color="#9980FA" />
                    <IconBox icon={faOtter} color="#833471" />
                    <br />
                    <IconBox icon={faPaintRoller} color="#EA2027" />
                    <IconBox icon={faQrcode} color="#006266" />
                    <IconBox icon={faRadiationAlt} color="#1B1464" />
                    <IconBox icon={faSadCry} color="#5758BB" />
                    <IconBox icon={faTablet} color="#6F1E51" />
                </div>
                <h2>Progress Bars</h2>
                <hr />
                <h3>Solo Bar</h3>
                <div>
                    <ProgressBar />
                    <ProgressBar value={25} />
                    <ProgressBar value={50} />
                    <ProgressBar value={75} />
                    <ProgressBar value={100} />
                </div>
                <h3>Task Meters</h3>
                <div>
                    <div className="row">
                        <div className="col-xs-6">
                            <TaskMeter taskName="Rethink the framework" />
                            <TaskMeter
                                taskName="Bring out the richness of materials"
                                value={25}
                                displayType="fraction"
                                float
                            />
                            <TaskMeter
                                taskName={"Update the numbers using the latest quarterly financial's"}
                                value={50}
                            />
                            <TaskMeter
                                taskName="Make sure the numbers are appropriately caveated"
                                value={75}
                                displayType="fraction"
                                float
                            />
                            <TaskMeter taskName="Schedule a review call with all the partners" value={100} />
                        </div>
                        <div className="col-xs-6">
                            <TaskMeter taskName="Rethink the framework" float />
                            <TaskMeter
                                taskName="Bring out the richness of materials"
                                value={25}
                                displayType="fraction"
                            />
                            <TaskMeter
                                taskName={"Update the numbers using the latest quarterly financial's"}
                                value={50}
                                float
                            />
                            <TaskMeter
                                taskName="Make sure the numbers are appropriately caveated"
                                value={75}
                                displayType="fraction"
                            />
                            <TaskMeter taskName="Schedule a review call with all the partners" value={100} float />
                        </div>
                    </div>
                </div>
                <h2>Buttons</h2>
                <hr />
                <div>
                    <Button text="Submit" icon={faAddressCard} color="#1289A7" />
                    <Button text="Submit" color="#0652DD" />
                    <Button text="Submit" icon={faAdjust} includeArrow color="#1B1464" />
                    <Button text="Submit" color="#ED4C67" />
                    <br />
                    <span style={{ padding: '1px 0', display: 'inline-block' }} />
                    <br />
                    <Button text="Submit" icon={faAddressCard} color="#B53471" />
                    <Button text="Submit" icon={faAdjust} includeArrow color="#833471" />
                    <Button text="Submit" includeArrow color="#6F1E51" />
                </div>
                <h2>Forms</h2>
                <div>
                    <div className="row">
                        <div className="col-xs-6">
                            <TextField name="Username" />
                            <TextField name="Password" type="password" required />
                            <TextField name="Email Address" type="text" />
                            <TextField name="Salary" type="number" />
                            <Button text="Join" icon={faSignInAlt} fullWidth color="#D980FA" />
                        </div>
                        <div className="col-xs-6">
                            <Select placeholder="Placeholder" name="select" options={['a', 'b', 'c']} />
                            <TextField name="Salary" type="textarea" />
                            <TextField name="Salary" type="textarea" required />
                        </div>
                    </div>
                </div>
                <h2>Event Cards</h2>
                <div>
                    <div className="row">
                        <div className="col-xs-4">
                            <EventCard event={{
                                name: 'Some random event',
                                venue: '601',
                                bookingStart: new Date(2020, 5, 22, 22, 0),
                                bookingEnd: new Date(2020, 5, 23, 2, 0),
                                attendance: 500,
                                entsStatus: {
                                    name: 'signup',
                                },
                            }}
                            />
                        </div>
                        <div className="col-xs-4">
                            <EventCard event={{
                                name: 'Some random event',
                                venue: '601',
                                bookingStart: new Date(2020, 5, 22, 9, 0),
                                bookingEnd: new Date(2020, 5, 23, 2, 0),
                                attendance: 500,
                                entsStatus: { name: 'signup' },
                            }}
                            />
                        </div>
                        <div className="col-xs-4">
                            <EventCard event={{
                                name: 'Some random event',
                                venue: '601',
                                bookingStart: new Date(2020, 5, 22, 9, 0),
                                bookingEnd: new Date(2020, 5, 23, 2, 0),
                                attendance: 500,
                            }}
                            />
                        </div>
                    </div>
                    <div className="row" style={{ marginTop: '20px' }}>
                        <div className="col-xs-3">
                            <EventCard
                                event={{
                                    name: 'Some random event',
                                    venue: '601',
                                    bookingStart: new Date(2020, 5, 22, 22, 0),
                                    bookingEnd: new Date(2020, 5, 23, 2, 0),
                                    attendance: 500,
                                    entsStatus: { name: 'signup' },
                                }}
                                collapsed
                            />
                        </div>
                        <div className="col-xs-3">
                            <EventCard
                                event={{
                                    name: 'Some random event',
                                    venue: '601',
                                    bookingStart: new Date(2020, 5, 22, 9, 0),
                                    bookingEnd: new Date(2020, 5, 23, 2, 0),
                                    attendance: 500,
                                    entsStatus: { name: 'signup' },
                                }}
                                collapsed
                            />
                        </div>
                        <div className="col-xs-3">
                            <EventCard
                                event={{
                                    name: 'Some random event',
                                    venue: '601',
                                    bookingStart: new Date(2020, 5, 22, 9, 0),
                                    bookingEnd: new Date(2020, 5, 23, 2, 0),
                                    attendance: 500,
                                    entsStatus: { name: 'ready' },
                                }}
                                collapsed
                            />
                        </div>
                        <div className="col-xs-3">
                            <EventCard
                                event={{
                                    name: 'Some random event',
                                    venue: '601',
                                    bookingStart: new Date(2020, 5, 22, 9, 0),
                                    bookingEnd: new Date(2020, 5, 23, 2, 0),
                                    attendance: 500,
                                    entsStatus: { name: 'ready' },
                                }}
                                collapsed
                            />
                        </div>
                    </div>
                </div>
                <h2>Calendar</h2>
                <div>
                    <Calendar events={events} />
                </div>
                <h2>Comments</h2>
                <div>
                    <div className="row">
                        <div className="col-xs-4">
                            <Comment
                                comment={{
                                    posted: new Date(),
                                    content: 'Some data',
                                    poster: {
                                        username: 'pers',
                                        name: 'Person',
                                    },
                                    type: {
                                        name: 'ents',
                                    },
                                }}
                            />
                        </div>
                        <div className="col-xs-4">
                            <Comment
                                comment={{
                                    posted: new Date(),
                                    content: `#Lorem ipsum dolor sit amet, \n **consectetur adipiscing** elit, sed do 
                                    eiusmod tempor incididunt ut labore et dolore magna aliqua. Aliquet lectus proin 
                                    nibh nisl condimentum id venenatis. Feugiat sed lectus vestibulum mattis ullamcorper
                                    velit sed ullamcorper. Scelerisque in dictum non consectetur a erat. Aliquet enim 
                                    tortor at auctor urna nunc id. Maecenas sed enim ut sem. Interdum varius sit amet 
                                    mattis vulputate enim nulla aliquet porttitor. Vulputate ut pharetra sit amet 
                                    aliquam id. Aliquam etiam erat velit scelerisque in dictum non. Pellentesque 
                                    pulvinar pellentesque habitant morbi tristique. Est ante in nibh mauris cursus
                                    mattis molestie a. Egestas tellus rutrum tellus pellentesque eu tincidunt tortor. 
                                    Lacus luctus accumsan tortor posuere ac ut consequat. Suspendisse sed nisi lacus sed
                                    viverra tellus. Erat pellentesque adipiscing commodo elit at imperdiet dui accumsan 
                                    sit. Posuere sollicitudin aliquam ultrices sagittis orci a scelerisque.\n\nNullam 
                                    non nisi est sit amet facilisis. Arcu non odio euismod lacinia. Aenean pharetra 
                                    magna ac placerat vestibulum lectus mauris ultrices. Libero justo laoreet sit amet
                                     cursus sit amet dictum. Risus commodo viverra maecenas accumsan. Sagittis eu 
                                     volutpat odio facilisis mauris sit. Praesent elementum facilisis leo vel fringilla 
                                     est ullamcorper. Ut tortor pretium viverra suspendisse. Facilisis magna etiam 
                                     tempor orci. Dolor morbi non arcu risus quis varius quam quisque. Turpis massa 
                                     tincidunt dui ut ornare lectus sit. Leo urna molestie at elementum. Massa massa 
                                     ultricies mi quis hendrerit dolor magna eget est. Urna neque viverra justo nec. 
                                     Egestas fringilla phasellus faucibus scelerisque.`,
                                    poster: {
                                        username: 'pers',
                                        name: 'Person',
                                    },
                                    type: {
                                        name: 'ents',
                                    },
                                }}
                            />
                        </div>
                        <div className="col-xs-4">
                            <Comment
                                comment={{
                                    posted: new Date(),
                                    content: 'Some data',
                                    poster: {
                                        username: 'pers',
                                        name: 'Person',
                                    },
                                    type: {
                                        name: 'ents',
                                    },
                                }}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-6">
                            <Comment
                                comment={{
                                    posted: new Date(),
                                    content: 'Some data',
                                    poster: {
                                        username: 'pers',
                                        name: 'Person',
                                    },
                                    type: {
                                        name: 'ents',
                                    },
                                }}
                            />
                        </div>
                        <div className="col-xs-6">
                            <Comment
                                comment={{
                                    posted: new Date(),
                                    content: 'Some data',
                                    poster: {
                                        username: 'pers',
                                        name: 'Person',
                                    },
                                    type: {
                                        name: 'ents',
                                    },
                                }}
                            />
                        </div>
                    </div>
                    <CommentBox
                        contentClasses={[
                            {
                                name: 'ents',
                            },
                            {
                                name: 'ops planning',
                            },
                        ]}
                        submitCommentHandler={() => false}
                        poster={{
                            username: 'pers',
                            name: 'Person',
                        }}
                    />
                    <hr />
                    <CommentList
                        comments={[]}
                        poster={{
                            username: 'pers',
                            name: 'Person',
                        }}
                    />
                </div>
            </div>
        );

    }

}
