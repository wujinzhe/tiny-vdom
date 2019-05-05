import VNode from './VNode.js'
/**
 * 将虚拟dom元素转化成真实dom
 * 并且绑定事件
 * @param {*} node
 */
function createElement (node) {
  let $el

  // 文本类型结点
  if (node.type === 'text') {
    return node.setElm(document.createTextNode(node.value))
  }

  $el = document.createElement(node.type)

  // 设置属性
  for (let item in node.props) {
    // 判断是否为事件 如果为事件则监听
    if (/^on/g.test(item)) {
      $el.addEventListener(item.replace('on', '').toLowerCase(), function () {
        // console.log('this', current)
        // let date = current
        // 执行元素绑定的方法
        node.props[item]()
        // 如果方法返回的是个promise 则在then后面执行更新函数
        // if (result instanceof Promise) {
        //   result.then(() => {
        //     // checkDate()
        //     // updateElement()
        //   })
        // } else {
        //   // console.log('点击事件')
        //   current.$render()
        //   current.$update()
        //   // checkDate()
        //   // 如果为普通函数
        //   // updateElement()
        //   // current.$render()
        //   // current.$newVnode = createElement(render(current.$date, current.$methods), current)
        // }
        // updateElement()
      })
    } else {
      $el.setAttribute(item, node.props[item])
    }
  }

  node.children.forEach(item => $el.appendChild(createElement(item)))
  
  // 需要将真实的dom内容保留在虚拟dom中
  return (node.elm = $el)
}

// function getHash () {
//   return 'a' + String(Math.random()).substr(2, 5)
// }

// /** 数据检查，判断数据有没有改变 */
// function checkDate () {

// }
/** 两个节点的属性是否相同 */
function sameProps (oldVnode, newVnode) {
  // 如果对象个数不相同 则不同
  if (Object.keys(oldVnode.props).length !== Object.keys(newVnode.props).length) return false

  for (let i in oldVnode.props) {
    if (oldVnode.props[i] !== newVnode.props[i]) return false
  }

  return true
}

/**
 * 比较两个结点是否为等价结点
 * @param {*} oldVnode
 * @param {*} newVnode
 * @returns {Boolean} 是否为等价结点
 */
function sameVnode (oldVnode, newVnode) {

  // console.log(oldVnode, newVnode)

  /** 判断两个属性是否相同 */

  // function sameChildren () {
  //   if (oldVnode.children.length === 0 && newVnode.children.length === 0) return true

  //   if (typeof oldVnode.children[0] === 'string'
  //   && typeof newVnode.children[0] === 'string'
  //   && oldVnode.children[0] === newVnode.children[0]) return true

  //   return false
  // }
  // console.log(oldVnode, newVnode)
  // 如果节点为text类型 并且两个文本值相同 则表示相同
  if (isTextNode(oldVnode) && isTextNode(newVnode) && (oldVnode.value === newVnode.value)) return true

  // 如果不为文本节点 则需要标签类型相等 则表示相同
  return oldVnode.type !== 'text' && (oldVnode.type === newVnode.type)
  // && sameProps()
  // && sameChildren()
}

/** 判读结点是否为文本 */
function isTextNode (Vnode) {
  return Vnode.type === 'text'
}

/** 
 * 比较两个节点的差异
 * 比较的是两个虚拟dom，但是如果要进行操作的话需要使用createElement()函数
 * 转化成真实的dom，来进行操作
 * oldVnode 和 newVnode 有可能是字符串或者数字
 */
function patchVnode (el, oldVnode, newVnode) {

  // 如果两个节点都没有 则无需比较
  if (!oldVnode && !newVnode) return

  // // 如果为文本节点
  // if (isTextNode(oldVnode)) oldVnode = document.createTextNode(oldVnode)
  // if (isTextNode(newVnode)) newVnode = document.createTextNode(newVnode)

  // 如果老节点为null 则直接挂载新节点
  // console.log(oldVnode, newVnode)
  if (!oldVnode) return el.appendChild(newVnode.elm)
  
  // 如果新节点为null 则直接删除老节点
  if (!newVnode) return el.removeChild(oldVnode.elm)
  
  
  /* 如果两个节点相同，则继续比较下一层级的所有节点
   * 暂时两个节点的属性修改 还未实现
   */ 
  if (sameVnode(oldVnode, newVnode)) {
    // 如果两个节点为相同的文本节点 那么它们的children都为undefined
    // 为了排除这一种可能 需要做判断处理
    oldVnode.children
    && oldVnode.children
    && diff(oldVnode, oldVnode.children, newVnode.children)
  } else {
    // console.log(oldVnode, newVnode)
    // console.log(el)
    // console.log(newVnode.elm || newVnode, oldVnode.elm || oldVnode)
    // 如果两个节点类型不一致 则认为是两个不一样的节点，直接将新节点替换掉老节点
    console.log(oldVnode.elm)
    el.insertBefore(newVnode.elm, oldVnode.elm)
    el.removeChild(oldVnode.elm)
    return
  }
}

