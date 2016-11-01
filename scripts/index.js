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
  var current = 'want'

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

var drawPriorities = function(){
  var priorityElements = document.querySelectorAll('.priorities .cell')
  Array.prototype.forEach.call(priorityElements, function(priorityElement){
    priorityElement.classList.remove('selected')
  })

  var currentPriorityQuery = '.priorities [data-priority="' + priority.selected() +'"]'
  var currentPriorityElement = document.querySelector(currentPriorityQuery)
  currentPriorityElement.classList.add('selected')


  _.forEach(allowedPriorities, function(max, priority){
    var currentPriorityQuery = '.priorities [data-priority="' + priority +'"] .count'
    var element = document.querySelector(currentPriorityQuery)
    element.innerHTML = max - (selections[priority] || []).length
  })
}

var selectPriority = function(event){
  event.preventDefault()

  var selectedPriority = this.dataset.priority
  priority.select(selectedPriority)

  drawPriorities()
}

var drawSelections = function(selections){
  var cellElements = document.querySelectorAll('.timetable .cell')
  Array.prototype.forEach.call(cellElements, function(cellElement){
    cellElement.dataset.priority = ''
  })

  _.forEach(selections, function(selections, priority){
    _.forEach(selections, function(selection){
      var currentSlotQuery = '.cell[data-day="'+selection.day+'"][data-duty="'+selection.duty+'"]'
      document.querySelector(currentSlotQuery).dataset.priority = priority
    })
  })

  drawPriorities()
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
