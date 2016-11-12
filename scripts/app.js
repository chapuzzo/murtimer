'use strict'

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

var pages = {
  user: {
    url: '/user.html',
    binding: function(){
      var cellElements = document.querySelectorAll('.timetable .cell')
      var priorityElements = document.querySelectorAll('.priorities .cell')
      var saveButton = document.querySelector('.save')

      drawSelections(userSelections)

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
        var selections = storage.json('selections', {})
        var currentUser = storage.retrieve('current-user')

        selections[currentUser] = userSelections
        console.log(selections)

        storage.save('selections', selections )
      })
    }
  },

  admin: {
    url: 'admin.html',
    binding: function(){
      var selections = storage.json('selections', {})

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
    }
  },

  login: {
    url: 'login.html',
    binding: function(){
      var userSelector = document.querySelector('.user')
      var loginButton = document.querySelector('.login')

      loginButton.addEventListener('click', function(){
        storage.save('current-user', userSelector.value)
        pageLoader.load('user')
      })
    }
  }
}

var PageLoader = function(pages, containerSelector){

  return {
    load: function(name){
      console.log('loading page: ' + name)

      var pageToLoad = pages[name]

      if (!pageToLoad){
        console.error(name + ' is not a page which can be loaded')
        return
      }

      var request = new XMLHttpRequest()

      request.open('GET', pageToLoad.url, true)

      request.addEventListener('load', function() {
        if (this.status == 200) {
          var textResponse = this.responseText

          document.querySelector(containerSelector).innerHTML = textResponse

          pageToLoad.binding()
        }
      })

      request.send()
    }
  }
}

var pageLoader = PageLoader(pages, '.container')

document.addEventListener('DOMContentLoaded', function(){
  pageLoader.load('login')
})
