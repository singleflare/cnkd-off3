socket.on('buzzersReset', () => {
  $('#p1Slot').css('background', 'black')
  $('#p2Slot').css('background', 'black')
  $('#p3Slot').css('background', 'black')
  $('button').text('Chuông')
  $('button').prop('disabled', true)
})
socket.on('enableBuzzers', () => {
  $('button').prop('disabled', false)
})
socket.on('bonusTime', (time) => {
  $('button').text(time)
})
socket.on('buzzed', (data) => {
  if (data == 1) {
    $('#p1Slot').css('background', 'red')
  }
  else if (data == 2) {
    $('#p2Slot').css('background', 'yellow')
  }
  else if (data == 3) {
    $('#p3Slot').css('background', 'blue')
  }
})
socket.on('scoreboard', (data) => {
  $('#p1Slot p:nth-child(1)').text(data.p1Name);
  $('#p2Slot p:nth-child(1)').text(data.p2Name);
  $('#p3Slot p:nth-child(1)').text(data.p3Name);
  $('#p1Slot p:nth-child(2)').text(data.p1Score);
  $('#p2Slot p:nth-child(2)').text(data.p2Score);
  $('#p3Slot p:nth-child(2)').text(data.p3Score);
});