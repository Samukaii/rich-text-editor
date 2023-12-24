import { TestBed } from '@angular/core/testing';

import { TextFormatterService } from './text-formatter.service';
import { DOCUMENT } from "@angular/common";

describe('TextFormatterService', () => {
	let service: TextFormatterService;
	let document: Document;
	let range: Range;
	let editor: HTMLElement;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(TextFormatterService);
		document = TestBed.inject(DOCUMENT);
	});

	beforeEach(() => {
		document.body.innerHTML = `
			<div [contentEditable]="true" class="editor" id="text-editor" ></div>
		`;

		editor = document.getElementById("text-editor")!;

		document.getSelection()?.addRange(new Range());

		range = document.getSelection()?.getRangeAt(0)!;
	})

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('#currentRange', () => {
		it('Deve retornar o range adicionado ao documento', () => {
			expect(service.currentRange === range);
		})
	});

	describe('#applyTag', () => {
		it('Não deve fazer nada se não existir range atual', () => {
			document.getSelection()?.removeAllRanges();

			editor.innerHTML = 'Um texto qualquer';
			range.setStart(editor.firstChild!, 3);
			range.setEnd(editor.firstChild!, 8);

			service.applyFormat("bold");

			expect(editor.innerHTML).toBe('Um texto qualquer')
		});

		it('Deve aplicar a tag strong na palavra "texto"', () => {
			editor.innerHTML = 'Um simples texto qualquer';
			range.setStart(editor.firstChild!, 11);
			range.setEnd(editor.firstChild!, 16);

			service.applyFormat("bold");

			expect(editor.innerHTML).toBe('Um simples <strong>texto</strong> qualquer')
		});

		it('Deve remover a tag strong na palavra "texto"', () => {
			editor.innerHTML = 'Um simples <strong>texto</strong> qualquer';
			const strongElement = editor.getElementsByTagName("strong")[0];

			range.setStartBefore(strongElement.firstChild!);
			range.setEndAfter(strongElement.firstChild!);

			service.applyFormat("bold");

			expect(editor.innerHTML).toBe('Um simples texto qualquer')
		});

		it('Deve remover a tag strong somente das letras "ex" da palavra "texto" quando "texto" está em negrito', () => {
			editor.innerHTML = 'Um simples <strong>texto</strong> qualquer';
			const boldElement = editor.getElementsByTagName("strong")[0];

			range.setStart(boldElement.firstChild!, 1);
			range.setEnd(boldElement.firstChild!, 3);

			service.applyFormat("bold");

			expect(editor.innerHTML).toBe('Um simples <strong>t</strong>ex<strong>to</strong> qualquer')
		});

		it('Deve remover a tag strong somente das letras "ex" da palavra "texto" quando "simples texto" está em negrito e "texto" está em itálico"', () => {
			editor.innerHTML = 'Um <strong>simples <em>texto</em></strong> qualquer';
			const italicElement = editor.getElementsByTagName("em")[0];

			range.setStart(italicElement.firstChild!, 1);
			range.setEnd(italicElement.firstChild!, 3);

			service.applyFormat("bold");

			expect(editor.innerHTML).toBe('Um <strong>simples <em>t</em></strong>ex<strong><em>to</em></strong> qualquer')
		});

		it('Deve aplicar a tag strong nas letras "xto qua" sem remover a formatação itálico', () => {
			editor.innerHTML = 'Um <strong>texto</strong> <em>qualquer</em>';
			const boldElement = editor.getElementsByTagName("strong")[0];
			const italicElement = editor.getElementsByTagName("em")[0];

			range.setStart(boldElement.firstChild!, 2);
			range.setEnd(italicElement.firstChild!, 3);

			service.applyFormat("bold");

			expect(editor.innerHTML).toBe('Um <strong>te</strong><strong>xto <em>qua</em></strong><em>lquer</em>')
		});
	})

	describe('#normalizeElement', () => {
		it('Deve unir elementos adjacentes', () => {
			const div = document.createElement("div");
			div.innerHTML = '<strong>Este é um <em>texto</em><em> de teste</em></strong> <s>para verificar a</s><s> funcionalidade</s> e a resposta do sistema.';

			service.mergeAllAdjacentElements(div);

			expect(div.innerHTML).toBe('<strong>Este é um <em>texto de teste</em></strong> <s>para verificar a funcionalidade</s> e a resposta do sistema.')
		});

		it('Deve unir text nodes separados', () => {
			const div = document.createElement("div");

			div.innerHTML = '<strong>Este é um <em></em></strong> <s>para verificar a funcionalidade</s> e a resposta do sistema.'

			const italicElement = div.getElementsByTagName("em")[0];

			const firstNode = document.createTextNode("Um texto");
			const secondNode = document.createTextNode(" qualquer");

			italicElement.append(firstNode, secondNode);

			service.mergeAllAdjacentElements(div);

			expect(italicElement.childNodes.length).toBe(1);
		});
	});
});
