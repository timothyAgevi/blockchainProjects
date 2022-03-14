'reach 0.1';

//interact interface 
const Player={
    gethand:Fun([],UInt),//no input ,return number representing hand
    seeOutcome:Fun([UInt],Null)//input is outcome as number,output is Null
}


export const main=Reach.App( ()=>{
//interface
 const Alice = Participant('Alice',{
//Alice interface 
...Player
})

const Bob =Participant("Bob",{
    //Bobs interface
    ...Player
})
deploy();
//write logic:backend interact with frontend,get hand,publish to network 
Alice.only(()=>{
    const handAlice =declassify(interact.gethand());
});
Alice.publish(handAlice);
commit();

Bob.only( ()=>{
    const handBob=declassify(interact.gethand());
    });
    Bob.publish(handBob);
    const outcome =(handAlice + (4-handBob))%3;//this remainder as index of OUTCOME array
    commit();
    //send outcomes of both to frontend
    each([Alice,Bob],()=>{
        interact.seeOutcome(outcome);
      
    })
});




