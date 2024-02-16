// @vitest-environment jsdom
import { describe, test, expect, afterEach, vi } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import '@testing-library/jest-dom/vitest';
import { SimpleHtmlParser, ComplexHtmlParser } from '../html_parser';
import { ComponentRenderer } from '.';

expect.extend(matchers);

describe('ComponentRenderer', () => {
	afterEach(async () => {
		cleanup();
	});

	describe('shared', () => {
		test('basic', async () => {
			const result = render(
				<ComponentRenderer
					input={
						'Edit <code>src/App.tsx</code> and save to test HMR.'
					}
					parser={SimpleHtmlParser.parseHtml}
					filterPropertys={[]}
					filterComponents={['code']}
				/>
			);

			expect(screen.getByText('Edit', { exact: false })).toBeDefined();
			expect(
				screen.getByText('and save to test HMR.', { exact: false })
			).toBeDefined();

			const code_element = result.container.querySelector('code');
			expect(code_element).toBeDefined();
			expect(code_element).toHaveTextContent('src/App.tsx');
		});

		test('with nested elements', () => {
			const result = render(
				<ComponentRenderer
					input={
						'Edit <code>src/<strong>App.tsx</strong></code> and save to test HMR.'
					}
					parser={SimpleHtmlParser.parseHtml}
					filterPropertys={[]}
					filterComponents={['code', 'strong']}
				/>
			);

			expect(screen.getByText('Edit', { exact: false })).toBeDefined();
			expect(
				screen.getByText('and save to test HMR.', { exact: false })
			).toBeDefined();

			const code_element = result.container.querySelector('code');
			expect(code_element).not.toBeNull();
			expect(code_element).toHaveTextContent('src/');

			const strong_element = code_element?.querySelector('strong');
			expect(strong_element).not.toBeNull();
			expect(strong_element).toHaveTextContent('App.tsx');
		});

		test('element not allowed by filter', () => {
			const result = render(
				<ComponentRenderer
					input={
						'Edit <code>src/<strong>App.tsx</strong></code> and save to test HMR.'
					}
					parser={SimpleHtmlParser.parseHtml}
					filterPropertys={[]}
					filterComponents={['code']} // strong is not allowed
				/>
			);

			expect(screen.getByText('Edit', { exact: false })).toBeDefined();
			expect(
				screen.getByText('and save to test HMR.', { exact: false })
			).toBeDefined();

			const code_element = result.container.querySelector('code');
			expect(code_element).not.toBeNull();
			expect(code_element).toHaveTextContent('src/');

			const strong_element = code_element?.querySelector('strong');
			expect(strong_element).toBeNull();
		});

		test('mock render callback', () => {
			const renderComponent = vi.fn().mockReturnValue(undefined);
			//.mockImplementation((...args) => console.log(args))

			const result = render(
				<ComponentRenderer
					input={
						'Edit <code>src/<strong>App.tsx</strong></code> and save to test HMR.'
					}
					parser={SimpleHtmlParser.parseHtml}
					filterPropertys={[]}
					filterComponents={['code', 'strong']}
					renderComponent={renderComponent}
				/>
			);

			expect(screen.getByText('Edit', { exact: false })).toBeDefined();
			expect(
				screen.getByText('and save to test HMR.', { exact: false })
			).toBeDefined();

			const code_element = result.container.querySelector('code');
			expect(code_element).not.toBeNull();
			expect(code_element).toHaveTextContent('src/');

			const strong_element = code_element?.querySelector('strong');
			expect(strong_element).not.toBeNull();
			expect(code_element).toHaveTextContent('App.tsx');

			expect(renderComponent).toBeCalledTimes(3 + 2 + 1);
		});
	});

	describe('simple parser', () => {
		test('with properties', () => {
			const result = render(
				<ComponentRenderer
					input={
						'Edit <code "id":"test", "id":"">src/<strong "id":"test">App.tsx</strong "className":"test", "id":"test2"></code> and save to test HMR.'
					}
					parser={SimpleHtmlParser.parseHtml}
					filterPropertys={['id', 'className']}
					filterComponents={['code', 'strong']}
				/>
			);

			expect(screen.getByText('Edit', { exact: false })).toBeDefined();
			expect(
				screen.getByText('and save to test HMR.', { exact: false })
			).toBeDefined();

			const code_element = result.container.querySelector('code');
			expect(code_element).not.toBeNull();
			expect(code_element).toHaveTextContent('src/');
			expect(code_element).toHaveAttribute('id', '');

			const strong_element = code_element?.querySelector('strong');
			expect(strong_element).not.toBeNull();
			expect(strong_element).toHaveAttribute('id', 'test');
			expect(strong_element).not.toHaveAttribute('class');
			expect(strong_element).toHaveTextContent('App.tsx');
		});

		test('filtered out propertie', () => {
			const result = render(
				<ComponentRenderer
					input={
						'Edit <code "id":"test">src/<strong "id":"test" "className":"test">App.tsx</strong ></code> and save to test HMR.'
					}
					parser={SimpleHtmlParser.parseHtml}
					filterPropertys={['id']}
					filterComponents={['code', 'strong']}
				/>
			);

			expect(screen.getByText('Edit', { exact: false })).toBeDefined();
			expect(
				screen.getByText('and save to test HMR.', { exact: false })
			).toBeDefined();

			const code_element = result.container.querySelector('code');
			expect(code_element).toBeDefined();
			expect(code_element).toHaveTextContent('src/');
			expect(code_element).toHaveAttribute('id', 'test');

			const strong_element = code_element?.querySelector('strong');
			expect(strong_element).not.toBeNull();
			expect(code_element).toHaveAttribute('id', 'test');
			expect(code_element).not.toHaveAttribute('class');
			expect(strong_element).toHaveTextContent('App.tsx');
		});

		test('malformed html', () => {
			const result = render(
				<ComponentRenderer
					input={
						'Edit <code id="test">src/<strong>App.tsx</strong> and save to test HMR.'
					}
					parser={SimpleHtmlParser.parseHtml}
					filterPropertys={['id']}
					filterComponents={['code', 'strong']}
				/>
			);

			expect(screen.getByText('Edit', { exact: false })).toBeDefined();
			expect(
				screen.getByText('and save to test HMR.', { exact: false })
			).toBeDefined();

			const code_element = result.container.querySelector('code');
			expect(code_element).toBeDefined();
			expect(code_element).toHaveTextContent('src/');
			expect(code_element).not.toHaveAttribute('id');

			const strong_element = code_element?.querySelector('strong');
			expect(strong_element).not.toBeNull();
			expect(strong_element).toHaveTextContent('App.tsx');
		});
	});

	describe('complex parser', () => {
		test('with properties', () => {
			const result = render(
				<ComponentRenderer
					input={
						'Edit <code id="test" id="">src/<strong id="test">App.tsx</strong className="test" id="test2"></code> and save to test HMR.'
					}
					parser={ComplexHtmlParser.parseHtml}
					filterPropertys={['id', 'className']}
					filterComponents={['code', 'strong']}
				/>
			);

			expect(screen.getByText('Edit', { exact: false })).toBeDefined();
			expect(
				screen.getByText('and save to test HMR.', { exact: false })
			).toBeDefined();

			const code_element = result.container.querySelector('code');
			expect(code_element).not.toBeNull();
			expect(code_element).toHaveTextContent('src/');
			expect(code_element).toHaveAttribute('id', '');

			const strong_element = code_element?.querySelector('strong');
			expect(strong_element).not.toBeNull();
			expect(strong_element).toHaveAttribute('id', 'test');
			expect(strong_element).not.toHaveAttribute('class');
			expect(strong_element).toHaveTextContent('App.tsx');
		});

		test('filtered out propertie', () => {
			const result = render(
				<ComponentRenderer
					input={
						'Edit <code id="test">src/<strong id="test" className="test">App.tsx</strong ></code> and save to test HMR.'
					}
					parser={ComplexHtmlParser.parseHtml}
					filterPropertys={['id']}
					filterComponents={['code', 'strong']}
				/>
			);

			expect(screen.getByText('Edit', { exact: false })).toBeDefined();
			expect(
				screen.getByText('and save to test HMR.', { exact: false })
			).toBeDefined();

			const code_element = result.container.querySelector('code');
			expect(code_element).toBeDefined();
			expect(code_element).toHaveTextContent('src/');
			expect(code_element).toHaveAttribute('id', 'test');

			const strong_element = code_element?.querySelector('strong');
			expect(strong_element).not.toBeNull();
			expect(code_element).toHaveAttribute('id', 'test');
			expect(code_element).not.toHaveAttribute('class');
			expect(strong_element).toHaveTextContent('App.tsx');
		});

		describe('malformed', () => {
			test('wrong syntax', () => {
				const result = render(
					<ComponentRenderer
						input={
							'Edit <code "id":"test">src/<strong>App.tsx</strong> and save to test HMR.'
						}
						parser={ComplexHtmlParser.parseHtml}
						filterPropertys={['id']}
						filterComponents={['code', 'strong']}
					/>
				);

				expect(
					screen.getByText('Edit', { exact: false })
				).toBeDefined();
				expect(
					screen.getByText('and save to test HMR.', { exact: false })
				).toBeDefined();

				const code_element = result.container.querySelector('code');
				expect(code_element).toBeDefined();
				expect(code_element).toHaveTextContent('src/');
				expect(code_element).not.toHaveAttribute('id');

				const strong_element = code_element?.querySelector('strong');
				expect(strong_element).not.toBeNull();
				expect(strong_element).toHaveTextContent('App.tsx');
			});

			test('missing end of attribute value', () => {
				const result = render(
					<ComponentRenderer
						input={
							'Edit <code "id":"test className="test">src/<strong>App.tsx</strong> and save to test HMR.'
						}
						parser={ComplexHtmlParser.parseHtml}
						filterPropertys={['id', 'className']}
						filterComponents={['code', 'strong']}
					/>
				);

				expect(
					screen.getByText('Edit', { exact: false })
				).toBeDefined();
				expect(
					screen.getByText('and save to test HMR.', { exact: false })
				).toBeDefined();

				const code_element = result.container.querySelector('code');
				expect(code_element).toBeDefined();
				expect(code_element).toHaveTextContent('src/');
				expect(code_element).not.toHaveAttribute('id');
				expect(code_element).not.toHaveAttribute('class');

				const strong_element = code_element?.querySelector('strong');
				expect(strong_element).not.toBeNull();
				expect(strong_element).toHaveTextContent('App.tsx');
			});
		});
	});
});
