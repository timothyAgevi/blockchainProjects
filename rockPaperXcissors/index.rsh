'reach 0.1';
//Player interface
const Player = {
  getHand: Fun([], UInt),
  seeOutcome: Fun([UInt], Null),
};

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