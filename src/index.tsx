// eslint-disable-next-line import/no-extraneous-dependencies
import JavascriptTimeAgo from 'javascript-time-ago';
// eslint-disable-next-line import/no-extraneous-dependencies
import en from 'javascript-time-ago/locale/en.json';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'flatpickr/dist/themes/material_green.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

import { v4 } from 'uuid';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
	GlobalContext,
	GlobalContextType,
	ReadableContextType,
} from './context/GlobalContext';
import {
	Notification,
	NotificationRenderer,
	processNotifications,
} from './components/components/notification-renderer/NotificationRenderer';
import { NotificationContext } from './context/NotificationContext';
import { CreateEvent } from './pages/events/create/CreateEvent';
import { CreateVenue } from './pages/venues/create/CreateVenue';
import { CreateTopic } from './pages/topic/create/CreateTopic';
import { CreateState } from './pages/state/create/CreateState';
import { CreateEnts } from './pages/ents/create/CreateEnts';
import { CreateFile } from './pages/file/create/CreateFile';
import { ViewVenue } from './pages/venues/view/ViewVenue';
import { ViewTopic } from './pages/topic/view/ViewTopic';
import { ViewState } from './pages/state/view/ViewState';
import { ViewEnts } from './pages/ents/view/ViewEnts';
import { ListVenue } from './pages/venues/list/ListVenue';
import { ListTopic } from './pages/topic/list/ListTopic';
import { ListState } from './pages/state/list/ListState';
import { ListEnt } from './pages/ents/list/ListEnt';
import App from './pages/App';
import { Events } from './pages/events/list/Events';
import Event from './pages/events/view/Event';
import { OpsPlanning } from './pages/workflows/ops-planning/OpsPlanning';

import 'react-dates/initialize';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import './pages/index/index.scss';
import './pages/index/flexboxgrid.css';
import { ListFile } from './pages/file/list/ListFile';
import { ViewFile } from './pages/file/view/ViewFile';
import Axios from 'axios';
import Sidebar from './components/components/sidebar/Sidebar';
import { EVENT_VIEW } from './utilities/Routes';
import apiInstance, { User } from './utilities/APIPackageGen';
import axios from 'axios';

// Register EN locale for time ago components
JavascriptTimeAgo.addLocale(en);

// Set moment rounding thresholds to get more useful relative times
moment.relativeTimeThreshold('s', 60);
moment.relativeTimeThreshold('m', 60);
moment.relativeTimeThreshold('h', 24);
moment.relativeTimeThreshold('d', 31);
moment.relativeTimeThreshold('M', 12);
moment.relativeTimeThreshold('y', 365);

// region TODO: HACK: This adds EVERY font awesome icon to the library. Not sure if there is a better way to do this?
const iconList = Object.keys(Icons)
	.filter((key) => key !== 'fas' && key !== 'prefix')
	// @ts-ignore
	.map((icon) => Icons[icon]);

library.add(...iconList);
// endregion HACK END

type RootSiteState = {
	notifications: Notification[];
	timeouts: { [key: string]: number };
	animationStates: { [key: string]: string };
};

class RootSite extends React.Component<
	{},
	RootSiteState & ReadableContextType
