import { EditorFormat } from "../models/editor.format";


const bullets: EditorFormat<"list:bullets"> = {
	name: "list:bullets",
	nodeName: "ul",
	insertionStrategy: 'insert-in-new-line',
	modifier: (element) => {
		const li = document.createElement('li');

		li.appendChild(document.createTextNode(' '));

		element.appendChild(li);
	}
};

const ordered: EditorFormat<"list:ordered"> = {
	name: "list:ordered",
	nodeName: "ol",
	insertionStrategy: 'insert-in-new-line',
	modifier: (element) => {
		const li = document.createElement('li');

		li.appendChild(document.createTextNode(' '));

		element.appendChild(li);
	}
}


export const listFormats = [bullets, ordered];
