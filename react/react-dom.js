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

// 下一个工作单元
let nextUnitOfWork = null;

// 根节点
let wipRoot = null;

// 更新前的根节点fiber树
let currentRoot = null;

// 需要删除的节点
let deletions = null;

export function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };

  deletions = [];
  nextUnitOfWork = wipRoot;
  
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
 * 处理提交的fiber树
 * @param {*} fiber 
 */
function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  
  let domParentFiber = fiber.parent;
  while(!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }

  const domParent = domParentFiber.dom;
  if (fiber.dom) {
    domParent.appendChild(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

/**
 * 提交任务， 将fiber树添加到dom中
 */
function commitRoot() {
  commitWork(wipRoot.child);
  wipRoot = null;
}


/**
 * 执行工作单元
 * @param {*} deadline 截止时间
 */
function workLoop(deadline) {
  // console.log('workLoop: ', deadline)
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

  if(!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  // 重新注册空闲时间执行任务
  requestIdleCallback(workLoop);
}

// 空闲时间执行任务
requestIdleCallback(workLoop);


/**
 * 协调
 * @param {*} wipFiber 
 * @param {*} elements 
 */
function reconcileChildren(wipFiber, elements) {
  console.log('reconcileChildren: ', wipFiber, elements)
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while(index < elements.length || oldFiber) {
    const element = elements[index];
    let newFiber = null;

    // 对比oldFiber和element
    const sameType = oldFiber && element && element.type === oldFiber.type;

    // 类型相同需要更新
    if (sameType) {
      // 更新节点
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      }
    }

    // 新的存在并且类型和老的不同需要新增
    if (element && !sameType) {
      // 添加新节点
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      }
    }

    // 老的存在并且类型和新的不同需要删除
    if (oldFiber && !sameType) {
      // 删除节点
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    // 处理oldFiber的兄弟节点
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      // 其他子节点
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

function updateHostComponent(fiber) {
  // 添加 dom 节点
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // 协调子节点
  reconcileChildren(fiber, fiber.props.children);
}

function updateFunctionComponent(fiber) {
  // 执行函数组件，获取子节点
  const children = [fiber.type(fiber.props)];
  // 协调子节点
  reconcileChildren(fiber, children);
}


// 执行单元事件，返回下一个单元事件
function performUnitOfWork(fiber) {

  // 执行函数组件
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    // 执行dom组件
    updateHostComponent(fiber);
  }

  // 返回下一个单元事件
  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while(nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.parent;
  }
  // console.log(fiber)
  // // 1. 添加 dom 节点
  // if (!fiber.dom) {
  //   fiber.dom = createDom(fiber);
  // }

  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom);
  // }

  // let index = 0;
  // let prevSibling = null;
  // const elements = fiber.props.children;

  // while(index < elements.length) {
  //   const element = elements[index];
  //   const newFiber = {
  //     type: element.type,
  //     props: element.props,
  //     parent: fiber,
  //     dom: null,
  //   }

  //   // console.log(newFiber)

  //     // 第一个子节点
  //   if (index === 0) {
  //     fiber.child = newFiber;
  //   } else {
  //     // 其他子节点
  //     prevSibling.sibling = newFiber;
  //   }

  //   prevSibling = newFiber;
  //   index++;
  // }

  // // 3. 返回下一个单元事件
  // // 有子节点，返回子节点
  // if (fiber.child) {
  //   return fiber.child;
  // }

  // // 没有子节点，返回兄弟节点
  // let nextFiber = fiber;
  // while(nextFiber) {
  //   if (nextFiber.sibling) {
  //     return nextFiber.sibling;
  //   }
  //   // 没有兄弟节点，返回父节点的兄弟节点

  //   // console.log(nextFiber)
  //   nextFiber = nextFiber.parent;
  // }
}

export default {
  render
}