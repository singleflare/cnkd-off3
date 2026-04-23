$(function () {
  for (let i = 0; i <= 63; i++) {
    if (i == 0 || i == 15 || i == 48 || i == 63) $('#board').append('<div class="letter" id="letter' + i + '" style="opacity:0;"><p></p></div>');
    else {
      $('#board').append('<div class="letter" id="letter' + i + '"><p></p></div>');
    }
  }
})

function playSound(url) {
  const sound = new Howl({
    src: [url]
  });
  sounds.push(sound)
  sound.play();
}
let sounds=[]
socket.on('playSound',url=>{
  playSound(url)
})
socket.on('stopAllSounds',()=>{
  for(let sound of sounds) {
    sound.stop()
  }
  sounds=[]
})

socket.on('reveal', (data) => {
  if (data.state == 0) {
    $('#letter' + data.index).removeClass('waitToOpen timer shown')
  }
  else if (data.state == 1) {
    $('#letter' + data.index).removeClass('waitToOpen timer shown').addClass('shown');
  }
  else if (data.state == 2) {
    playSound('./sounds/letter_highlight_new.wav');
    $('#letter' + data.index).removeClass('waitToOpen timer shown').addClass('waitToOpen');
  }
  else if (data.state == 3) {
    playSound('./sounds/letter_open.wav');
    $('#letter' + data.index).removeClass('waitToOpen timer shown').addClass('shown');
    $('#letter' + data.index + ' p').addClass('animated')
    $('#letter' + data.index + ' p').text(data.letter);
  }
  else if (data.state == 4) {
    $('#letter' + data.index).removeClass('waitToOpen timer shown').addClass('shown');
    $('#letter' + data.index + ' p').text(data.letter);
  }
})

socket.on('solvePuzzle', data => {
  console.log(data);
  let i=0
  let interval = setInterval(() => {
    $('#letter' + data.idxToOpen[i] + ' p').text(data.solvedPuzzle[data.idxToOpen[i]]);
    i++
    if (i >= data.idxToOpen.length) clearInterval(interval)
  }, 10)
})
socket.on('resetPuzzle', () => {
  for (let i = 0; i <= 63; i++) {
    $('#letter' + i).removeClass('waitToOpen shown timer');
    $('#letter' + i + ' p').text('');
    $('#letter' + i + ' p').removeClass('animated')
  }
})