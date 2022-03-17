'reach 0.1';
//Player interface
const Player = {
  ...hasRandom,//each frontend can provide acess to random numbers
  getHand: Fun([], UInt),
  seeOutcome: Fun([UInt], Null),
};
//enumerations used in winner function
const [ isHand, ROCK, PAPER, SCISSORS ] = makeEnum(3);//enumerations for the hands that may be played
const [ isOutcome, B_WINS, DRAW, A_WINS ] = makeEnum(3); //enumerations the outcomes of the game
//winner function 
const winner = (handAlice, handBob) =>
  ((handAlice + (4 - handBob)) % 3);
 //assertions
 assert(winner(ROCK,PAPER)==B_WINS);
 assert(winner(PAPER,ROCK) ==A_WINS)
 assert(winner(ROCK,ROCK)==DRAW);

 //loop assertions for each value entered fpr hand return valid outcome
 //variation of hands
 forall(UInt, handAlice =>
  forall(UInt, handBob =>
    assert(isOutcome(winner(handAlice, handBob)))));
 //loop through assertions for draw
 forall(UInt, (hand) =>
  assert(winner(hand, hand) == DRAW));

export const main = Reach.App(() => {
  const Alice = Participant('Alice', {
    ...Player,
    wager: UInt,
  });
  const Bob   = Participant('Bob', {
    ...Player,
    acceptWager: Fun([UInt], Null),
  });
  init();//initialize contract after defining paricipants
//alice declasify hand and wager
  Alice.only(() => {
    const wager = declassify(interact.wager);
    const handAlice = declassify(interact.getHand());
  });
  //Alice publish wager and hand
  Alice.publish(wager, handAlice)
    .pay(wager);//pay inbuilt function to request wager
  commit();

  Bob.only(() => { 
    interact.acceptWager(wager);//interact with acceptWager
    const handBob = declassify(interact.getHand());
  });
  Bob.publish(handBob)//bob publish his hand
    .pay(wager);
//calculate outcome
  const outcome = (handAlice + (4 - handBob)) % 3;
  //determine transfer of funds
  const            [forAlice, forBob] =
    outcome == 2 ? [       2,      0] :
    outcome == 0 ? [       0,      2] :
    /* tie      */ [       1,      1];
  transfer(forAlice * wager).to(Alice);
  transfer(forBob   * wager).to(Bob);
  commit();
//share outcome to frontend
  each([Alice, Bob], () => {
    interact.seeOutcome(outcome);
  });
});