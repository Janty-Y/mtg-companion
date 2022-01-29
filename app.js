function Player(pName, dName) {
  this.playerName = pName;
  this.deckName = dName;
  this.totalLife = 20;
  this.lifeArray = [];
  this.poisonCounters = 0;
  this.cannotWin = false;
  this.cannotLose = false;
}

const p1 = new Player('Player 1', 'Deck Name');
const p2 = new Player('Player 2', 'Deck Name');

let currentLogs = JSON.parse(localStorage.getItem('matchLogs') || '[]');
let winner = null;

newGame();

function newGame() {
  $('.player.p1').html(
    p1.playerName.toUpperCase() + '<hr>' + p1.deckName.toUpperCase()
  );
  $('.player.p2').html(
    p2.playerName.toUpperCase() + '<hr>' + p2.deckName.toUpperCase()
  );
  $('.p1.life-count').text(p1.totalLife);
  $('.p2.life-count').text(p2.totalLife);
  $('span.p1-poison').text(p1.poisonCounters);
  $('span.p2-poison').text(p2.poisonCounters);
}

// loads custom player/deck names from user input
function playerDetails() {
  p1.playerName = $('#p1-name').prop('value') || 'Player 1';
  p1.deckName = $('#p1-deck-name').prop('value') || 'Deck Name';
  p2.playerName = $('#p2-name').prop('value') || 'Player 2';
  p2.deckName = $('#p2-deck-name').prop('value') || 'Deck Name';

  resetCounts();
  newGame();
}

function clearNames() {
  $('#p1-name').prop('value', '');
  $('#p1-deck-name').prop('value', '');
  $('#p2-name').prop('value', '');
  $('#p2-deck-name').prop('value', '');
}

$('#reset-game').click(function () {
  resetCounts();
  newGame();
});

// resets the game to default settings, except for player/deck names
function resetCounts() {
  p1.totalLife = 20;
  p1.lifeArray = [];
  p1.poisonCounters = 0;
  p1.cannotLose = false;
  p1.cannotWin = false;

  p2.totalLife = 20;
  p2.lifeArray = [];
  p2.poisonCounters = 0;
  p2.cannotLose = false;
  p2.cannotWin = false;

  winner = null;

  $('input:checkbox').prop('checked', false);
  $('span.life-history-scroll').text('');
  $('div.results').text('');
  $('.log-buttons').text('');

  resetTimer();
}

function logButton() {
  $('.log-buttons').html(
    " <button class='btn btn-secondary save-button' onclick='matchLog()'>Save Log</button>"
  );
}

// called whenever a game change can result in a winner.
// will stop the timer, set a winner, and allow to log the match
// will revert the above changes if a winner was seleted by accident
// i.e. if a player's health went to 0 by mistake, increasing it above 0 will
// return the state of an active game.
function checkIfWinner() {
  if (
    !p2.cannotWin &&
    !p1.cannotLose &&
    (p1.totalLife <= 0 || p1.poisonCounters >= 10)
  ) {
    $('div.results').text(p2.playerName + ' Wins!');
    stopped = true;
    winner = p2.playerName;
    logButton();
  } else if (
    !p1.cannotWin &&
    !p2.cannotLose &&
    (p2.totalLife <= 0 || p2.poisonCounters >= 10)
  ) {
    $('div.results').text(p1.playerName + ' Wins!');
    stopped = true;
    winner = p1.playerName;

    logButton();
  } else {
    stopped = false;
    winner = null;
    $('div.results').text('');
    $('.log-buttons').text('');
  }
}

// logic to save games to view for future reference
function matchLog() {
  let currentMatch = {
    p1Log: { ...p1 },
    p2Log: { ...p2 },
    results: winner + ' won this match.',
    duration: displayHours + ':' + displayMinutes + ':' + displaySeconds,
  };

  currentLogs.push(currentMatch);
  localStorage.setItem('matchLogs', JSON.stringify(currentLogs));
}

// Controls Poison Counter Total
// if a player has more than 10 poison counters, they lose the game
// poison counters cannot go into negative

// for decreasing poison counters
$('button.psn-down').click(function () {
  let player = $(this).attr('value');
  if (player === 'p1' && p1.poisonCounters > 0) {
    p1.poisonCounters--;
    $('span.p1-poison').text(p1.poisonCounters);
  } else if (player === 'p2' && p2.poisonCounters > 0) {
    p2.poisonCounters--;
    $('span.p2-poison').text(p2.poisonCounters);
  }
  checkIfWinner();
});

// for increasing poison counters
$('button.psn-up').click(function () {
  let player = $(this).attr('value');

  if (player === 'p1') {
    p1.poisonCounters++;
    $('span.p1-poison').text(p1.poisonCounters);
  } else if (player === 'p2') {
    p2.poisonCounters++;
    $('span.p2-poison').text(p2.poisonCounters);
  }
  checkIfWinner();
});

