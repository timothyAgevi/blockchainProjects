import { loadStdlib,ask } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib(process.env);
//create accounts
const startingBalance = stdlib.parseCurrency(100);
const accAlice = await stdlib.newTestAccount(startingBalance);
const accBob = await stdlib.newTestAccount(startingBalance);
//acc balances
const fmt = (x) => stdlib.formatCurrency(x, 4);//convert currency to user understandable form
const getBalance = async (who) => fmt(await stdlib.balanceOf(who));//getBalance function
//acc balances before transaction
const beforeAlice = await getBalance(accAlice);
const beforeBob = await getBalance(accBob);
//contracts
const ctcAlice = accAlice.contract(backend);
const ctcBob = accBob.contract(backend, ctcAlice.getInfo());
//interact for Player Interface
const HAND = ['Rock', 'Paper', 'Scissors'];
const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];
//constructor(player interact object) for Player interface
const Player = (Who) => ({
  ...stdlib.hasRandom,//allows each participant's Reach code to generate random numbers
  // getHand: () => {
  //   const hand = Math.floor(Math.random() * 3);
  //   console.log(`${Who} played ${HAND[hand]}`);
  //   return hand;
  // },
  getHand: async () => { // <-- async now
    const hand = Math.floor(Math.random() * 3);
    console.log(`${Who} played ${HAND[hand]}`);
    if ( Math.random() <= 0.01 ) {//change the threshold so that timeouts only happen 1% of the time
      for ( let i = 0; i < 10; i++ ) {
        console.log(`  ${Who} takes their sweet time sending it back...`);
        await stdlib.wait(1);
      }
    }
    return hand;
  },

  seeOutcome: (outcome) => {
    console.log(`${Who} saw outcome ${OUTCOME[outcome]}`);
  },
  informTimeout: () => {
    console.log(`${Who} observed a timeout`);
  },
});

await Promise.all([
  ctcAlice.p.Alice({ //instead of backend.Alice
    ...Player('Alice'),
    wager: stdlib.parseCurrency(5),
    deadline:10//Alice specify a deadline of ten blocks.
  }),
  ctcBob.p.Bob({//instead of backend.Bob
    ...Player('Bob'),
    //Lines 42 through 51 redefine Bob's acceptWager method as an asynchronous function, where half of the time it will take at least ten blocks on the Ethereum network by waiting for ten units of time to pass. We know that ten is the value of deadline, so this will cause a timeout
    acceptWager: (amt) => {
      console.log(`Bob accepts the wager of ${fmt(amt)}.`);
    }, 
  }),
]);
//balance after transaction
const afterAlice = await getBalance(accAlice);
const afterBob = await getBalance(accBob);
//print balance before and after transaction
console.log(`Alice went from ${beforeAlice} to ${afterAlice}.`);
console.log(`Bob went from ${beforeBob} to ${afterBob}.`);