'use strict';

var allowedPriorities = {
  cant: 4,
  dontwant: 4,
  can: 14,
  want: 4,
  '': 14
}

var userSelections = {}

var Priority = function(priorities){
  var current = 'want'

  return {
    select: function(name){
      if (!_.has(priorities, name))
        return

      current = name
    },
    selected: function(){
      return current
    }
  }
}

var priority = Priority(allowedPriorities)

var drawPriorities = function(selections){
  var priorityElements = document.querySelectorAll('.priorities .cell')
  _.forEach(priorityElements, function(priorityElement){
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

var clearSelections = function(){
  var cellElements = document.querySelectorAll('.timetable .cell')
  _.forEach(cellElements, function(cellElement){
    cellElement.dataset.priority = ''
  })
}

var drawSelections = function(selections){
  clearSelections()

  _.forEach(selections, function(selections, priority){
    _.forEach(selections, function(selection){
      var currentSlotQuery = '.cell[data-day="'+selection.day+'"][data-duty="'+selection.duty+'"]'
      document.querySelector(currentSlotQuery).dataset.priority = priority
    })
  })

  drawPriorities(selections)
}

drawSelections({})

var addToSelections = function(day, duty, priority, selections){
  selections[priority] = selections[priority] || []

  var builtSelection = {
    day: day,
    duty: duty
  }

  if (_.has(selections[priority], builtSelection))
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

  addToSelections(selectedDay, selectedDuty, currentPriority, userSelections)
}

var clear = function(event){
  event.preventDefault()

  var selectedDuty = this.dataset.duty
  var selectedDay = this.dataset.day
  var currentPriority = priority.selected()

  addToSelections(selectedDay, selectedDuty, '', userSelections)
}

var selectPriority = function(event){
  event.preventDefault()

  var selectedPriority = this.dataset.priority
  priority.select(selectedPriority)

  drawPriorities(userSelections)
}

document.addEventListener('DOMContentLoaded', function(){

  var cellElements = document.querySelectorAll('.timetable .cell')
  var priorityElements = document.querySelectorAll('.priorities .cell')
  var userSelector = document.querySelector('.user')
  var saveButton = document.querySelector('.save')

  _.forEach(cellElements, function(cellElement){
    cellElement.addEventListener('touchstart', plan, false)
    cellElement.addEventListener('click', plan, false)
    cellElement.addEventListener('contextmenu', clear, false)
  })

  _.forEach(priorityElements, function(priorityElement){
    priorityElement.addEventListener('touchstart', selectPriority, false)
    priorityElement.addEventListener('click', selectPriority, false)
  })

  saveButton.addEventListener('click', function(){
    var selections = JSON.parse(localStorage['murtimer-selections'] || '{}')

    selections[userSelector.value] = userSelections
    console.log(selections)

    localStorage['murtimer-selections'] = JSON.stringify(selections)
  })
})