// Controls the cannot win/cannot lose logic
$('input:checkbox').click(function () {
  let status = $(this).attr('id');

  switch (status) {
    case 'p1CannotWin':
      p1.cannotWin = !p1.cannotWin;
      break;
    case 'p1CannotLose':
      p1.cannotLose = !p1.cannotLose;
      break;
    case 'p2CannotWin':
      p2.cannotWin = !p2.cannotWin;
      break;
    case 'p2CannotLose':
      p2.cannotLose = !p2.cannotLose;
      break;
    default:
      console.log('error with checkbox!');
      break;
  }

  checkIfWinner();
});

// Controls "Heart" button logic
// updates life totals and prints value to screen
let p1ClickTotal = 0;
let p2ClickTotal = 0;

$('button.heart').click(function () {
  let player = $(':first-child', this).attr('value');
  let amount = $(':first-child', this).text();

  if (player === 'p1') {
    p1.totalLife += Number(amount);
    p1ClickTotal += Number(amount);
    $('.' + player + '.life-count').text(p1.totalLife);
  } else if (player === 'p2') {
    p2.totalLife += Number(amount);
    p2ClickTotal += Number(amount);
    $('.' + player + '.life-count').text(p2.totalLife);
  }

  delayedLifeHistory(player);
  checkIfWinner();
});

// if the user clicks a heart multiple times, this function allows the history
// to show it as a total number of life loss/gain in short bursts
// i.e. clicking -1 4 times in a row will show "-4" instead of "-1 -1 -1 -1"
function delayedLifeHistory(player) {
  setTimeout(function () {
    if (p1ClickTotal != 0 && player === 'p1') {
      if (p1ClickTotal > 0) {
        p1ClickTotal = '+' + p1ClickTotal;
      }
      p1.lifeArray.push(p1ClickTotal);
      $('span.life-history-scroll.hp1').append(
        p1.lifeArray[p1.lifeArray.length - 1] + '<br>'
      );
      p1ClickTotal = 0;
    }
    if (p2ClickTotal != 0 && player === 'p2') {
      if (p2ClickTotal > 0) {
        p2ClickTotal = '+' + p2ClickTotal;
      }
      p2.lifeArray.push(p2ClickTotal);
      $('span.life-history-scroll.hp2').append(
        p2.lifeArray[p2.lifeArray.length - 1] + '<br>'
      );
      p2ClickTotal = 0;
    }
  }, 2000);
}

// ************************ MATCH LOG MODAL ********************
function viewLogs() {
  if (currentLogs.length > 0) {
    $('.display-match-logs').text('');
    currentLogs.forEach(function (i) {
      $('.display-match-logs').append(
        i.p1Log.playerName +
          ' vs ' +
          i.p2Log.playerName +
          '<br>' +
          i.p1Log.deckName +
          ' - ' +
          i.p2Log.deckName +
          '<br>' +
          i.p1Log.totalLife +
          '   <i class="fas fa-heart heart"></i>   ' +
          i.p2Log.totalLife +
          '<br>' +
          i.p1Log.poisonCounters +
          ' <i class="fas fa-skull-crossbones"></i> ' +
          i.p2Log.poisonCounters +
          '<br>' +
          i.results +
          '<br>' +
          'Match time: ' +
          i.duration +
          '<hr><br>'
      );
    });
  } else {
    $('.display-match-logs').text('');
    $('.display-match-logs').append('<h2>No Match History Found</h2>');
  }
}

function clearHistory() {
  localStorage.clear();
  currentLogs = [];
  viewLogs();
}

// ************************ STOP WATCH *************************

let seconds = 0;
let minutes = 0;
let hours = 0;
let displaySeconds = 0;
let displayMinutes = 0;
let displayHours = 0;

let interval = null;
let stopped = true;

function stopWatch() {
  if (stopped === false) {
    seconds++;

    if (seconds / 60 === 1) {
      seconds = 0;
      minutes++;

      if (minutes / 60 === 1) {
        minutes = 0;
        hours++;
      }
    }

    //makes the display 2 digits
    if (seconds < 10) {
      displaySeconds = '0' + seconds.toString();
    } else {
      displaySeconds = seconds;
    }

    if (minutes < 10) {
      displayMinutes = '0' + minutes.toString();
    } else {
      displayMinutes = minutes;
    }

    if (hours < 10) {
      displayHours = '0' + hours.toString();
    } else {
      displayHours = hours;
    }

    //display updated time values to user
    $('.game-time').text(
      displayHours + ':' + displayMinutes + ':' + displaySeconds
    );
  }
}

function startStop() {
  if (stopped === false) {
    window.clearInterval(interval);
    $('.time-button').text('Start');
    stopped = true;
  } else {
    interval = window.setInterval(stopWatch, 1000);
    $('.time-button').text('Stop');
    stopped = false;
  }
}

//function to reset the stopwatch and game states
function resetTimer() {
  window.clearInterval(interval);
  seconds = 0;
  minutes = 0;
  hours = 0;
  stopped = true;
  $('.time-button').text('Start');
  $('.game-time').text('00:00:00');
}
