import React from 'react';
import { FeatureConfig, User } from '../utilities/APIPackageGen';

export type ReadableContextType = {
	user?: User;
	features?: FeatureConfig;
};

export type GlobalContextType = {
	user: {
		value?: User;
		set: (value?: User) => void;
	};
	features: {
		value?: FeatureConfig;
		set: (value?: FeatureConfig) => void;
	};
};

export const defaultValue: GlobalContextType = {
	user: {
		set: () => {
			throw new Error('Context is not initialised!');
		},
	},
	features: {
		set: () => {
			throw new Error('Context is not initialised!');
		},
	},
};

export const GlobalContext = React.createContext(defaultValue);
