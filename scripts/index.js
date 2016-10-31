// var selectOption = function(){
//   this.classList
// }

var toggle = function(event){
  // console.log('toggling')
  console.log(event.type)
  event.preventDefault()
  // event.stopPropagation()
  event.target.classList.toggle('can')
}

document.addEventListener('DOMContentLoaded', function(){
  var cells = document.querySelectorAll('.timetable .td')
  console.log(cells)
  Array.prototype.forEach.call(cells, function(cell){
    cell.addEventListener('touchstart', toggle, false)
    cell.addEventListener('click', toggle, false)
  })
})
