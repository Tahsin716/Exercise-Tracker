'use strict'

const Exercise = require('../models/Exercise.js')
const User = require('../models/User.js')

exports.addUser = (req, res) => {
  const username = req.body.username

  if (username === '') {
    res.send('Username cannot be empty')
  } 
  else if (username.length > 10) {
    res.send('Username cannot be greater than 10 characters')
  }
  else {
    const newUser = new User({
      username,
    });

    newUser.save((err, data) => {
      if (err) {
        if (err.name === 'MongoError' && err.code === 11000) { 
          res.send('Duplicate username, try a different username');
        }
        else {
          res.send('Error occurred while saving user');
        }
      }
      else {
        res.json(data);
      }
    })
    
  }
}

exports.addExercise = (req, res) => {
  const username = req.body.username
  const description = req.body.description
  let duration = req.body.duration, date = req.body.date
  let userId

  if (username === undefined || description === undefined || duration === undefined) {
    res.send('Required Field(s) are missing.')
  }
  else if (username === '' || description === '' || duration === '') {
    res.send('Required Field(s) are blank.')
  }
  else if (username.length > 10) {
    res.send('Username cannot be greater than 10 characters')
  }
  else if (description.length > 100) {
    res.send('Description cannot be greater than 100 characters')
  }
  else if (isNaN(duration)) {
    res.send('Duration must be a number')
  }
  else if (Number(duration) > 1440) {
    res.send('Duration must be less than 1440 minutes (24 hours)')
  }
  else if (date !== '' && isNaN(Date.parse(date)) === true) {
    res.send('Date is not a valid date')
  }
  else {
    User.findOne({ username }, (err, user) => {
      if (err) {
        res.send('Error while searching for username, try again')
      }
      else if (!user) {
        res.send('Username not found')
      }
      else {
        userId = user.id
        duration = Number(duration)

        if (date === '') {
          date = new Date()
        }
        else {
          date = Date.parse(date)
        }

        const newExercise = new Exercise({
          userId,
          description,
          duration,
          date,
        })

        newExercise.save((errSave, data) => {
          if (errSave) {
            res.send('Error occurred while saving exercise')
          }
          else {
            res.json(data)
          }
        })
        
      }
    })
    
  }
}

exports.query = (req, res) => {
  const username = req.query.username
  
  let from = req.query.from, to = req.query.to, limit = req.query.limit;
  let userId
  
  const query = {}

  if (username === undefined) {
    res.send('Required Field(s) are missing.')
  }
  else if (username === '') {
    res.send('Required Field(s) are blank.')
  }
  else if (username.length > 10) {
    res.send('Username cannot be greater than 10 characters')
  }
  else if (from !== undefined && isNaN(Date.parse(from)) === true) {
    res.send('From is not a valid date')
  }
  else if (to !== undefined && isNaN(Date.parse(to)) === true) {
    res.send('From is not a valid date')
  }
  else if (limit !== undefined && isNaN(limit) === true) {
    res.send('Limit is not a valid number')
  }
  else if (limit !== undefined && Number(limit) < 1) {
    res.send('Limit must be greater than 0')
  }
  else {
    
    User.findOne({ username }, (err, user) => {
      if (err) {
        res.send('Error while searching for username, try again')
      }
      else if (!user) {
        res.send('Username not found')
      }
      else {
        userId = user.id
        query.userId = userId

        if (from !== undefined) {
          from = new Date(from)
          query.date = { $gte: from}
        }

        if (to !== undefined) {
          to = new Date(to);
          to.setDate(to.getDate() + 1)
          query.date = { $lt: to}
        }

        if (limit !== undefined) {
          limit = Number(limit)
        }

        Exercise.find(query).select('userId description date duration ').limit(limit).exec((errExercise, exercises) => {
          if (err) {
            res.send('Error while searching for exercises, try again')
          }
          else if (!user) {
            res.send('Exercises not found')
          }
          else {
            res.json(exercises)
          }
        })
        
      }
    })
    
  }
}