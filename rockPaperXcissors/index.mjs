import {loadStdlib}from '@reach-sh/stdlib';
import * as backend from './build/index.default.mjs';

const stdlib =loadStdlib(process.env);

(async ()=>{
const startingBalance=stdlib.parseCurrency(10);
//accounts
const accAlice=await stdlib.newTestAccount(startingBalance)
const accBob=await stdlib.newTestAccount(startingBalance)
//contracts
const ctcAlice =accAlice.deploy(backend)
const ctcBob =accAlice.contract(backend,ctcAlice.getInfo())

//player interface 0 ,1,2
const Hand =['Rock','Paper','Scissors']
const OUTCOME =['Bob wins','Draw','Alice wins']
//logic to play game 
const Player=(who)=>({
    
})

await Promise.all([
    backend.Alice(ctcAlice,{
//Alince interface
    }),
    backend.Bob(ctcBob,{
        //implements Bob interact object
    })
])

}) ();