import {app} from '../src/index'
// import com from './com'

let render = (date, methods) =>(
  <div class="div">
    <div style="color: blue;display: inline-block;" style={ date.style }>{ date.count }</div>
    <button onClick={ methods.add }>按钮</button>
    {
      date.show ? <span>显示</span> : ''
    }
    <button onclick={ 
      () => {
        date.show = !date.show
      } 
    }>切换</button>
    <br></br>
    <button onclick={
      () => {
        methods.add()
        methods.show()
      }
    }>全部</button>
  </div>
)

new app({
  el: '#app',
  render,
  date: {
    count: 0,
    style: {
      width: '100px',
      height: '100px',
      background: 'red',
      color: 'white',
      textAlign: 'center'
    },
    show: false
  },
  methods: {
    add () {
      console.log(this)
      // console.log(this)
      this.count++
    },
    show () {
      this.show = !this.show
    }
  }
})