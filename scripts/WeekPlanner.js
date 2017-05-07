'use strict'

!(function(ns){

  ns.WeekPlanner = function(priorities, initialPriority, storage){
    console.log(arguments)
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

    var drawShifts = function(shifts){
      var workerCells = document.querySelectorAll('[data-worker]')
      _.forEach(workerCells, function(workerCell){
        workerCell.dataset.assigned = false
      })

      _.forEach(shifts, function(shift){
        var currentShiftQuery = '.cell .cell[data-day="' + shift.day + '"][data-duty="' + shift.duty + '"][data-worker="' + shift.worker + '"]'
        document.querySelector(currentShiftQuery).dataset.assigned = true
      })
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

      addToSelections: function(day, duty){
        userSelections[currentPriority] = userSelections[currentPriority] || []

        var builtSelection = buildSelection(day, duty)

        if (_.has(userSelections[currentPriority], builtSelection))
          return

        this.clearSelection(day, duty)

        userSelections[currentPriority].push(builtSelection)

        if (userSelections[currentPriority].length > priorities[currentPriority])
          userSelections[currentPriority].shift()

        drawSelections(userSelections)
      },

      clearSelection: function(day, duty){
        var builtSelection = buildSelection(day, duty)

        _.forEach(userSelections, function(eachPrioritySelections){
          _.remove(eachPrioritySelections, builtSelection)
        })
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
        userSelections = storage.json('selections')[userData] || {}
      },

      logout: function(){
        storage.remove('current-user')
      },

      currentUser: function(){
        return storage.retrieve('current-user')
      },

      workersSelections: function(){
        return storage.json('selections', {})
      },

      assignShift: function(worker, day, duty){
        var shiftToAdd = buildShift(worker, day, duty)

        var currentShiftFinder = function(shift){
          console.log(shift)
          return shift.worker == worker &&
                 shift.day == day &&
                 shift.duty == duty
        }

        if (_.find(shifts, currentShiftFinder))
          _.remove(shifts, currentShiftFinder)
        else
          shifts.push(shiftToAdd)

        drawShifts(shifts)
      },

      saveShifts: function(){
        storage.save('shifts', shifts)
      },
      drawUserShifts: drawUserShifts
    }
  }


}(Murtimer || {}))
