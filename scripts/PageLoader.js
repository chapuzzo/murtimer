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
        },
        bindEvents: function(app){
          var cellElements = document.querySelectorAll('.timetable .cell')
          var priorityElements = document.querySelectorAll('.priorities .cell')

          var nameElement = document.querySelector('.header span.name')
          nameElement.innerHTML = app.currentUser()

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

      admin: {
        url: 'pages/admin.html',
        bindEvents: function(){/*
          var selections = app.json('selections', {})

          _.forEach(selections, function(userSelections, userName){
            _.forEach(userSelections, function(selections, priority){
              _.forEach(selections, function(selection){
                var person = document.createElement('div')

                person.classList.add('cell')
                person.classList.add('full-width')

                person.innerHTML = userName
                person.dataset.priority = priority
                var currentSelectionQuery = '.cell[data-day="'+selection.day+'"][data-duty="'+selection.duty+'"]'

                var desiredDuty = document.querySelector(currentSelectionQuery)

                desiredDuty.appendChild(person)
              })
            })
          })
        */}
      },

      login: {
        url: 'pages/login.html',
        bindEvents: function(app){
          console.log(arguments)
          var userSelector = document.querySelector('.user')
          var loginButton = document.querySelector('.login')

          loginButton.addEventListener('click', function(){
            console.log(this)
            console.log(app)

            app.login(userSelector.value)
            _load('user')
          })
        }
      }
    }

    return {
      load: _load
    }
  }

}(Murtimer || {}))
