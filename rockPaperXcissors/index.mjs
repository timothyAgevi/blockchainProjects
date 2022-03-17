import { loadStdlib } from '@reach-sh/stdlib';
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
//constructor for Player interface
const Player = (Who) => ({
  ...stdlib.hasRandom,//allows each participant's Reach code to generate random numbers
  getHand: () => {
    const hand = Math.floor(Math.random() * 3);
    console.log(`${Who} played ${HAND[hand]}`);
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
    acceptWager: async (amt) => { // <-- async now
      if ( Math.random() <= 0.5 ) {
        for ( let i = 0; i < 10; i++ ) {
          console.log(`  Bob takes his sweet time...`);
          await stdlib.wait(1);
        }
      } else {
        console.log(`Bob accepts the wager of ${fmt(amt)}.`);
      }
    },
  

  }),
]);
//balance after transaction
const afterAlice = await getBalance(accAlice);
const afterBob = await getBalance(accBob);
//print balance before and after transaction
console.log(`Alice went from ${beforeAlice} to ${afterAlice}.`);
console.log(`Bob went from ${beforeBob} to ${afterBob}.`);