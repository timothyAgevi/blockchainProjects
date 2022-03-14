import {loadStdlib}from '@reach-sh/stdlib';
import * as backend from './build/index.default.mjs';

const stdlib =loadStdlib(process.env);

(async ()=>{
const startingBalance=stdlib.parseCurrency(10);
//accounts
const accAlice=await stdlib.newTestAccount(startingBalance)
const accBob=await stdlib.newTestAccount(startingBalance)
//contracts
const ctcAlice =accAlice.contract(backend)
const ctcBob =accAlice.contract(backend,ctcAlice.getInfo())

//player interface 0 ,1,2
const HAND =['Rock','Paper','Scissors']
const OUTCOME =['Bob wins','Draw','Alice wins']
//logic to play game ,use constructor to hve player object for both
const Player=(who)=>({
    getHand:()=>{
      const hand =Math.floor(Math.random()*3)
      console.log(`${who} played${HAND[hand]}`)//HAND to hand
      return hand
    },
    seeOutcome:(outcome)=>{
       console.log(`${who} saw outcome ${OUTCOME[outcome]}`)
    }

})

await Promise.all([
    backend.Alice(ctcAlice ,{
    ...Player('Alice')
    }),
    backend.Bob(ctcBob,{
        //implements Bob interact object
        ...Player('Alice'),
    })
])

}) ();