import  '../static/default-text-formats';

type ReplaceFormatNamesWithOverride = {
	[K in keyof DefineCustomEditorFormats]: `override-${K}` extends keyof DefineCustomEditorFormats
		? `override-${K}` : K
}[keyof DefineCustomEditorFormats]

type EditorFormatsWithOverride = {
	[K in ReplaceFormatNamesWithOverride]: DefineCustomEditorFormats[K]
};

type ReplaceOverrideKeys<T> = {
	[K in keyof T as K extends `override-${infer Rest}` ? Rest : K]: T[K];
};

export type AllEditorFormats = ReplaceOverrideKeys<EditorFormatsWithOverride>;
