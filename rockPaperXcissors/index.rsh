'reach 0.1';

//enumerations used in winner function
const [ isHand, ROCK, PAPER, SCISSORS ] = makeEnum(3);//enumerations for the hands that may be played
const [ isOutcome, B_WINS, DRAW, A_WINS ] = makeEnum(3); //enumerations the outcomes of the game
//winner function 
const winner = (handAlice, handBob) =>
  ((handAlice + (4 - handBob)) % 3);
 //assertions
 assert(winner(ROCK,PAPER)==B_WINS);
 assert(winner(PAPER,ROCK) ==A_WINS);
 assert(winner(ROCK,ROCK)==DRAW);

 //loop assertions for each value entered fpr hand return valid outcome
 //variation of hands
 forall(UInt, handAlice =>
  forall(UInt, handBob =>
    assert(isOutcome(winner(handAlice, handBob)))));
 //loop through assertions for draw
 forall(UInt, (hand) =>
  assert(winner(hand, hand) == DRAW));
//Player interface
const Player = {
  ...hasRandom,// awaits frontend to provide acess to random numbers
  getHand: Fun([], UInt),
  seeOutcome: Fun([UInt], Null),
  informTimeout: Fun([], Null),// called when timeout occurs,llow the frontend to be informed that a timeout occurred
};


export const main = Reach.App(() => {
  //participant interact interface
  const Alice = Participant('Alice', {
    ...Player,
    wager: UInt,//atomic units of currency
    deadline: UInt, // time delta (blocks/rounds):value to use as a standard deadline throughout the program
  });
 
  const Bob   = Participant('Bob', {
    ...Player,
    acceptWager: Fun([UInt], Null),
  });
  init();//initialize contract after defining paricipants
   //informTimeout helper function 
   const informTimeout=()=>{ //defines the function as an arrow expression
    each([Alice,Bob] , ()=>{ //each of the participants perform a local step
      interact.informTimeout();//participants call informTimeout function
    });
  };
  
//alice declasify hand and wager
  Alice.only(() => {
    const wager = declassify(interact.wager);
    const deadline = declassify(interact.deadline);//Alice declassify and publish the deadline for later timeout clauses
  });
  //Alice publish wager,deadline
  Alice.publish(wager, deadline)
    .pay(wager);//pay inbuilt function to request wager
  commit();
// salt in the commitment, so that multiple commitments to the same value are not identical.

  Bob.only(() => { 
    interact.acceptWager(wager);//interact with acceptWager
    
  });
  Bob.pay(wager)//bob pay wager
        //timeout handler
    .timeout(relativeTime(deadline), () => closeTo(Alice, informTimeout));//if bob does Not complete action within timedelta ddeadline,app transitions to step gvn by arrow function
        //i.e closeTo:reach std lib function that allows anyone to send a message and transfer all of the funds in the contract to Alice
   //additional outcome fun
        var outcome = DRAW;
        invariant( balance() == 2 * wager && isOutcome(outcome) );
        while ( outcome == DRAW ) {
          commit();    
    //Alice can now reveal her secret
  Alice.only(() => {//alice mk commitment
    const _handAlice = interact.getHand();//compute handAlice without declassifing it
    const [_commitAlice,_saltAlice]=makeCommitment(interact,_handAlice);//compute a commitment to the handAlice
    const commitAlice = declassify(_commitAlice);//declassify Alice commitment
    
  });
  Alice.publish(commitAlice)
  .timeout(relativeTime(deadline), () => closeTo(Bob, informTimeout));
  commit()
   //knowledge assertation
  unknowable(Bob,Alice(_handAlice, _saltAlice));//states the knowledge assertion.
    Bob.only(() => {
      const handBob = declassify(interact.getHand());
    });
    Bob.publish(handBob)
      .timeout(relativeTime(deadline), () => closeTo(Alice, informTimeout));
    commit();

    Alice.only(() => {
      const saltAlice = declassify(_saltAlice);//new secret even for ame hand outpit
      const handAlice = declassify(_handAlice);
    });
    Alice.publish(saltAlice, handAlice)
      .timeout(relativeTime(deadline), () => closeTo(Bob, informTimeout));
    checkCommitment(commitAlice, saltAlice, handAlice);//confitm if values same                                           

    outcome = winner(handAlice, handBob);
    continue;
  }
  //determine transfer of funds
  
  assert(outcome == A_WINS || outcome == B_WINS);
  transfer(2 * wager).to(outcome == A_WINS ? Alice : Bob);
  commit();
//share outcome to frontend
  each([Alice, Bob], () => {
    interact.seeOutcome(outcome);
  });
});