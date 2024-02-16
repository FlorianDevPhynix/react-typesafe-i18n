// @vitest-environment jsdom
import { bench, describe } from 'vitest';
import { cleanup as react_cleanup, render } from '@testing-library/react';
import { ComponentRenderer } from '.';
import { SimpleHtmlParser } from '../html_parser';
import { TokenizeMatch } from '../html_parser/shared';

function cleanup() {
	react_cleanup();
}

describe('shared', () => {
	bench(
		'text',
		() => {
			render(
				<ComponentRenderer
					input={
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sagittis aliquam malesuada bibendum arcu vitae elementum curabitur vitae. Enim ut tellus elementum sagittis vitae. Fames ac turpis egestas maecenas. Non tellus orci ac auctor augue mauris. Congue nisi vitae suscipit tellus mauris a diam maecenas. Neque sodales ut etiam sit amet nisl purus in. Neque sodales ut etiam sit amet nisl. Neque viverra justo nec ultrices dui sapien eget. Rhoncus dolor purus non enim praesent elementum facilisis leo. Sed nisi lacus sed viverra tellus in. Enim nec dui nunc mattis enim ut tellus elementum. Massa ultricies mi quis hendrerit dolor magna eget est lorem. A scelerisque purus semper eget duis at. Convallis aenean et tortor at. At volutpat diam ut venenatis tellus in. Donec massa sapien faucibus et molestie ac feugiat sed. Eget dolor morbi non arcu risus quis varius quam. Sed turpis tincidunt id aliquet risus feugiat in ante metus.'
					}
					parser={SimpleHtmlParser.parseHtml}
					filterPropertys={['id', 'className', 'htmlFor', 'type']}
					filterComponents={[
						'code',
						'div',
						'form',
						'label',
						'input',
						'button',
					]}
					renderComponent={(node, index) => {
						if (node.type === 'element' && node.tag === 'input') {
							return <input {...node.attributes} key={index} />;
						}
					}}
				/>
			); //.debug()
		},
		{
			teardown: cleanup,
		}
	);

	describe('split', () => {
		describe('regex', () => {
			bench(
				'basic',
				() => {
					const input =
						'Edit <code>src/App.tsx</code> and save to test HMR.';
					input.split(TokenizeMatch);
				},
				{
					teardown: cleanup,
				}
			);
			bench(
				'heavy',
				() => {
					const input = `Edit <code "id":"test" "className":"">src/App.tsx</code "className":"test"> and save to test HMR.
		
				<div "className":"form">
					<form>
						<label "htmlFor":"lastname">Name: </label>
						<input "id":"lastname" />
						<label "htmlFor":"firstname">Firstname: </label>
						<input "id":"firstname" />
						<button "type":"submit">Submit</button>
					</form>
				</div>
				`;
					input.split(TokenizeMatch);
				},
				{
					teardown: cleanup,
				}
			);
		});

		describe('algorithm', () => {
			bench(
				'heavy',
				() => {
					const input = `Edit <code "id":"test" "className":"">src/App.tsx</code "className":"test"> and save to test HMR.
		
				<div "className":"form">
					<form>
						<label "htmlFor":"lastname">Name: </label>
						<input "id":"lastname" />
						<label "htmlFor":"firstname">Firstname: </label>
						<input "id":"firstname" />
						<button "type":"submit">Submit</button>
					</form>
				</div>
				`;

					const tokens: { start: number; end: number }[] = [];
					let text_start = 0;
					for (let i = 0; i < input.length; i++) {
						if (input[i] === '<') {
							if (text_start < i) {
								tokens.push({ start: text_start, end: i - 1 });
							}
							const start = i++;
							for (; i < input.length; i++) {
								if (input[i] === '>') {
									tokens.push({ start, end: i });
									text_start = ++i;
									break;
								}
							}
						}
					}

					/* tokens.forEach((token) => {
						//console.log(token);
						console.log(input.slice(token.start, token.end + 1));
					}); */
				},
				{
					teardown: cleanup,
				}
			);
		});
	});
});
