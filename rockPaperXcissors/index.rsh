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
//write logic   

});




