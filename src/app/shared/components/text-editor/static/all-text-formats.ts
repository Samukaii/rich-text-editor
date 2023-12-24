import { EditorFormat } from "../models/editor.format";

export const allTextFormats = [
	{
		name: "bold",
		nodeName: "STRONG",
	},
	{
		name: "italic",
		nodeName: "EM",
	},
	{
		name: "strikethrough",
		nodeName: "S",
	},
	{
		name: "underlined",
		nodeName: "U",
	},
	{
		name: "align:left",
		classes: "align left",
		nodeName: "div",
	},
	{
		name: "align:center",
		classes: "align center",
		nodeName: "div",
	},
	{
		name: "align:right",
		classes: "align right",
		nodeName: "div",
	},
	{
		name: "align:justify",
		classes: "align justify",
		nodeName: "div",
	},
	{
		name: "heading:normal",
		nodeName: "h1",
	},
	{
		name: "heading:1",
		nodeName: "h1",
	},
	{
		name: "heading:2",
		nodeName: "h2",
	},
	{
		name: "heading:3",
		nodeName: "h3",
	},
	{
		name: "color:red",
		nodeName: "SPAN",
		classes: "color red",
	},
	{
		name: "color:blue",
		nodeName: "SPAN",
		classes: "color blue",
	},
	{
		name: "color:green",
		nodeName: "SPAN",
		classes: "color green",
	},
	{
		name: "color:purple",
		nodeName: "SPAN",
		classes: "color purple",
	},
	{
		name: "color:indigo",
		nodeName: "SPAN",
		classes: "color indigo",
	},
	{
		name: "color:cyan",
		nodeName: "SPAN",
		classes: "color cyan",
	},
	{
		name: "color:orange",
		nodeName: "SPAN",
		classes: "color orange",
	},
	{
		name: "color:blueviolet",
		nodeName: "SPAN",
		classes: "color blueviolet",
	},
	{
		name: "color:normal",
		nodeName: "SPAN",
	},
	{
		name: "background-color:red",
		nodeName: "DIV",
		classes: "background-color red",
	},
	{
		name: "background-color:blue",
		nodeName: "DIV",
		classes: "background-color blue",
	},
	{
		name: "background-color:green",
		nodeName: "DIV",
		classes: "background-color green",
	},
	{
		name: "background-color:purple",
		nodeName: "DIV",
		classes: "background-color purple",
	},
	{
		name: "background-color:indigo",
		nodeName: "DIV",
		classes: "background-color indigo",
	},
	{
		name: "background-color:cyan",
		nodeName: "DIV",
		classes: "background-color cyan",
	},
	{
		name: "background-color:orange",
		nodeName: "DIV",
		classes: "background-color orange",
	},
	{
		name: "background-color:blueviolet",
		nodeName: "DIV",
		classes: "background-color blueviolet",
	},
	{
		name: "background-color:normal",
		nodeName: "DIV",
	},
] as const satisfies Readonly<EditorFormat[]>;
