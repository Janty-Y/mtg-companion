function Player(pName, dName) {
  this.playerName = pName;
  this.deckName = dName;
  this.totalLife = 20;
  this.poisonCounters = 0;
  this.cannotWin = false;
  this.cannotLose = false;
}

const p1 = new Player('Player 1', 'Deck Name');
const p2 = new Player('Player 2', 'Deck Name');

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

function resetCounts() {
  p1.totalLife = 20;
  p1.poisonCounters = 0;
  p1.cannotLose = false;
  p1.cannotWin = false;

  p2.totalLife = 20;
  p2.poisonCounters = 0;
  p2.cannotLose = false;
  p2.cannotWin = false;

  $('input:checkbox').prop('checked', false);

  $('div.results').text('');
}

function checkIfWinner() {
  if (
    !p2.cannotWin &&
    !p1.cannotLose &&
    (p1.totalLife <= 0 || p1.poisonCounters >= 10)
  ) {
    $('div.results').text(p2.playerName + ' Wins!');
  } else if (
    !p1.cannotWin &&
    !p2.cannotLose &&
    (p2.totalLife <= 0 || p2.poisonCounters >= 10)
  ) {
    $('div.results').text(p1.playerName + ' Wins!');
  } else {
    $('div.results').text('');
  }
}

// Controls Poison Counter Total
// if a player has more than 10 poison counters, they lose the game
// poison counters cannot go into negative

// for decreasing poison counters
$('button.psn-down').click(function () {
  var player = $(this).attr('value');
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
  var player = $(this).attr('value');

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
  var status = $(this).attr('id');

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
      console.log('error with checkbox');
      break;
  }

  checkIfWinner();
});

// Controls "Heart" button logic
// updates life totals and prints value to screen
// determines winner of game if a player's life is <= 0
$('button.heart').click(function () {
  var player = $(':first-child', this).attr('value');
  var amount = $(':first-child', this).text();

  if (player === 'p1') {
    p1.totalLife += Number(amount);
    $('.' + player + '.life-count').text(p1.totalLife);
  } else if (player === 'p2') {
    p2.totalLife += Number(amount);
    $('.' + player + '.life-count').text(p2.totalLife);
  }

  checkIfWinner();
});
