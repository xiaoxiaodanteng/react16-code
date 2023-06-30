// import React from 'react';
import React from '../react';
import ReactDOM from '../react/react-dom';

const element = <section>
  <h1 title="foo">
    <span>Hello</span>
  </h1>
  <a href="https://baidu.com">链接</a>
</section>;
console.log('element: ', element);

// const node = document.createElement(element.type);
// node.title = element.props.title;

// const text = document.createTextNode('');
// text.nodeValue = element.props.children;

// node.appendChild(text);


// container.appendChild(node);

const container = document.getElementById('root');

ReactDOM.render(element, container);