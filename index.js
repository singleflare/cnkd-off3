const express = require('express');
const {createServer} = require('node:http');
const app = express();
const server=createServer(app)
const {Server}=require('socket.io')
const io=new Server(server)
server.listen(3000)
const { join } = require('node:path');

app.use(express.static('public'))

let puzzle=[]
let solvedPuzzle=[]
let puzzleState=[]
let buzzed=[]
let puzzleMode=1
let tossupInterval=null
let bonusTimeInterval=null
let bonusTime=0

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

io.on('connection',(socket)=>{
  socket.on('buzz',(data)=>{
    buzzed.push(data)
    if(buzzed.length==1){
      io.emit('playSound', './sounds/ding.wav')
      console.log(buzzed)
      clearInterval(tossupInterval)
      clearInterval(bonusTimeInterval)
      io.emit('buzzed',buzzed[0])
    }
  })
  socket.on('resetBuzzers',()=>{
    buzzed=[]
    io.emit('buzzersReset')
  })
  socket.on('puzzle',(data)=>{
    io.emit('resetPuzzle')
    puzzle=data.puzzle
    solvedPuzzle=data.solved
    for(let i=0;i<64;i++){
      if(puzzle[i]=='') puzzleState[i]=0
      else if(puzzle[i]=='?'||puzzle[i]=='-'||puzzle[i]=='!'||puzzle[i]=='.'||puzzle[i]==','||puzzle[i]=="&"||puzzle[i]=='/') puzzleState[i]=4
      else puzzleState[i]=1
    }
  })
  socket.on('revealPuzzle',()=>{
    io.emit('playSound', './sounds/moochu.mp3')
    let openSequence=[
    [0,1,16,17,32,33,48,49],
    [2,3,18,19,34,35,50,51],
    [4,5,20,21,36,37,52,53],
    [6,7,22,23,38,39,54,55],
    [8,9,24,25,40,41,56,57],
    [10,11,26,27,42,43,58,59],
    [12,13,28,29,44,45,60,61],
    [14,15,30,31,46,47,62,63]
    ]
    let i=0
    let interval=setInterval(()=>{
      for(let idx of openSequence[i]){
        if(puzzleState[idx]==1) {
          io.emit('reveal',{index:idx,state:1,letter:''})
        }
        if(puzzle[idx]=='?'||puzzle[idx]=='-'||puzzle[idx]=='!'||puzzle[idx]=='.'||puzzle[idx]==','||puzzle[idx]=="&"||puzzle[idx]=='/') {
          io.emit('reveal',{index:idx,state:4,letter:puzzle[idx]})
        }
      }
      i++
      if(i==8) clearInterval(interval)
    },200)
  })
  socket.on('reveal',(idx)=>{
    if(puzzleMode==0) {
      if(puzzleState[idx]==1) {
        puzzleState[idx]=3
        io.emit('disableLetterBtn',idx)
      }
    }
    else{
      if(puzzleState[idx]==1) {
        puzzleState[idx]=2
      }
      else if(puzzleState[idx]==2) {
        puzzleState[idx]=3
        io.emit('disableLetterBtn',idx)
      }
    }
    console.log(idx, puzzleState[idx], puzzle[idx])
    io.emit('reveal',{index:idx,state:puzzleState[idx],letter:puzzle[idx]})
  })
  socket.on('solvePuzzle',()=>{
    io.emit('buzzersReset')
    io.emit('playSound', './sounds/giaiochu.mp3')
    let idxToOpen=[]
    for(let i=0;i<64;i++){
      if(puzzleState[i]==1) puzzleState[i]=3
      if(puzzleState[i]==3) idxToOpen.push(i)
    }
    io.emit('solvePuzzle',{idxToOpen,solvedPuzzle})
  })
  socket.on('solvePuzzleNoSound',()=>{
    io.emit('buzzersReset')
    let idxToOpen=[]
    for(let i=0;i<64;i++){
      if(puzzleState[i]==1) puzzleState[i]=3
      if(puzzleState[i]==3) idxToOpen.push(i)
    }
    io.emit('solvePuzzle',{idxToOpen,solvedPuzzle})
  })
  socket.on('resetPuzzle',()=>{
    puzzle=[]
    solvedPuzzle=[]
    puzzleState=[]
    io.emit('resetPuzzle')
  })
  socket.on('puzzleMode',(data)=>{
    puzzleMode=data
  })
  socket.on('openRandomTossup',()=>{
    io.emit('enableBuzzers')
    let idxToOpen=[]
    for(let i=0;i<64;i++){
      if(puzzleState[i]==1) idxToOpen.push(i)
    }
    shuffleArray(idxToOpen)
    console.log(idxToOpen)
    let i=0
    tossupInterval = setInterval(()=>{
      if(i>=idxToOpen.length) clearInterval(tossupInterval)
      else {
        const idx = idxToOpen[i]
        io.emit('reveal',{index:idx,state:3,letter:puzzle[idx]})
        io.emit('disableLetterBtn',idx)
        i++
      }
    },1000)
  })
  socket.on('openRandomTossupWithTime',()=>{
    io.emit('enableBuzzers')
    io.emit('bonusTime',bonusTime)
    bonusTimeInterval=setInterval(()=>{
      io.emit('bonusTime',--bonusTime)
      if(bonusTime==0) {
        clearInterval(tossupInterval)
        clearInterval(bonusTimeInterval)
      }
    },1000)
    let idxToOpen=[]
    for(let i=0;i<64;i++){
      if(puzzleState[i]==1) idxToOpen.push(i)
    }
    shuffleArray(idxToOpen)
    console.log(idxToOpen)
    let i=0
    tossupInterval = setInterval(()=>{
      if(i>=idxToOpen.length) clearInterval(tossupInterval)
      else {
        const idx = idxToOpen[i]
        io.emit('reveal',{index:idx,state:3,letter:puzzle[idx]})
        io.emit('disableLetterBtn',idx)
        i++
      }
    },1000)
  })
  socket.on('stopOpenRandomTossup',()=>{
    clearInterval(tossupInterval)
    clearInterval(bonusTimeInterval)
  })
  socket.on('startTossUpBonus',()=>{
    io.emit('enableBuzzers')
    bonusTimeInterval=setInterval(()=>{
      io.emit('bonusTime',--bonusTime)
      if(bonusTime==0) {
        clearInterval(tossupInterval)
        clearInterval(bonusTimeInterval)
      }
    },1000)
    let idxToOpen=[]
    for(let i=0;i<64;i++){
      if(puzzleState[i]==1) {
        idxToOpen.push(i)
        if(puzzle[i]=='N'||puzzle[i]=='H'||puzzle[i]=='A'||puzzle[i]=='?'||puzzle[i]=='-'||puzzle[i]=='!'||puzzle[i]=='.'||puzzle[i]==','||puzzle[i]=="&"||puzzle[i]=='/') {
          puzzleState[i]=4
          io.emit('reveal',{index:i,state:4,letter:puzzle[i]})
          io.emit('disableLetterBtn',i)
          idxToOpen.pop()
        }
        io.emit('reveal',{index:i,state:1})
      }
    }
    shuffleArray(idxToOpen)
    console.log(idxToOpen)
    let i=0
    tossupInterval = setInterval(()=>{
      if(i>=idxToOpen.length) clearInterval(tossupInterval)
      else {
        const idx = idxToOpen[i]
        io.emit('reveal',{index:idx,state:3,letter:puzzle[idx]})
        io.emit('disableLetterBtn',idx)
        i++
      }
    },1000)
  })
  socket.on('setBonusTime',(time)=>{
    bonusTime=time
    io.emit('bonusTime',time)
    clearInterval(bonusTimeInterval)
  })
  socket.on('playSound',url=>{
    io.emit('playSound',url)
  })
  socket.on('stopAllSounds',()=>{
    io.emit('stopAllSounds')
  })
})