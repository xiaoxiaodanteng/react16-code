// import React from 'react';
import React from '../react';
import ReactDOM from '../react/react-dom';

const element = <div title="foo">
  <span>Hello</span>
  <a href="http://example.com">链接</a>
</div>;
console.log('element: ', element);

// const node = document.createElement(element.type);
// node.title = element.props.title;

// const text = document.createTextNode('');
// text.nodeValue = element.props.children;

// node.appendChild(text);


// container.appendChild(node);

const container = document.getElementById('root');

ReactDOM.render(element, container);