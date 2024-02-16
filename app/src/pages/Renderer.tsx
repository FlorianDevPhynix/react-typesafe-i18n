import {
	ComplexComponentRenderer,
	SimpleComponentRenderer,
} from 'react-safe-i18n';

import { useTranslation } from '../i18n';

export const translation = {
	name: 'Renderer',
	title: 'Renderer',
	simple: 'Simple: Edit <code "id":"test">{code:string}</code "id":"overwrite","className":"test"> and save to test HMR. <button "onClick":"This will be removed!">Click</button>',
	complex:
		'Complex: Edit <code id="test">{code:string}</code id="overwrite" className="test"> and save to test HMR. <button onClick="This will be removed!">Click</button>',
	docs: 'These two examples show how to use the Simple and Complex Renderer Components to be able to include Html/JSX in Translations',
} as const;

export default function Home() {
	const t = useTranslation();

	return (
		<>
			<h1>{t.renderer.title()}</h1>
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				<div>
					<SimpleComponentRenderer
						input={t.renderer.simple({
							code: 'src/<mark>App.tsx</mark>',
						})}
						filterComponents={['code', 'mark', 'button']}
						filterPropertys={['className', 'id', 'onClick']}
						renderComponent={(node, index, children) => {
							if (node.type === 'element') {
								switch (node.tag) {
									case 'button':
										return (
											<button
												key={index}
												{...node.attributes}
												onClick={() =>
													alert(
														node.attributes.onClick
													)
												}
											>
												{children ? children() : <></>}
											</button>
										);
								}
							}
						}}
					/>
				</div>
				<div>
					<ComplexComponentRenderer
						input={t.renderer.complex({
							code: 'src/<mark>App.tsx</mark>',
						})}
						filterComponents={['code', 'mark', 'button']}
						filterPropertys={['className', 'id', 'onClick']}
						renderComponent={(node, index, children) => {
							if (node.type === 'element') {
								switch (node.tag) {
									case 'button':
										return (
											<button
												key={index}
												{...node.attributes}
												onClick={() =>
													alert(
														node.attributes.onClick
													)
												}
											>
												{children ? children() : <></>}
											</button>
										);
								}
							}
						}}
					/>
				</div>
			</div>
			<p className="read-the-docs">{t.renderer.docs()}</p>
		</>
	);
}
