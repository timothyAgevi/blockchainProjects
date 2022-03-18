import React from 'react';
import AppViews from './views/AppViews';
import DeployerViews from './views/DeployerViews';
import AttacherViews from './views/AttacherViews';
import {renderDOM, renderView} from './views/render';
import './index.css';
import * as backend from './build/index.main.mjs';
//std library
import {loadStdlib} from '@reach-sh/stdlib';
const reach = loadStdlib(process.env);//process.env. are variables used to acess desired stdlib 
//helper functions and defaults
const handToInt = {'ROCK': 0, 'PAPER': 1, 'SCISSORS': 2};
const intToOutcome = ['Bob wins!', 'Draw!', 'Alice wins!'];
const {standardUnit} = reach;
const defaults = {defaultFundAmt: '10', defaultWager: '3', standardUnit};
//define app component on mount
class App extends React.Component{
    constructor(props){
        super (props);this.state={view:'ConnectAccount',...defaults};// initialize the component state to display Connect Account dialog
    }//hook into React's componentDidMount lifecycle event
    async componentDidMount(){
        const acc= await reach.getDefaultAccount();
        const balAtomic=await reach.balanceOf(acc);
        const bal=reach.formatCurrency(balAtomic,4);
        this .setState({acc,bal});
        if(await reach.canFundFromFaucet()){
            this.setState({view:'FundAccount'});
        }else{
            this.setState({view:'DeployerOrAttacher'});
        }
    }
}




