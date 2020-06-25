import * as React from 'react';
import {
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
    faTablet,
} from '@fortawesome/free-solid-svg-icons';
import { IconBox } from '../../components/atoms/icon-box/IconBox';

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
            </div>
        );

    }

}
