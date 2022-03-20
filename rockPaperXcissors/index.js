import React from 'react';
import AppViews from './views/AppViews';
import DeployerViews from './views/DeployerViews';
import AttacherViews from './views/AttacherViews';
import {renderDOM, renderView} from './views/render';
import './index.css';
import * as backend from './build/index.main.mjs';
import * as reach from '@reach-sh/stdlib/ALGO';
//std library
import {loadStdlib} from '@reach-sh/stdlib';
//error below
const reach = loadStdlib(process.env);//process.env. are variables used to acess desired stdlib 
//helper functions and defaults
const handToInt = {'ROCK': 0, 'PAPER': 1, 'SCISSORS': 2};
const intToOutcome = ['Bob wins!', 'Draw!', 'Alice wins!'];
const {standardUnit} = reach;
const defaults = {defaultFundAmt: '10', defaultWager: '3', standardUnit};
//define app component on mount
class App extends React.Component{
    constructor(props){
        super (props);
        this.state={view:'ConnectAccount',...defaults};// initialize the component state to display Connect Account dialog
    }//hook into React's componentDidMount lifecycle event
    async componentDidMount(){
        const acc= await reach.getDefaultAccount();//accesses the default browser account.
        const balAtomic=await reach.balanceOf(acc);
        const bal=reach.formatCurrency(balAtomic,4);
        this.setState({acc,bal});
        if(await reach.canFundFromFaucet()){//see if we can access the Reach developer testing network faucet
            this.setState({view:'FundAccount'});//set the component state to display Fund Account dialog
        }else{
            this.setState({view:'DeployerOrAttacher'});//set the component state to skip to Choose Role.
        }
    }//calback when user clicks Fund Account button
    async fundAccount(fundAmount) {
        await reach.fundFromFaucet(this.state.acc, reach.parseCurrency(fundAmount));// transfer funds from the faucet to the user's account
        this.setState({view: 'DeployerOrAttacher'});// set the component state to display Choose Role
      }
      //set the component state to display Choose Role when skip button is pressed
      async skipFundAccount() { this.setState({view: 'DeployerOrAttacher'}); }
      selectAttacher() { this.setState({view: 'Wrapper', ContentView: Attacher}); }//sub component if user clicks Attacher
      selectDeployer() { this.setState({view: 'Wrapper', ContentView: Deployer}); }// sub component if user clicks Deployer
      render() { return renderView(this, AppViews); }//render the appropriate view from views/AppViews.js.
         }
         //add Player constructor/component
         class Player extends React.Component {
            random() { return reach.hasRandom.random(); }//add random callback
            //lines 46thru 51, we provide the getHand callback
            async getHand() { // Fun([], UInt)
                // line 47 -50 set the component state to display Get Hand dialog, and wait for a Promise which can be resolved via user interaction.
              const hand = await new Promise(resolveHandP => {
                this.setState({view: 'GetHand', playable: true, resolveHandP});
              });
              this.setState({view: 'WaitingForResults', hand});//after promise is reslolved ,set the component state to display Waiting for results display.
              return handToInt[hand];
            }
            seeOutcome(i) { this.setState({view: 'Done', outcome: intToOutcome[i]}); }//seeOutcome callback
            informTimeout() { this.setState({view: 'Timeout'}); }//informTimeout callback
            playHand(hand) { this.state.resolveHandP(hand); }//promise from line 47 is resolved,define wjhat happenswhen user clicks R,P,s      
             }
        class Deployer extends Player {
            constructor(props) {
              super(props);
              this.state = {view: 'SetWager'};//set the component state to display Set Wager dialog.
            }
            setWager(wager) { this.setState({view: 'Deploy', wager}); }//set component state to display set wager dialog
            async deploy() {
              const ctc = this.props.acc.contract(backend);
              this.setState({view: 'Deploying', ctc});//when user clicks set wager,display Deploy dialog
              this.wager = reach.parseCurrency(this.state.wager); // UInt
              this.deadline = {ETH: 10, ALGO: 100, CFX: 1000}[reach.connector]; // UInt
              backend.Alice(ctc, this);
              const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2);
              this.setState({view: 'WaitingForAttacher', ctcInfoStr});
            }
            render() { return renderView(this, DeployerViews); }
          }
          class Attacher extends Player {
            constructor(props) {
              super(props);
              this.state = {view: 'Attach'};//initialize component state to display Attach dialog
            }//callback when user clicks Attach button
            attach(ctcInfoStr) {
              const ctc = this.props.acc.contract(backend, JSON.parse(ctcInfoStr));
              this.setState({view: 'Attaching'});//set the component state to display Attaching display
              backend.Bob(ctc, this);//run reach program as bob,this:React component as the participant interact interface object
            }//acceptwager callback
            async acceptWager(wagerAtomic) { // Fun([UInt], Null)
              const wager = reach.formatCurrency(wagerAtomic, 4);
              return await new Promise(resolveAcceptedP => {
                this.setState({view: 'AcceptTerms', wager, resolveAcceptedP});
              });
            }
            termsAccepted() {
              this.state.resolveAcceptedP();
              this.setState({view: 'WaitingForTurn'});
            }
            render() { return renderView(this, AttacherViews); }
          }
          
          renderDOM(<App />);

      




