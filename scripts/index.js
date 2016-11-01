'use strict';

var allowedPriorities = {
  cant: 4,
  dontwant: 4,
  can: 14,
  want: 4,
  '': 14
}

var selections = {}

var Priority = function(priorities){
  var current = ''

  return {
    select: function(name){
      if (Object.keys(priorities).indexOf(name) < 0)
        return

      current = name
    },
    selected: function(){
      return current
    }
  }
}

var priority = Priority(allowedPriorities)

var selectPriority = function(event){
  event.preventDefault()

  var options = document.querySelectorAll('.priorities .cell')
  Array.prototype.forEach.call(options, function(option){
    option.classList.remove('selected')
  })

  this.classList.add('selected')

  var selectedPriority = this.dataset.priority
  priority.select(selectedPriority)
}

var drawSelections = function(selections){
  var cells = document.querySelectorAll('.timetable .cell')
  Array.prototype.forEach.call(cells, function(cell){
    cell.dataset.priority = ''
  })

  _.forEach(selections, function(selections, priority){
    _.forEach(selections, function(selection){
      var currentSlot = '.cell[data-day="'+selection.day+'"][data-duty="'+selection.duty+'"]'
      document.querySelector(currentSlot).dataset.priority = priority
    })
  })

  _.forEach(allowedPriorities, function(max, priority){
    var currentPriorityQuery = '.priorities [data-priority="' + priority +'"] .count'
    var element = document.querySelector(currentPriorityQuery)
    element.innerHTML = max - (selections[priority] || []).length
  })
}

drawSelections([])

var addToSelections = function(day, duty, priority, selections){
  selections[priority] = selections[priority] || []

  var builtSelection = {
    day: day,
    duty: duty
  }

  if (_.find(selections[priority], builtSelection))
    return

  _.forEach(selections, function(selections){
    _.remove(selections, builtSelection)
  })

  selections[priority].push(builtSelection)

  if (selections[priority].length > allowedPriorities[priority])
    selections[priority].shift()

  drawSelections(selections)
}


var plan = function(event){
  event.preventDefault()

  var selectedDuty = this.dataset.duty
  var selectedDay = this.dataset.day
  var currentPriority = priority.selected()

  addToSelections(selectedDay, selectedDuty, currentPriority, selections)
}


var clear = function(event){
  event.preventDefault()

  var selectedDuty = this.dataset.duty
  var selectedDay = this.dataset.day
  var currentPriority = priority.selected()

  addToSelections(selectedDay, selectedDuty, '', selections)
}

document.addEventListener('DOMContentLoaded', function(){
  var cells = document.querySelectorAll('.timetable .cell')
  Array.prototype.forEach.call(cells, function(cell){
    cell.addEventListener('touchstart', plan, false)
    cell.addEventListener('click', plan, false)
    cell.addEventListener('dblclick', clear, false)
  })

  var priorities = document.querySelectorAll('.priorities .cell')
  Array.prototype.forEach.call(priorities, function(cell){
    cell.addEventListener('touchstart', selectPriority, false)
    cell.addEventListener('click', selectPriority, false)
  })
})
