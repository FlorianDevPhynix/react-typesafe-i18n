// @vitest-environment jsdom
import { bench, describe } from 'vitest';
import { cleanup as react_cleanup, render } from '@testing-library/react';
import { SimpleComponentRenderer } from './index';

function cleanup() {
	react_cleanup();
}

describe('simple parser', () => {
	bench(
		'basic',
		() => {
			render(
				<SimpleComponentRenderer
					input={
						'Edit <code>src/App.tsx</code> and save to test HMR.'
					}
					filterPropertys={['id', 'className', 'htmlFor', 'type']}
					filterComponents={[
						'code',
						'div',
						'form',
						'label',
						'input',
						'button',
					]}
				/>
			);
		},
		{
			teardown: cleanup,
		}
	);

	bench(
		'many parameters',
		() => {
			render(
				<SimpleComponentRenderer
					input={`Edit <code "id":"test" "className":"" "id":"" "id":"test" "id":"" "id":"test">src/App.tsx</code className="test"> and save to test HMR.
					`}
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

	bench(
		'medium',
		() => {
			render(
				<SimpleComponentRenderer
					input={`Edit <code "id":"test" "className":"">src/App.tsx</code "className":"test"> and save to test HMR.

						<div "className":"form">
							<form>
								<label "htmlFor":"lastname">Name: </label>
								<input "id":"lastname" />
								<label "htmlFor":"firstname">Firstname: </label>
								<input "id":"firstname" />
								<button "type":"submit">Submit</button>
							</form>
						</div>
						`}
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

	bench(
		'heavy',
		() => {
			render(
				<SimpleComponentRenderer
					input={`Edit <code "id":"test" "className":"">src/App.tsx</code "className":"test"> and save to test HMR.

						<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sagittis aliquam malesuada bibendum arcu vitae elementum curabitur vitae. Enim ut tellus elementum sagittis vitae. Fames ac turpis egestas maecenas. Non tellus orci ac auctor augue mauris. Congue nisi vitae suscipit tellus mauris a diam maecenas. Neque sodales ut etiam sit amet nisl purus in. Neque sodales ut etiam sit amet nisl. Neque viverra justo nec ultrices dui sapien eget. Rhoncus dolor purus non enim praesent elementum facilisis leo. Sed nisi lacus sed viverra tellus in. Enim nec dui nunc mattis enim ut tellus elementum. Massa ultricies mi quis hendrerit dolor magna eget est lorem. A scelerisque purus semper eget duis at. Convallis aenean et tortor at. At volutpat diam ut venenatis tellus in. Donec massa sapien faucibus et molestie ac feugiat sed. Eget dolor morbi non arcu risus quis varius quam. Sed turpis tincidunt id aliquet risus feugiat in ante metus.</p>

						<p>Feugiat vivamus at augue eget arcu dictum. Pretium viverra suspendisse potenti nullam ac. Turpis massa tincidunt dui ut ornare lectus sit amet. Tempus imperdiet nulla malesuada pellentesque. Dolor sed viverra ipsum nunc aliquet bibendum. Elit ullamcorper dignissim cras tincidunt lobortis feugiat vivamus at. Convallis aenean et tortor at risus. Montes nascetur ridiculus mus mauris vitae ultricies leo. Tempus iaculis urna id volutpat lacus. Nullam ac tortor vitae purus faucibus ornare suspendisse sed nisi. Purus semper eget duis at tellus at. Lectus proin nibh nisl condimentum id venenatis a condimentum. In nibh mauris cursus mattis. Pharetra convallis posuere morbi leo urna molestie at. Cras adipiscing enim eu turpis egestas pretium.</p>
						
						<div "className":"form">
							<form>
								<label "htmlFor":"lastname">Name: </label>
								<input "id":"lastname" />
								<label "htmlFor":"firstname">Firstname: </label>
								<input "id":"firstname" />
								<button "type":"submit">Submit</button>
							</form>
						</div>
						`}
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
});
