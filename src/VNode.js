/** 虚拟结点类 */
class VNode {
  constructor (type, props, children) {
    this.type = type
    this.props = props
    this.children = children
  }

  /** 设置结点的值，只有文本结点设置值才有效 */
  setValue (value) {
    this.value = value
  }

  /** 设置改结点的真实DOM */
  setElm (elm) {
    return this.elm = elm
  }

  /**
   *
   * 向该结点插入子元素，如果没有index值，则插入到最后，如果有index值，则将新元素替换掉旧元素
   * @param {VNode} node
   * @param {*} index
   * @memberof Node
   */
  insertChild (node, index) {
    
    // 如果没有传入index 或者index大于最大索引值 则默认把结点插入到最后面
    if (!index || index > this.children.length - 1) {
      this.children.push(node) // 将VNode结点的children中添加一个结点
      this.elm.appendChild(node.elm)  // 并且在真实的dom结点中也添加这个结点对应的真实结点
    } else {
      let _child = this.children[index]

      // 在真实dom结点中将新结点替换掉老结点
      this.elm.insertBefore(node.elm, _child.elm)
      this.elm.removeChild(_child.elm)

      // 在虚拟dom结点中将新结点替换掉老结点
      this.children.splice(index, 1, node)
    }
  }

  /**
   * 移除某个索引下的元素
   *
   * @param {*} index
   * @memberof Node
   */
  removeChild (index) {
    // 虚拟dom做一次移除
    this.children.splice(index, 1)

    // 真实dom做一次移除
    let _child = this.children[index]
    this.elm.removeChild(_child.elm)
  }
}

export default VNode
