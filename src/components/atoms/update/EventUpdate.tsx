import React from 'react';

import './EventUpdate.scss';

// export type EventUpdateProps = {
//     update: EventPropertyChangeResponse,
// };
//
// const generateComponent = (icon: IconDefinition, description: ReactNode, occurred: number, iconColor?: string) => ([
//     <div className="bar" />,
//     <div className="icon" style={{ backgroundColor: iconColor }}>
//         <FontAwesomeIcon icon={icon} color={iconColor ? ColorUtilities.determineForegroundColor(iconColor) : 'black'} />
//     </div>,
//     <div className="description">
//         {description}
//     </div>,
//     <div className="time">
//         <ReactTimeAgo date={occurred * 1000} />
//     </div>,
// ]);
//
// function generateUnknownChange(update: EventPropertyChangeResponse) {
//     return generateComponent(
//         faQuestionCircle,
//         `A change was made by ${update.user?.name ?? 'an unknown user'} but the type is not supported
//         by your client`,
//         update.occurred,
//     );
// }
//
// function generateVenueChange(update: EventPropertyChangeResponse, change: any) {
//     if (!Object.prototype.hasOwnProperty.call(change, 'value') || !VenueResponseZod.check(change.value)) {
//         return generateComponent(
//             faBuilding,
//             `The venue was changed by ${update.user?.name ?? 'an unknown user'} but the new venue is unknown`,
//             update.occurred,
//         );
//     }
//
//     const value = change.value as VenueResponse;
//
//     return generateComponent(
//         faBuilding,
//         [
//             <div className="text">
//                 The venue was changed by&nbsp;
//                 {update.user?.name ?? 'an unknown user'}
//                 &nbsp;to
//             </div>,
//             <div className="venue">{value.name}</div>,
//         ],
//         update.occurred,
//         value.color,
//     );
// }
//
// function generateStateChange(update: EventPropertyChangeResponse, change: any) {
//     if (!Object.prototype.hasOwnProperty.call(change, 'value') || !StateResponseZod.check(change.value)) {
//         return generateComponent(
//             faBuilding,
//             `The state was changed by ${update.user?.name ?? 'an unknown user'} but the new state is unknown`,
//             update.occurred,
//         );
//     }
//
//     const value = change.value as StateResponse;
//
//     return generateComponent(
//         faTag,
//         [
//             <div className="text">
//                 The state was changed by&nbsp;
//                 {update.user?.name ?? 'an unknown user'}
//                 &nbsp;to
//             </div>,
//             <div className="state">{value.name}</div>,
//         ],
//         update.occurred,
//         value.color,
//     );
// }
//
// function generateEntsChange(update: EventPropertyChangeResponse, change: any) {
//     if (!Object.prototype.hasOwnProperty.call(change, 'value') || !EntsStateResponseZod.check(change.value)) {
//         return generateComponent(
//             faBuilding,
//             `The ents state was changed by ${update.user?.name ?? 'an unknown user'} but the new state is unknown`,
//             update.occurred,
//         );
//     }
//
//     const value = change.value as EntsStateResponse;
//
//     return generateComponent(
//         faBolt,
//         [
//             <div className="text">
//                 The ents state was changed by&nbsp;
//                 {update.user?.name ?? 'an unknown user'}
//                 &nbsp;to
//             </div>,
//             <div className="ents">{value.name}</div>,
//         ],
//         update.occurred,
//         value.color,
//     );
// }
//
// function generateContent(update: EventPropertyChangeResponse) {
//     try {
//         const change = JSON.parse(update.change);
//
//         if (!Object.prototype.hasOwnProperty.call(change, 'type')) return undefined;
//
//         switch (change.type.toLowerCase()) {
//             case 'venue':
//                 return generateVenueChange(update, change);
//             case 'state':
//                 return generateStateChange(update, change);
//             case 'ents':
//                 return generateEntsChange(update, change);
//             default:
//                 return generateUnknownChange(update);
//
//         }
//     } catch (_) {
//         return generateUnknownChange(update);
//     }
// }
//
// export const EventUpdate: React.FunctionComponent<EventUpdateProps> = ({ update }) => (
//     <div className="event-update">
//         {generateContent(update)}
//     </div>
// );

// TODO: implement this
export const EventUpdate: React.FunctionComponent<any> = () => (
	<div className="event-update">This has gone missing :(</div>
);
