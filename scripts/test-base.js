const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { Select } = require('@base-ui/react/select');

function Test() {
  return React.createElement(Select.Root, { defaultValue: 'foo' },
    React.createElement(Select.Trigger, null, React.createElement(Select.Value, null)),
    React.createElement(Select.Popup, null, 
      React.createElement(Select.Item, { value: 'foo' }, 'FOO LABEL')
    )
  );
}

console.log(ReactDOMServer.renderToString(React.createElement(Test)));
