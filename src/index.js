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
      })
    } else {
      $el.setAttribute(item, node.props[item])
    }
  }

  node.children.forEach(item => $el.appendChild(createElement(item)))
  
  // 需要将真实的dom内容保留在虚拟dom中
  return node.setElm($el)
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
 * 比较两个节点的差异
 * 比较的是两个虚拟dom，但是如果要进行操作的话需要使用createElement()函数
 * 转化成真实的dom，来进行操作
 * oldVnode 和 newVnode 有可能是字符串或者数字
 */
function patchVnode (el, oldVnode, newVnode, oldIndex) {

  // 如果两个节点都没有 则无需比较
  if (!oldVnode && !newVnode) return

  // 有一个节点为空
  // 如果老节点没有 而新节点有 则直接挂载新节点
  // console.log(oldVnode, newVnode)
  if (!oldVnode) return el.insertChild(newVnode)
  
  // 如果新节点没有 而老节点有 则直接删除老节点
  if (!newVnode) return el.removeChild(oldIndex)

  // 两个节点相同，可能为相同文字的文本节点，可能为其它节点
  if (oldVnode.isSameNode(newVnode)) {
    // 如果是文本节点 直接返回
    if (oldVnode.isTextNode()) return

    // 如果为普通节点 则继续比较下一层所有的节点
    diff(oldVnode, oldVnode.children, newVnode.children)
  } else {
    // 两个节点不同 并且两个节点都为普通节点
    // 将新节点替换掉老节点
    el.insertChild(newVnode, oldIndex)
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

  /** 遍历新、旧节点  只要哪个先完就结束 */
  while (oldStart <= oldVnodeLength || newStart <= newVnodeLength) {
    _old = oldVnode[oldStart]
    _new = newVnode[newStart]

    patchVnode(el, _old, _new, oldStart)

    oldStart++
    newStart++
  }

  // 循环比较完了 需要看看该层级哪一个节点数有多 则需要再进行下一步的操作
  // 如果老的节点数大于新的节点数
  if (oldVnodeLength > newVnodeLength) {
    for (let i = oldStart; i < oldVnodeLength; i++) {
      el.removeChild(i)
    }
  }

  if (oldVnodeLength < newVnodeLength) {
    newVnode.slice(newStart).forEach(item => {
      el.insertChild(item)
    })
  }
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

  /** 
   * 内存中存储的为虚拟dom 调用document.createElement 
   * 等方法创建的都是真实dom，只不过可能并没有渲染到屏幕上
   * 在虚拟dom中添加真实dom实例
   * 在内存中永远存着两个虚拟dom，始终用newVnode来比较oldVnode
   * oldVnode 通过添加，删除dom 来保证与newVnode一致
   */
  this.$oldVnode = this.$newVnode = render(this, this.$methods)
  createElement(this.$oldVnode)

  this.$isUpdate = null // 是否已经把数据更新放到了微任务中去了

  // 初始化根元素
  this.$el = new VNode('root', null, [])
  this.$el.setElm(document.querySelector(el))

  // 将dom插入到根元素中
  this.$el.insertChild(this.$oldVnode)

  // nextTick 还未完成
  // this.$nextTick = function $nextTick (cb) {
  //   cb()
  // }
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

    // 将newVnode赋值为一个新的虚拟dom
    // 比较的仍然为虚拟dom，在比较的过程中才需要转换成真实dom
    this.$newVnode = this.$view(this, this.$methods)
    // 将真实dom以elm属性的方式加到虚拟dom中
    createElement(this.$newVnode)

    patchVnode(this.$el, this.$oldVnode, this.$newVnode, 0)
    this.$oldVnode = this.$el.children[0]

    this.$isUpdate = null
  })
}

// app.prototype.$