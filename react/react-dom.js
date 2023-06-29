// export function render(element, container) {
//   const dom = element.type === 'TEXT_ELEMENT'
//     ? document.createTextNode('')
//     : document.createElement(element.type);

//   const isProperty = key => key !== 'children';

//   Object.keys(element.props)
//     .filter(isProperty)
//     .forEach(name => {
//       dom[name] = element.props[name];
//     });

//   element.props.children.forEach(child =>
//     render(child, dom)
//   );

//   container.appendChild(dom);
// }

let nextUnitOfWork = null;

export function render(element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  };
  
  console.log('nextUnitOfWork: ', nextUnitOfWork);
}

export function createDom(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(fiber.type);

  const isProperty = key => key !== 'children';

  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = fiber.props[name];
    });

  return dom;
}

/**
 * 
 * @param {*} deadline 截止时间
 */
function workLoop(deadline) {
  // 停止标识
  let shouldYield = false;
  while(nextUnitOfWork && !shouldYield) {
    // 执行工作单元
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    );
    // 判断是否需要停止
    shouldYield = deadline.timeRemaining() < 1;
  }
  // 重新注册空闲时间执行任务
  requestIdleCallback(workLoop);
}

// 空闲时间执行任务
requestIdleCallback(workLoop);

// 执行单元事件，返回下一个单元事件
function performUnitOfWork(fiber) {
  // 1. 添加 dom 节点
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  let index = 0;
  let prevSibling = null;
  const elements = fiber.props.children;

  while(index < elements.length) {
    const element = elements[index];
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }

      // 第一个子节点
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      // 其他子节点
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }

  // 3. 返回下一个单元事件
  // 有子节点，返回子节点
  if (fiber.child) {
    return fiber.child;
  }

  // 没有子节点，返回兄弟节点
  let nextFiber = fiber;
  while(nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    // console.log(nextFiber)
    // 没有兄弟节点，返回父节点的兄弟节点
    nextFiber = nextFiber.parent;
  }
}

export default {
  render
}