# React Elements in Translations

*[Back to Usage](https://github.com/FlorianDevPhynix/react-typesafe-i18n/tree/main#usage)*

The `ComponentRenderer` can render Html in translations as React Elements.

All Parser were designed with safety in mind. All Html Elements and attributes/propertys are filtered using positive lists, so that no dangerous code will be generated.

Custom rendering is supported thanks to the `renderComponent` callback, so that any change to the elements that can't be expressed as strings can be applied.
Here it is even possibel to do unsafe things, like using eval to transform event attributes from strings to executable code, though this is not recommended. It would be better for the client to provide a callback that can be selected using a string (even with an empty attribute value).

## Syntax

The Syntax depends on which Parser is used.

### `SimpleHtmlParser`

uses Json Syntax for the Attributes of Html Elements. Here's an example:

`'Edit <code "id":"test">{code:string}</code "id":"overwrite","className":"test"> and save to test HMR. <button "onClick":"This will be removed!">Click</button>'`

### `ComplexHtmlParser`

on the other hand supports normal Html and Jsx Syntax. It also is a bit faster except when many Html attributes/parameters are used. Here's also an example:

`'Edit <code id="test">{code:string}</code id="overwrite" className="test"> and save to test HMR. <button onClick="This will be removed!">Click</button>'`

> The `DomHtmlParser` supports full Html Syntax but is considerably slower than both of the other options.

## Example

```tsx
import { ComponentRenderer, SimpleHtmlParser, ComplexHtmlParser } from 'react-safe-i18n';

...

<ComponentRenderer
  // this input can be any string, like a Translation
  input={t.home.tip({ code: 'src/<mark>App.tsx</mark>' })}
  parser={SimpleHtmlParser.parseHtml /* ComplexHtmlParser.parseHtml */}
  // allow these element tags
  filterComponents={['code', 'mark', 'button']}
  // allow these attributes/propertys
  filterPropertys={['className', 'id', 'onClick']}
  renderComponent={(node, index, children) => {
    if (node.type === 'element') {
      switch (node.tag) {
        case 'button':
          return (
            <button
              key={index}
              {...node.attributes}
              onClick={() => alert(node.attributes.onClick)}
            >
              {children ? children() : <></>}
            </button>
          );
      }
    }
  }}
/>
```

There are also wrapper components for all Parser: `SimpleComponentRenderer`, `ComplexComponentRenderer` and `DomComponentRenderer`

[Back to Usage](https://github.com/FlorianDevPhynix/react-typesafe-i18n/tree/main#usage)