> {
	constructor(props: Readonly<{}>) {
		super(props);

		this.state = {
			notifications: [],
			timeouts: {},
			animationStates: {},
		};
	}

	componentDidMount() {
		// @ts-ignore
		window.API = apiInstance;
		// @ts-ignore
		window.axios = axios;

		// When the site mounts we need to fetch information about the user
		apiInstance
			.whoami()
			.get()
			.then((data) => {
				// if(data.result.isAdmin) roles.push('admin');
				// if(data.result.isOps) roles.push('ops');
				// if(data.result.isEnts) roles.push('ents');

				this.setUser({
					username: data.username,
					id: data.username,
					name: data.name,
					profile: data.profile,
					roles: [], //roles, TODO: where did role support go
				});
			})
			.catch((err) => {
				console.error('Failed to fetch user information', err);
				this.showNotification('Failed to fetch your user information');
			});

		apiInstance
			.features()
			.get()
			.then((data) => {
				this.setState((o) => ({ ...o, features: data }));
			})
			.catch((err) => {
				console.error('Failed to fetch feature information', err);
				this.showNotification('Failed to fetch feature information!');
				this.setState((o) => ({
					...o,
					features: { ops: false, equipment: false },
				}));
			});
	}

	componentWillUnmount() {
		Object.values(this.state.timeouts).map(clearTimeout);
	}

	private setUser = (user?: User & { roles: string[] }) => {
		this.setState((oldState) => ({
			...oldState,
			user,
		}));
	};

	private clearNotifications = () => {
		const size = this.state.notifications.length;

		this.setState((oldState) => ({
			...oldState,
			notifications: [],
		}));

		Object.values(this.state.timeouts).map(clearTimeout);

		return size;
	};

	private clearNotification = (id: string, skipTimeout: boolean = false) => {
		const newNotifications = this.state.notifications.filter(
			(e) => e.id !== id
		);

		if (newNotifications.length === this.state.notifications.length) {
			return false;
		}

		if (
			!skipTimeout &&
			Object.prototype.hasOwnProperty.call(this.state.timeouts, id)
		) {
			clearTimeout(this.state.timeouts[id]);
		}

		this.setState((oldState) => ({
			...oldState,
			notifications: [...newNotifications],
		}));

		return true;
	};

	private showNotification = (
		title: string,
		content?: string,
		icon?: IconDefinition,
		color?: string,
		action?: Notification['action']
	) => {
		const id = v4();

		this.setState((oldState) => {
			const newState = {
				...oldState,
				notifications: oldState.notifications.concat([
					{
						id,
						title,
						content,
						icon,
						color,
						action,
					},
				]),
			};

			// @ts-ignore
			newState.timeouts[id] = setTimeout(() => {
				this.setState((prevState) => {
					const newStates = { ...prevState };

					// Add the leaving state
					newStates.animationStates[id] = 'leaving';

					// Schedule it to be removed in 1 1/2 second once the animation is done
					// @ts-ignore
					newStates.timeouts[id] = setTimeout(() => {
						this.clearNotification(id, true);
					}, 1500);

					return newStates;
				});
			}, 5000);

			return newState;
		});

		return id;
	};

	render() {
		const providedContext = {
			user: {
				value: this.state.user,
				set: this.setUser,
			},
			features: {
				value: this.state.features,
				set: (v) => this.setState((o) => ({ ...o, features: v })),
			},
		} as GlobalContextType;

		return (
			<React.StrictMode>
				<GlobalContext.Provider value={providedContext}>
					<NotificationContext.Provider
						value={{
							clearNotifications: this.clearNotifications,
							clearNotification: this.clearNotification,
							showNotification: this.showNotification,
						}}
					>
						<BrowserRouter>
							<NotificationRenderer
								position="top-right"
								notifications={processNotifications(
									this.state.notifications,
									this.state.animationStates
								)}
							/>
							<Sidebar />

							<div className="sidebar-spacer" />

							<div className="content">
								<Switch>
									<Route path="/files/create" exact>
										<CreateFile isPage />
									</Route>
									<Route path="/files/:id" exact>
										<ViewFile />
									</Route>
									<Route path="/files" exact>
										<ListFile />
									</Route>

									<Route path="/ents/create" exact>
										<CreateEnts isPage />
									</Route>
									<Route path="/ents/:id" exact>
										<ViewEnts />
									</Route>
									<Route path="/ents" exact>
										<ListEnt />
									</Route>

									<Route path="/states/create" exact>
										<CreateState isPage />
									</Route>
									<Route path="/states/:id" exact>
										<ViewState />
									</Route>
									<Route path="/states" exact>
										<ListState />
									</Route>

									<Route path="/topics/create" exact>
										<CreateTopic isPage />
									</Route>
									<Route path="/topics/:id" exact>
										<ViewTopic />
									</Route>
									<Route path="/topics" exact>
										<ListTopic />
									</Route>

									<Route path="/venues/create" exact>
										<CreateVenue isPage />
									</Route>
									<Route path="/venues/:id" exact>
										<ViewVenue />
									</Route>
									<Route path="/venues" exact>
										<ListVenue />
									</Route>

									<Route path="/events/create" exact>
										<CreateEvent isPage />
									</Route>
									<Route path={EVENT_VIEW.string} exact>
										<Event />
									</Route>
									<Route path="/events" exact>
										<Events />
									</Route>

									{this.state.features?.equipment ? (
										<Route path="/workflow/ops" exact>
											<OpsPlanning />
										</Route>
									) : undefined}

									<Route path="/testing-shit" exact>
										<div style={{ height: '100vh', display: 'flex' }}>
											{/*<FormElement detail={'some details'} prompt={'some prompt'}*/}
											{/*             required={true}/>*/}
											{/*<FormDemo/>*/}
											{/*<AutomationEditor/>*/}
											{/*<Checkbox*/}
											{/*    required*/}
											{/*    prompt='This is a checkbox prompt'*/}
											{/*    detail='There is a very small detail line which is shown underneath the prompt'*/}
											{/*    type='checkbox'*/}
											{/*/>*/}
											{/*<TextPart*/}
											{/*    required*/}
											{/*    prompt='This is a text field prompt'*/}
											{/*    detail='There is a very small detail line which is shown underneath the prompt'*/}
											{/*    type='text'*/}
											{/*/>*/}
											{/*<TextPart*/}
											{/*    required*/}
											{/*    area*/}
											{/*    prompt='This is a text area prompt'*/}
											{/*    detail='There is a very small detail line which is shown underneath the prompt'*/}
											{/*    type='text'*/}
											{/*/>*/}
											{/*<NumberPart*/}
											{/*    required*/}
											{/*    prompt='This is a numerical prompt'*/}
											{/*    detail='There is a very small detail line which is shown underneath the prompt'*/}
											{/*    type='number'*/}
											{/*/>*/}
											{/*<SelectPart*/}
											{/*    required*/}
											{/*    prompt='This is a select prompt'*/}
											{/*    detail='There is a very small detail line which is shown underneath the prompt'*/}
											{/*    type='select'*/}
											{/*    options={[*/}
											{/*        'a',*/}
											{/*        'b',*/}
											{/*        'c'*/}
											{/*    ]}*/}
											{/*/>*/}
											{/*<DatePart*/}
											{/*    required*/}
											{/*    prompt='This is a single date prompt prompt'*/}
											{/*    detail='There is a very small detail line which is shown underneath the prompt'*/}
											{/*    type='date'*/}
											{/*/>*/}
											{/*<DateRangePart*/}
											{/*    required*/}
											{/*    prompt='This is a date range prompt prompt'*/}
											{/*    detail='There is a very small detail line which is shown underneath the prompt'*/}
											{/*    type='date-range'*/}
											{/*/>*/}
										</div>
									</Route>

									<Route path="/" exact>
										<App />
									</Route>
								</Switch>
							</div>
						</BrowserRouter>
					</NotificationContext.Provider>
				</GlobalContext.Provider>
			</React.StrictMode>
		);
	}
}

ReactDOM.render(<RootSite />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
