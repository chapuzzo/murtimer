'use strict'

!(function(ns){

  ns.WeekPlanner = function(priorities, initialPriority, storage){
    var currentPriority = initialPriority
    var userSelections = {}
    var shifts = []

    var buildSelection = function(day, duty){
      return {
        day: day,
        duty: duty
      }
    }

    var buildShift = function(worker, day, duty){
      return {
        worker: worker,
        day: day,
        duty: duty
      }
    }

    var drawPriorities = function(selections){
      var priorityElements = document.querySelectorAll('.priorities .cell')
      _.forEach(priorityElements, function(priorityElement){
        priorityElement.classList.remove('selected')
      })

      var currentPriorityQuery = '.priorities [data-priority="' + currentPriority +'"]'
      var currentPriorityElement = document.querySelector(currentPriorityQuery)
      currentPriorityElement.classList.add('selected')


      _.forEach(priorities, function(max, priority){
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
          var currentSlotQuery = '.cell[data-day="' + selection.day + '"][data-duty="' + selection.duty + '"]'
          document.querySelector(currentSlotQuery).dataset.priority = priority
        })
      })

      drawPriorities(selections)
    }

    var drawUserShifts = function(){
      var shifts = storage.json('shifts', [])
      var currentUser = storage.retrieve('current-user')

      console.log(shifts)
      console.log(currentUser)

      _.forEach(shifts, function(shift){
        if (shift.worker != currentUser )
          return

        var currentSlotQuery = '.cell[data-day="' + shift.day + '"][data-duty="' + shift.duty + '"]'
        document.querySelector(currentSlotQuery).dataset.assigned = true
      })
    }

    var drawSelectedShifts = function(shifts){
      var workerCells = document.querySelectorAll('[data-worker]')
      _.forEach(workerCells, function(workerCell){
        workerCell.dataset.assigned = false
      })

      _.forEach(shifts, function(shift){
        var currentShiftQuery = '.cell .cell[data-day="' + shift.day + '"][data-duty="' + shift.duty + '"][data-worker="' + shift.worker + '"]'
        document.querySelector(currentShiftQuery).dataset.assigned = true
      })
    }

    var clearSelection =  function(builtSelection){
      _.forEach(userSelections, function(eachPrioritySelections){
        _.remove(eachPrioritySelections, builtSelection)
      })
    }

    var drawShiftAssigner = function(){
      var weekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
      var duties = ['morning', 'evening']
      var workers = ['Anna', 'Ivan', 'Karen', 'Leti', 'Minerva', 'Sénia', 'Montse']

      var createUserSelector = function(userName, day, duty){
        var element = document.createElement('div')
        element.classList.add('cell')
        element.dataset.worker = userName
        element.dataset.day = day
        element.dataset.duty = duty
        element.innerHTML = userName

        element.addEventListener('click', function(event){
          assignShift(userName, day, duty)
        })

        return element
      }

      _.forEach(weekDays, function(weekDay){
        _.forEach(duties, function(duty){
          var parentSelector = '[data-duty="' + duty + '"][data-day="' + weekDay + '"]'
          var parent = document.querySelector(parentSelector)
          _.forEach(workers,function(worker){
            parent.appendChild(createUserSelector(worker, weekDay, duty))
          })
        })
      })

      var priorities = workersSelections()
      _.forEach(priorities, function(priorities, worker){
        _.forEach(priorities, function(selections, priority){
          _.forEach(selections, function(selection){
            var workerDutySelector = '.cell[data-duty="' + selection.duty + '"][data-day="' + selection.day + '"] [data-worker="' + worker + '"]'
            var workerDutySelection = document.querySelector(workerDutySelector)

            workerDutySelection.dataset.priority = priority
          })
        })
      })
    }

    var workersSelections = function(){
      return storage.json('selections', {})
    }

    var assignShift = function(worker, day, duty){
      var shiftToAdd = buildShift(worker, day, duty)

      if (_.find(shifts, shiftToAdd))
        _.remove(shifts, shiftToAdd)
      else
        shifts.push(shiftToAdd)

      drawSelectedShifts(shifts)
    }

    return {
      drawUserSelections: function(){
        drawSelections(userSelections)
      },

      selectPriority: function(name){
        if (!_.has(priorities, name))
          return

        currentPriority = name
        drawPriorities(userSelections)
      },

      toggleUserSelection: function(day, duty){
        userSelections[currentPriority] = userSelections[currentPriority] || []

        var builtSelection = buildSelection(day, duty)

        if (_.find(userSelections[currentPriority], builtSelection)){
          clearSelection(builtSelection)
        }
        else {
          clearSelection(builtSelection)
          userSelections[currentPriority].push(builtSelection)
        }

        if (userSelections[currentPriority].length > priorities[currentPriority])
          userSelections[currentPriority].shift()

        drawSelections(userSelections)
      },

      saveUserSelections: function(){
        var selections = storage.json('selections', {})
        var currentUser = storage.retrieve('current-user')

        selections[currentUser] = userSelections

        storage.save('selections', selections)
      },

      login: function(userData){
        storage.save('current-user', userData)
        userSelections = storage.json('selections', {})[userData] || {}
      },

      logout: function(){
        storage.remove('current-user')
      },

      currentUser: function(){
        return storage.retrieve('current-user')
      },

      workersSelections: workersSelections,

      assignShift: assignShift,

      drawSelectedShifts: drawSelectedShifts,

      drawStoredShifts: function(){
        var storedShifts = storage.json('shifts', [])
        drawSelectedShifts(storedShifts)
      },

      saveShifts: function(){
        storage.save('shifts', shifts)
      },

      drawUserShifts: drawUserShifts,

      drawShiftAssigner: drawShiftAssigner
    }
  }


}(Murtimer || {}))
