import {component} from '../src/index'

let view = (date, methods) => (
  <div>
    <h1>{ title }</h1>
    <div>我是组件</div>
  </div>
)

export default new component({
  date: {
    title: '标题'
  },
  render: view,
  methods: {

  }
})