'use strict'

!(function(ns){}(Murtimer))

document.addEventListener('DOMContentLoaded', function(){
  var allowedPriorities = {
    cant: 4,
    dontwant: 4,
    can: 14,
    want: 4
  }

  var storage = Storage(localStorage)
  var weekPlanner = Murtimer.WeekPlanner(allowedPriorities, 'want', storage)

  var pageLoader = Murtimer.PageLoader('.container', weekPlanner)

  pageLoader.load('login')
})
