import * as zod from 'zod';

export const VersionValidator = zod.object({
	_meta: zod.object({
		editorVersion: zod.number(),
	}),
});
export type Version = zod.infer<typeof VersionValidator>;

export const StoredAutomationValidator = VersionValidator.augment({
	_meta: zod.object({
		editorVersion: zod.literal(0),
	}),
}).extend({
	nodes: zod.array(
		zod.object({
			width: zod.number().or(zod.null()).optional(),
			height: zod.number().or(zod.null()).optional(),
			id: zod.string(),
			type: zod.string().optional(),
			position: zod.object({
				x: zod.number(),
				y: zod.number(),
			}),
			positionAbsolute: zod
				.object({
					x: zod.number(),
					y: zod.number(),
				})
				.optional(),
			data: zod.object({}),
			selected: zod.boolean().optional(),
			dragging: zod.boolean().optional(),
		})
	),
	edges: zod.array(
		zod.object({
			animated: zod.boolean().optional(),
			type: zod.string().optional(),
			source: zod.string(),
			target: zod.string(),
			sourceHandle: zod.string().or(zod.null()).optional(),
			targetHandle: zod.string().or(zod.null()).optional(),
			id: zod.string(),
			label: zod.string(),
		})
	),
	viewport: zod.object({
		x: zod.number(),
		y: zod.number(),
		zoom: zod.number(),
	}),
	state: zod.record(zod.any()),
});
export type StoredAutomation = zod.infer<typeof StoredAutomationValidator>;

export type AllHistoricalAutomationTypes = StoredAutomation;
export function migrateToLatest(
	automation: AllHistoricalAutomationTypes
): StoredAutomation {
	switch (automation._meta.editorVersion) {
		case 0:
			return automation;
	}
}
