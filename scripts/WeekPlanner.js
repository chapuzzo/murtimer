'use strict'

!(function(ns){

  ns.WeekPlanner = function(priorities, initialPriority, storage){
    console.log(arguments)
    var currentPriority = initialPriority
    var userSelections = {}

    var buildSelection = function(day, duty){
      return {
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
      },

      saveUserSelections: function(){
        var selections = storage.json('selections', {})
        var currentUser = storage.retrieve('current-user')

        selections[currentUser] = userSelections

        storage.save('selections', selections )
      },

      login: function(userData){
        storage.save('current-user', userData)
      },

      logout: function(userData){
        storage.remove('current-user')
      }
    }
  }


}(Murtimer || {}))
