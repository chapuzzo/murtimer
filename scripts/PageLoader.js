'use strict'

!(function(ns){

  ns.PageLoader = function(containerSelector, app){

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
            app.logout()
            _load('login')
          })

          var nameElement = document.querySelector('.header span.name')
          nameElement.innerHTML = app.currentUser()
        },
        bindEvents: function(app){
          var cellElements = document.querySelectorAll('.timetable .cell')
          var priorityElements = document.querySelectorAll('.priorities .cell')

          var triggers = {
            toggle: function(event){
              event.preventDefault()

              var selectedDuty = this.dataset.duty
              var selectedDay = this.dataset.day

              app.toggleUserSelection(selectedDay, selectedDuty)
            },

            selectPriority: function(event){
              event.preventDefault()

              var selectedPriority = this.dataset.priority

              app.selectPriority(selectedPriority)
            }
          }

          _.forEach(cellElements, function(cellElement){
            // cellElement.addEventListener('touchstart', triggers.toggle, false)
            cellElement.addEventListener('click', triggers.toggle, false)
          })

          _.forEach(priorityElements, function(priorityElement){
            // priorityElement.addEventListener('touchstart', triggers.selectPriority, false)
            priorityElement.addEventListener('click', triggers.selectPriority, false)
          })

          app.drawUserSelections()
        }
      },
      check: {
        url: 'pages/user.html',
        header: 'pages/header.html',
        bindHeaderEvents: function(app){
          var saveButton = document.querySelector('.save')

          saveButton.addEventListener('click', function(){
            app.saveUserSelections()
          })

          var exitButton = document.querySelector('.logout')

          exitButton.addEventListener('click', function(){
            app.logout()
            _load('login')
          })

          var nameElement = document.querySelector('.header span.name')
          nameElement.innerHTML = app.currentUser()
          saveButton.remove()
        },
        bindEvents: function(app){
          app.drawUserSelections()
          app.drawUserShifts()
        }
      },

      plan: {
        url: 'pages/admin.html',
        header: 'pages/header.html',
        bindHeaderEvents: function(app){
          var saveButton = document.querySelector('.save')

          saveButton.addEventListener('click', function(){
            app.saveShifts()
          })

          var exitButton = document.querySelector('.logout')

          exitButton.addEventListener('click', function(){
            app.logout()
            _load('login')
          })

          var nameElement = document.querySelector('.header div')
          nameElement.remove()
        },
        bindEvents: function(){
          app.drawShiftAssigner()
          app.drawStoredShifts()
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

          var userSelector = document.querySelector('.user')
          var loginButton = document.querySelector('.login')
          var planButton = document.querySelector('.plan')
          var checkButton = document.querySelector('.check')

          loginButton.addEventListener('click', function(){
            app.login(userSelector.value)
            _load('user')
          })

          planButton.addEventListener('click', function(){
            _load('plan')
          })

          checkButton.addEventListener('click', function(){
            app.login(userSelector.value)
            _load('check')
          })
        }
      }
    }

    return {
      load: _load
    }
  }

}(Murtimer || {}))
