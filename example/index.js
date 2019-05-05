import {app} from '../src/index'
// import com from './com'

let render = (date, methods) =>(
  <div class="div">
    <div useDate>{ date.count }</div>
    <button onClick={ methods.add }>按钮</button>
    { 
      date.show
        ? <div style={date.style}>我出来了</div>
        : <p>啦啦啦啦</p>
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

// let render = (date, methods) => (
//   <div>
//     <p>{ date.count }</p>
//     <button onClick={ methods.add }>按钮</button>
//   </div>
// )

new app({
  el: '#app',
  render,
  date: {
    count: 0,
    style: {
      width: '100px',
      height: '100px',
      background: 'red'
    },
    show: false
  },
  methods: {
    add () {
      // console.log(this)
      this.count++
    },
    show () {
      this.show = !this.show
    }
  }
})