/** 检查两个同一层级的结点的区别 */
function diff (el, oldVnode, newVnode) {
  // 从节点的两边开始，向中间开始靠拢
  let oldStart = 0,
      oldVnodeLength = oldVnode.length,
      newStart = 0,
      newVnodeLength = newVnode.length,
      _old = null,
      _new = null

  // 只要有一个数组为0 就不用循环比较了
  // if (oldVnodeLength)
  // if (oldVnodeLength === 0 || newVnodeLength === 0) return patchVnode(el, oldVnode, newVnode)

  /** 遍历新、旧节点  只要哪个先完就结束 */
  while (oldStart <= oldVnodeLength || newStart <= newVnodeLength) {
    _old = oldVnode[oldStart++]
    _new = newVnode[newStart++]

    patchVnode(el, _old, _new)
  }

  // 循环比较完了 需要看看该层级哪一个节点数有多 则需要再进行下一步的操作
  // 如果老的节点数大于新的节点数
  if (oldVnodeLength > newVnodeLength) {
    oldVnode.slice(oldStart).forEach(item => {
      // if (typeof item === 'string') item = document.createTextNode(item)
      el.removeChild(item)
    })
  }

  if (oldVnodeLength < newVnodeLength) {
    newVnode.slice(newStart).forEach(item => {
      // if (typeof item === 'string') item = document.createTextNode(item)
      el.appendChild(item)
    })
  }
}
/** 挂载元素 */
function mount (el, node) {
  el.appendChild(node)
}

/** 转换成虚拟dom对象 */
window.h = function h (type, props, ...children) {
  // 文本结点只会返回一个字符串，所以需要重新对文本结点组装成一个对象
  children = children.map(item => {
    if (typeof item === 'string' || typeof item === 'number') {

      let vnode = new VNode('text', null, [])
      vnode.setValue(item)
      return vnode
    }
    return item
  })

  return new VNode(type, props, children)
}

export function component ({
  render,
  date,
  methods
}) {
  var date = date
  var methods = methods
  return createElement(render(date))
}

export function app ({
  el = '#app',
  render,
  date,
  methods
}) {
  this.$view = render
  this.$date = date

  // 给每个methods绑定一个this
  this.$methods = {}
  for (let m in methods) {
    this.$methods[m] = methods[m].bind(this)
  }
  // 初始化两个dom树
  // 将date中的值也赋值给this中
  // 根据date中的数据，在this中生成相对应属性的访问器属性
  for (let i in date) {

    Object.defineProperty(this, i, {
      get () {
        return date[i]
      },
      set (value) {
        date[i] = value

        // 是否已经执行过一次在微任务中的更新操作，如果执行过则不再执行
        // 统一将数据的更新放在微任务中进行
        !this.$isUpdate && this.$update()
      }
    })
  }

  // this.$oldVnode = this.$newVnode = createElement(render(this, this.$methods), this)

  /** 
   * 内存中存储的为虚拟dom 调用document.createElement 
   * 等方法创建的都是真实dom，只不过可能并没有渲染到屏幕上
   */
  this.$oldVnode = this.$newVnode = render(this, this.$methods)
  // console.log(this.$oldVnode)
  // createElement(this.$oldVnode, this)

  this.$isUpdate = null // 是否已经把数据更新放到了微任务中去了
  // 需要挂载的元素
  this.$el = document.querySelector(el)

  // nextTick 还未完成
  this.$nextTick = function $nextTick (cb) {
    cb()
  }

  console.log(this.$oldVnode)
  // 将实例的this传入元素中，当元素调用事件时，this就指向了该实例了
  mount(this.$el, createElement(this.$oldVnode))
  // mount(this.$el, this.$oldVnode)
}

// app.prototype.$set = function () {
  
// }

// app.prototype.$render = function () {
//   // console.log(this)
//   this.$newVnode = createElement(this.$view(this.$date, this.$methods), this)
// }

/** 在微任务中来一次性更新所有的数据，从而渲染dom元素 */
app.prototype.$update = function () {
  this.$isUpdate = Promise.resolve().then(() => {

    // let span = document.createElement('span')
    // span.innerText = '我是span'
    // this.$oldVnode.appendChild(span)

    // 简单的覆盖掉原有的所有元素
    // this.$newVnode = createElement(this.$view(this, this.$methods), this)
    // this.$el.removeChild(this.$oldVnode)
    // this.$el.appendChild(this.$newVnode)
    // this.$oldVnode = this.$newVnode

    // 比较的仍然为虚拟dom，在比较的过程中才需要转换成真实dom
    this.$newVnode = this.$view(this, this.$methods)

    // 将真实dom以elm属性的方式加到虚拟dom中
    createElement(this.$newVnode)

    // el为真实dom，oldVnode和newVnode都为虚拟dom
    patchVnode(this.$el, this.$oldVnode, this.$newVnode)
    // this.$oldVnode = this.$newVnode

    this.$isUpdate = null
  })
}

// app.prototype.$