
!(function(ns){
'use strict'

  ns.WeekPlanner = function(priorities, initialPriority, storage){
    var currentPriority = initialPriority
    var userSelections = {}
    var shifts = []
    var currentUser

    var workerSelections = {
      build: function(day, duty){
        return {
          day: day,
          duty: duty
        }
      },

      clear: function(){
        var cellElements = document.querySelectorAll('.timetable .cell')
        _.forEach(cellElements, function(cellElement){
          cellElement.dataset.priority = ''
        })
      },

      draw: function(selections){
        workerSelections.clear()

        _.forEach(selections, function(selections, priority){
          _.forEach(selections, function(selection){
            var currentSlotQuery = '.cell[data-day="' + selection.day + '"][data-duty="' + selection.duty + '"]'
            document.querySelector(currentSlotQuery).dataset.priority = priority
          })
        })

        prioritiesSelector.draw(selections)
      },

      toggle: function(day, duty){
        userSelections[currentPriority] = userSelections[currentPriority] || []

        var builtSelection = workerSelections.build(day, duty)

        if (_.find(userSelections[currentPriority], builtSelection)){
          clearSelection(builtSelection)
        }
        else {
          clearSelection(builtSelection)
          userSelections[currentPriority].push(builtSelection)
        }

        if (userSelections[currentPriority].length > priorities[currentPriority])
          userSelections[currentPriority].shift()

        workerSelections.draw(userSelections)
      }
    }

    var prioritiesSelector = {
      draw: function(selections){
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
      },

      select: function(name){
        if (!_.has(priorities, name))
          return

        currentPriority = name
        prioritiesSelector.draw(userSelections)
      }
    }

    var shiftAssigner = {
      build: function(worker, day, duty){
        return {
          worker: worker,
          day: day,
          duty: duty
        }
      },

      draw: function(shifts){
        var workerCells = document.querySelectorAll('[data-worker]')
        _.forEach(workerCells, function(workerCell){
          workerCell.dataset.assigned = false
        })

        _.forEach(shifts, function(shift){
          var currentShiftQuery = '.cell .cell[data-day="' + shift.day + '"][data-duty="' + shift.duty + '"][data-worker="' + shift.worker + '"]'
          document.querySelector(currentShiftQuery).dataset.assigned = true
        })
      },

      drawWorkers: function(){
        var weekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
        var duties = ['morning', 'evening']
        var workers = [/*'Anna', 'Montse', 'Robert'*/ 'Ivan', 'Karen', 'Leti', 'Minerva', 'Sénia', 'Nicolle', 'Maria', 'Emma', 'Joan']

        var createUserSelector = function(userName, day, duty){
          var element = document.createElement('div')
          element.classList.add('cell')
          element.dataset.worker = userName
          element.dataset.day = day
          element.dataset.duty = duty
          element.innerHTML = userName

          element.addEventListener('click', function(event){
            shiftAssigner.assign(userName, day, duty)
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

        storage.json('selections', {}, function(priorities){
          _.forEach(priorities, function(priorities, worker){
            _.forEach(priorities, function(selections, priority){
              _.forEach(selections, function(selection){
                var workerDutySelector = '.cell[data-duty="' + selection.duty + '"][data-day="' + selection.day + '"] [data-worker="' + worker + '"]'
                var workerDutySelection = document.querySelector(workerDutySelector)

                workerDutySelection.dataset.priority = priority
              })
            })
          })
        })
      },

      assign: function(worker, day, duty){
        var shiftToAdd = shiftAssigner.build(worker, day, duty)

        if (_.find(shifts, shiftToAdd))
          _.remove(shifts, shiftToAdd)
        else
          shifts.push(shiftToAdd)

        shiftAssigner.draw(shifts)
      },

      worker: {
        draw: function(){
          storage.json('shifts', [], function(shifts){
            _.forEach(shifts, function(shift){
              if (shift.worker != currentUser )
                return

              var currentSlotQuery = '.cell[data-day="' + shift.day + '"][data-duty="' + shift.duty + '"]'
              document.querySelector(currentSlotQuery).dataset.assigned = true
            })
          })
        }
      }
    }

    var timetable = {
      draw: function(){
        storage.json('shifts', [], function(shifts){
          _.forEach(shifts, function(shift){
            var shiftSelector = '.cell[data-duty="' + shift.duty + '"][data-day="' + shift.day + '"]'
            var shiftCell = document.querySelector(shiftSelector)

            var element = document.createElement('div')
            element.classList.add('cell')
            element.innerHTML = shift.worker

            shiftCell.appendChild(element)
          })
        })
      }
    }

    var clearSelection =  function(builtSelection){
      _.forEach(userSelections, function(eachPrioritySelections){
        _.remove(eachPrioritySelections, builtSelection)
      })
    }

    return {
      login: function(user, callback){
        console.log(arguments)
        currentUser = user
        storage.json('selections', {}, function(selections){
          userSelections = selections[user] || {}
          callback()
        })
      },

      logout: function(){
        currentUser = null
      },

      currentUser: function(){
        return currentUser
      },

      drawWorkerSelections: function(){
        workerSelections.draw(userSelections)
      },

      selectWorkerPriority: prioritiesSelector.select,

      toggleWorkerSelection: workerSelections.toggle,

      saveWorkerSelections: function(){
        storage.json('selections', {}, function(selections){
          selections[currentUser] = userSelections

          storage.save('selections', selections)
        })
      },

      drawShiftAssigner: shiftAssigner.drawWorkers,

      drawStoredShifts: function(){
        storage.json('shifts', [], function(retrievedShifts){
          console.log(retrievedShifts)
          shifts = retrievedShifts
          shiftAssigner.draw(retrievedShifts)
        })
      },

      saveShifts: function(){
        storage.save('shifts', shifts)
      },

      drawWorkerShifts: shiftAssigner.worker.draw,

      drawTimetable: timetable.draw
    }
  }


}(Murtimer || {}))
