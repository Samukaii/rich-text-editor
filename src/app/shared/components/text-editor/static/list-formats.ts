import { CustomFormat } from "../models/custom-format";


const bullets: CustomFormat<"list:bullets"> = {
	name: "list:bullets",
	nodeName: "ul",
	formatStrategy: 'insert-in-new-line',
	modifier: (element) => {
		const li = document.createElement('li');

		li.appendChild(document.createTextNode(' '));

		element.appendChild(li);
	}
};

const ordered: CustomFormat<"list:ordered"> = {
	name: "list:ordered",
	nodeName: "ol",
	formatStrategy: 'insert-in-new-line',
	modifier: (element) => {
		const li = document.createElement('li');

		li.appendChild(document.createTextNode(' '));

		element.appendChild(li);
	}
}


export const listFormats = [bullets, ordered];
