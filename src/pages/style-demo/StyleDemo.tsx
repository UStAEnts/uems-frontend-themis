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
    faSadCry, faSignInAlt,
    faTablet,
} from '@fortawesome/free-solid-svg-icons';
import { IconBox } from '../../components/atoms/icon-box/IconBox';
import { ProgressBar } from '../../components/atoms/progress-bar/ProgressBar';
import { TaskMeter } from '../../components/atoms/task-meter/TaskMeter';
import { Button } from '../../components/atoms/button/Button';
import { TextField } from '../../components/atoms/text-field/TextField';

export type StyleDemoPropsType = {};

export type StyleDemoStateType = {};

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
                            <TextField name="Salary" type="textarea" />
                            <TextField name="Salary" type="textarea" required />
                        </div>
                    </div>
                </div>
            </div>
        );

    }

}
