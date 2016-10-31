'use strict';

var selectionStates = ['cant', 'dontwant', 'can', 'want']

var StateSetter = function(){
  var stateToSet = ''

  return {
    nowSetting: function(state){
      if (selectionStates.indexOf(state) < 0)
        return

      stateToSet = state
    },
    currentState: function(){
      return stateToSet
    }
  }
}

var stateSetter = StateSetter()

var selectOption = function(event){
  var options = document.querySelectorAll('.options .td')
  Array.prototype.forEach.call(options, function(option){
    option.classList.remove('selected')
  })

  event.target.classList.add('selected')
  console.log(event.target.classList)

  var currentState = event.target.dataset.state
  stateSetter.nowSetting(currentState)
}

var toggle = function(event){
  console.log(event.type)
  event.preventDefault()
  event.target.dataset.state = stateSetter.currentState()
}

document.addEventListener('DOMContentLoaded', function(){
  var cells = document.querySelectorAll('.timetable .td')
  Array.prototype.forEach.call(cells, function(cell){
    cell.addEventListener('touchstart', toggle, false)
    cell.addEventListener('click', toggle, false)
  })

  var options = document.querySelectorAll('.options .td')
  Array.prototype.forEach.call(options, function(cell){
    cell.addEventListener('touchstart', selectOption, false)
    cell.addEventListener('click', selectOption, false)
  })
})
