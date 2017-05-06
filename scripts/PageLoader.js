'use strict'

!(function(ns){

  ns.PageLoader = function(containerSelector, app){
    console.log(arguments)
    console.log(this)

    var _request = function(url, callback){
      var request = new XMLHttpRequest()
      request.open('GET', url, true)
      request.responseType = 'text'
      request.addEventListener('load', function(event) {
        callback(event.target.response)
      })
      request.send()
    }

    var _load = function(name){
      console.log('loading page: ' + name)

      var pageToLoad = pages[name]

      if (!pageToLoad){
        console.error(name + ' is not a page which can be loaded')
        return
      }

      if (pageToLoad.header)
        _request(pageToLoad.header, function(content){
          document.querySelector('.header').innerHTML = content
          if (pageToLoad.bindHeaderEvents)
            pageToLoad.bindHeaderEvents(app)
        })

      _request(pageToLoad.url, function(content){
        document.querySelector(containerSelector).innerHTML = content
        pageToLoad.bindEvents(app)
      })
    }


    var pages = {
      user: {
        url: 'pages/user.html',
        header: 'pages/header.html',
        bindHeaderEvents: function(app){
          var saveButton = document.querySelector('.save')

          saveButton.addEventListener('click', function(){
            app.saveUserSelections()
          })

          var exitButton = document.querySelector('.logout')

          exitButton.addEventListener('click', function(){
            _load('login')
          })

          var nameElement = document.querySelector('.header span.name')
          nameElement.innerHTML = app.currentUser()
        },
        bindEvents: function(app){
          var cellElements = document.querySelectorAll('.timetable .cell')
          var priorityElements = document.querySelectorAll('.priorities .cell')

          var triggers = {
            plan: function(event){
              event.preventDefault()

              var selectedDuty = this.dataset.duty
              var selectedDay = this.dataset.day

              app.addToSelections(selectedDay, selectedDuty)
            },

            clear: function(event){
              event.preventDefault()

              var selectedDuty = this.dataset.duty
              var selectedDay = this.dataset.day

              app.clearSelection(selectedDay, selectedDuty)
            },

            selectPriority: function(event){
              event.preventDefault()

              var selectedPriority = this.dataset.priority

              app.selectPriority(selectedPriority)
            }
          }

          _.forEach(cellElements, function(cellElement){
            // cellElement.addEventListener('touchstart', triggers.plan, false)
            cellElement.addEventListener('click', triggers.plan, false)
            cellElement.addEventListener('dblclick', triggers.clear, false)
          })

          _.forEach(priorityElements, function(priorityElement){
            // priorityElement.addEventListener('touchstart', triggers.selectPriority, false)
            priorityElement.addEventListener('click', triggers.selectPriority, false)
          })

          app.drawUserSelections()
        }
      },

      plan: {
        url: 'pages/admin.html',
        header: 'pages/header.html',
        bindHeaderEvents: function(app){
          var saveButton = document.querySelector('.save')

          saveButton.addEventListener('click', function(){
            app.saveUserSelections()
          })

          var exitButton = document.querySelector('.logout')

          exitButton.addEventListener('click', function(){
            _load('login')
          })

          var nameElement = document.querySelector('.header div')
          nameElement.remove()
          saveButton.remove()
        },
        bindEvents: function(){
          var weekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
          var duties = ['morning', 'evening']
          var workers = ['Anna', 'Ivan', 'Karen', 'Leti', 'Minerva', 'Sénia', 'Montse']

          var createUserSelector = function(userName){
            var element = document.createElement('div')
            element.classList.add('cell')
            element.dataset.worker = userName
            element.innerHTML = userName

            return element
          }


          _.forEach(weekDays, function(weekDay){
            _.forEach(duties, function(duty){
              var parentSelector = '[data-duty="' + duty + '"][data-day="' + weekDay + '"]'
              var parent = document.querySelector(parentSelector)
              _.forEach(workers,function(worker){
                parent.appendChild(createUserSelector(worker))
              })
            })
          })

          var priorities = app.workersSelections()
          _.forEach(priorities, function(workerPriorities, worker){
            _.forEach(workerPriorities, function(selections, priority){
              console.log(selections)
              console.log(priority)

              _.forEach(selections, function(selection){
                var workerDutySelector = '.cell[data-duty="' + selection.duty + '"][data-day="' + selection.day + '"] [data-worker="' + worker + '"]'
                var workerDuty = document.querySelector(workerDutySelector)
                console.log(workerDuty)

                workerDuty.dataset.priority = priority
              })

            })
          })
        }
      },

      login: {
        url: 'pages/login.html',
        bindEvents: function(app){
          var headerContents = document.querySelectorAll('.header > *')
          if (headerContents)
            _.forEach(headerContents, function(headerContent){
              headerContent.remove()
            })

          console.log(arguments)
          var userSelector = document.querySelector('.user')
          var loginButton = document.querySelector('.login')
          var planButton = document.querySelector('.plan')

          loginButton.addEventListener('click', function(){
            app.login(userSelector.value)
            _load('user')
          })

          planButton.addEventListener('click', function(){
            _load('plan')
          })
        }
      }
    }

    return {
      load: _load
    }
  }

}(Murtimer || {}))
