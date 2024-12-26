import { useState, useEffect } from "react";
import { beginGame, getOpponentCardsUp, getOpponentPlayedCard, playCard, getWinner, getPlayerHand } from "./services/api";
import { cardToAsset, generateUUID} from "./utils/util";


function HandCard({ selected, cardValue, onCardClick }){
  
  if(selected)return ( // Nothing displayed if cardToAsset cannot return a valid filepath
    <div className="card-outline container" style={{border:"2px solid yellow"}} onClick={onCardClick}>
        <img src={cardToAsset(cardValue)} style={{marginTop:"5px", display: cardToAsset(cardValue) ? "inline" : "none"}} width={90} height={126} alt="" />
    </div>
  )
  else return ( // Nothing displayed if cardToAsset cannot return a valid filepath
    <div className="card-outline container" onClick={onCardClick}>
        <img src={cardToAsset(cardValue)} style={{marginTop:"5px", display: cardToAsset(cardValue) ? "inline" : "none"}} width={90} height={126} alt="" />
    </div>
  )
}

function PlayedCard({cardValue, flipState}){
  if(flipState){
    return ( // Nothing displayed if cardToAsset cannot return a valid filepath
      <div className="played-card-outline container">
        <img src={cardToAsset(cardValue)} style={{marginTop:"5px", display: cardValue ? "inline" : "none"}} width={90} height={126} alt="" />
      </div>
    )
  } else {
    return ( // Nothing displayed if cardToAsset cannot return a valid filepath
      <div className="played-card-outline container">
        <img src={require('./assets/CARDBACK.png')} style={{marginTop:"5px", display: cardValue ? "inline" : "none"}} width={90} height={126} alt="" />
      </div>
    )
  }
}

function Light({ on }){
  if(on) return <span className="light" style={{backgroundColor:"rgb(245, 243, 156)"}}></span>;
  else return <span className="light"></span>;
}

function LightBox({ opponentCards }){
  
  return (
    <>
      <div>
        <div className="light-text-box">
          UP
        </div>
        <div className="light-box">
          <Light on={opponentCards[0]||opponentCards[1]}/>
          <Light on={opponentCards[0]&&opponentCards[1]}/>
        </div>
      </div>
      <div>
        <div className="light-text-box">
          DOWN
        </div>
        <div className="light-box">
          <Light on={!opponentCards[0]||!opponentCards[1]}/>
          <Light on={!opponentCards[0]&&!opponentCards[1]}/>
        </div>
      </div>
    </>
  );
}

function LivesBox({lives, selected}){
  if(lives>16){
    console.error('Error: Too many lives');
    return;
  }

  let rows = Math.floor((lives)/4);
  let remaining = (lives)%4;
  let lifetable = Array(rows).fill(null).map(() => Array(4).fill(<Life />));
  lifetable.push(Array(remaining).fill(<Life/>));
  for(let i=1; i<=selected; i++){
    if(i>remaining){
      lifetable[rows-1-(Math.floor((i-1-remaining)/4))][4-(i-remaining-1)%4-1]=<Life selected={true}/>;
    } else {
      lifetable[rows][remaining-i]=<Life selected={true}/>;
    }
  }
  return (
    <table>
      <tbody>
        {lifetable.map((item,index) => (
          <tr key={index}>
            <td>{item[0]}</td>
            <td>{item[1]}</td>
            <td>{item[2]}</td>
            <td>{item[3]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Life({selected}){
  /* TODO */
  return (
    <div>
      <span className="life" style={{outline: selected ? "1px solid yellow" : "none"}}></span>
    </div>
  )
}

export default function Table() {

  const BOT = 0;
  const ONLINE = 1;

  const [socket, setSocket] = useState(null);
  const [gameID, setGameID] = useState(null);

  const SELECT_STATE = -2;
  const ONLINE_WAIT_STATE = -1
  const PLAY_STATE = 0;
  const WAIT_STATE = 1;
  const BET_STATE = 2;
  const BET_WAIT_STATE = 3;
  const WIN_STATE = 4;
  const FOLD_STATE = 5;
  const GAME_OVER_STATE = 6;

  const [gameState, setGameState] = useState(SELECT_STATE);

  const CALL_OR_CHECK = true;
  const RAISE = false;

  const [prevAction, setPrevAction] = useState(Array(2).fill(RAISE));

  const [mode, setMode] = useState(-1);
  const [opponentHand, setOpponentHand] = useState(Array(2).fill(null));
  const [hand, setHand] = useState(Array(2).fill(null));
  const [cardSelection, setCardSelection] = useState(Array(2).fill(false));
  const [playedCards, setPlayedCards] = useState(Array(2).fill(null));
  const [tokens, setTokens] = useState(Array(2).fill(8));
  const [tokensSelected, setTokensSelected] = useState(1);
  const [tokensBet, setTokensBet] = useState(Array(2).fill(0));
  const [prevRaise, setPrevRaise] = useState(Array(2).fill(0));

  // UseEffect for when both cards are played to determine winner of the hand and reset
  useEffect(() => {
    const winState = async () => {
      const winner = await getWinner();
      const newTokens = tokens.slice();
      if(winner===1){
        newTokens[0]+=tokensBet[0]+tokensBet[1];
      } 
      else if (winner===-1){
        newTokens[1]+=tokensBet[0]+tokensBet[1];
      } else {
        newTokens[0]+=tokensBet[0];
        newTokens[1]+=tokensBet[1];
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
      setTokens(newTokens);
      setTokensBet(Array(2).fill(0));

      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
      if(newTokens[0]===0||newTokens[1]===0){
        setGameState(GAME_OVER_STATE);
        return;
      }

      setPlayedCards(Array(2).fill(null));
      const newHand = await getPlayerHand();
      const newLights = await getOpponentCardsUp();
      setHand(newHand);
      setOpponentHand(newLights);
      setGameState(PLAY_STATE);
    }

    const foldState = async () => {
      await getWinner();
      const newTokens = tokens.slice();
      newTokens[1]+=tokensBet[0]+tokensBet[1];

      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
      setTokens(newTokens);
      setTokensBet(Array(2).fill(0));

      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
      if(newTokens[0]===0||newTokens[1]===0){
        setGameState(GAME_OVER_STATE);
        return;
      }

      setPlayedCards(Array(2).fill(null));
      const newHand = await getPlayerHand();
      const newLights = await getOpponentCardsUp();
      setHand(newHand);
      setOpponentHand(newLights);
      setGameState(PLAY_STATE);
    }

    const waitState = async () => {
      const newOpponentCard = await getOpponentPlayedCard();

      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s

      const newPlayedCards = playedCards.slice();
      newPlayedCards[1]=newOpponentCard;
      const newTokens = tokens.slice();
      newTokens[1]--;
      setTokens(newTokens)
      setPlayedCards(newPlayedCards);
      setTokensBet(Array(2).fill(1));

      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
      setGameState(BET_STATE);
    }

    const betWaitState = async () => {
      const newPrevAction = prevAction.slice();
      newPrevAction[1]=CALL_OR_CHECK;
      setPrevAction(newPrevAction);

      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s

      const newTokensBet = tokensBet.slice();
      const newTokens = tokens.slice();

      if(newTokens[1]-prevRaise[0]<0){
        newTokensBet[1]+=newTokens[1];
        newTokens[1]=0;
      } else {
        newTokens[1]-=prevRaise[0];
        newTokensBet[1]+=prevRaise[0];
      }

      setTokensBet(newTokensBet);
      setTokens(newTokens);

      setGameState(BET_STATE);
    }

    if(mode===BOT){
      switch(gameState){
        case WIN_STATE:
          winState();
          break;
        case WAIT_STATE:
          waitState();
          break;
        case BET_WAIT_STATE:
          betWaitState();
          break;
        case FOLD_STATE:
          foldState();
          break;
      }
    }

  },[gameState])

  useEffect(() => {
    const update = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
      setGameState(WIN_STATE);
    }
    if(prevAction[0]===CALL_OR_CHECK && prevAction[1]===CALL_OR_CHECK) update();
  }, [prevAction]);

  function handleCardClick(cardNumber){
    if(playedCards[0]) return;
    const newSelection = Array(2).fill(false);
    newSelection[cardNumber] = true;
    setCardSelection(newSelection);
  }

  async function handleBotStart(){
    setMode(BOT);
    setPlayedCards(Array(2).fill(null));
    const cards = await beginGame();
    setHand(cards);
    const opponentUp = await getOpponentCardsUp();
    setOpponentHand(opponentUp);
    setTokens(Array(2).fill(8));
    setGameState(PLAY_STATE);
  }

  async function interpretMessage(socket, gameUpdate){
    if(gameUpdate.type === "UPDATE"){
      console.log("gamestate is: " + gameUpdate.state)
      const newHand = hand.slice();
      newHand[0]=(gameUpdate.Card1==="null" ? null : gameUpdate.Card1);
      newHand[1]=(gameUpdate.Card2==="null" ? null : gameUpdate.Card2);

      const newLights = opponentHand.slice();
      newLights[0]=(gameUpdate.OpponentHand1==="true");
      newLights[1]=(gameUpdate.OpponentHand2==="true");

      const newTokens = tokens.slice();
      newTokens[0]=parseInt(gameUpdate.Tokens);
      newTokens[1]=parseInt(gameUpdate.OpponentTokens);

      const newTokensBet = tokensBet.slice();
      newTokensBet[0]=parseInt(gameUpdate.TokensBet);
      newTokensBet[1]=parseInt(gameUpdate.OpponentTokensBet)

      const newPlayedCards = playedCards.slice();

      const newPrevRaise = prevRaise.slice();
      newPrevRaise[1]=parseInt(gameUpdate.PreviousOpponentRaise);

      setHand(newHand);
      setTokens(newTokens);
      setTokensBet(newTokensBet);
      setPrevRaise(newPrevRaise);

      if(!(gameUpdate.PlayedCard==="null")) newPlayedCards[0]=gameUpdate.PlayedCard;
      if(gameUpdate.OpponentPlayedCard==="null") setOpponentHand(newLights);
      else newPlayedCards[1]=gameUpdate.OpponentPlayedCard;

      setPlayedCards(newPlayedCards);

      const state = gameUpdate.state;
      if(state==="play"){
        setTokensSelected(1);
        setGameState(PLAY_STATE);
      } else if (state==="wait") {
        setTokensSelected(0);
        setGameState(WAIT_STATE);
      } else if (state==="bet"){
        setTokensSelected(parseInt(gameUpdate.PreviousOpponentRaise));
        setGameState(BET_STATE);
      } else if (state==="bet-wait"){
        setTokensSelected(0);
        setGameState(BET_WAIT_STATE);
      } else if (state==="decide-winner"){
        setGameState(BET_WAIT_STATE);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
        setGameState(WIN_STATE);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
        socket.send("winHand");
      } else if (state==="game-over"){
        setGameState(GAME_OVER_STATE);
      }
      
    } else console.log(gameUpdate.message);
  }

  async function handleOnlineStart(){
    setMode(ONLINE);
    const uniqueID = generateUUID();
    const newSocket = new WebSocket(`ws://localhost:8080/game/create/${uniqueID}`);
    newSocket.onopen = () =>{
      setSocket(newSocket);
      setGameState(ONLINE_WAIT_STATE);
      newSocket.send("updateRequest")
      setGameID(uniqueID);
      console.log(`Websocket connection established at ws://localhost:8080/game/create/${uniqueID}`)
    }
    newSocket.onmessage = (event) => {
      const gameUpdate = JSON.parse(event.data);
      interpretMessage(newSocket, gameUpdate);
    }
    newSocket.onclose = () => {
      setGameState(SELECT_STATE);
      setGameID(null);
      setMode(null);
      setSocket(null);
      console.log(`Websocket connection at ws://localhost:8080/game/create/${uniqueID} has been closed.`)
    }
  }


  async function handleOnlineJoin(){
    setMode(ONLINE);
    const newSocket = new WebSocket(`ws://localhost:8080/game/join/${gameID}`)
    newSocket.onopen = () =>{
      setSocket(newSocket);
      newSocket.send("updateRequest")
      console.log(`Websocket connection established at ws://localhost:8080/game/join/${gameID}`)
    }
    newSocket.onmessage = (event) => {
      const gameUpdate = JSON.parse(event.data);
      interpretMessage(newSocket, gameUpdate);
    }
    newSocket.onclose = () => {
      setGameState(SELECT_STATE);
      setGameID(null);
      setMode(null);
      setSocket(null);
      console.log(`Websocket connection at ws://localhost:8080/game/join/${gameID} has been closed.`)
    }
  }

  async function handlePlayCard(){
    
    if(mode===BOT){
      let playedCard = null;
      const newHand = hand.slice();
      
      if(cardSelection[0]){
        playedCard = hand[0];
        newHand[0]=null;
        await playCard(0);
      }
      else if(cardSelection[1]){
        playedCard = hand[1];
        newHand[1]=null;
        await playCard(1);
      }
      else return;
      const newTokensBet = tokensBet.slice();
      newTokensBet[0]=1;
      const newTokens = tokens.slice();
      newTokens[0]--;
      setTokens(newTokens)
      setTokensBet(newTokensBet);
      setHand(newHand);

      const newPlayedCards = playedCards.slice();
      newPlayedCards[0]=playedCard;
      setPlayedCards(newPlayedCards);

      setGameState(WAIT_STATE);
    } else {
      socket.send(`playcard${cardSelection[0] ? 0 : 1}`);
    }
    setTokensSelected(0);
    setCardSelection(Array(2).fill(false));
  }

  function handleBet(){
    if(mode===BOT){ 
      const newPrevRaise = prevRaise.slice();
      const newPrevAction = prevAction.slice();

      if (tokensSelected===prevRaise[1]){
        newPrevRaise[0] = 0;
        newPrevAction[0] = CALL_OR_CHECK;
      } else {
        newPrevRaise[0] = tokensSelected;
        newPrevAction[0] = RAISE;
      }

      setPrevRaise(newPrevRaise);
      const newTokensBet = tokensBet.slice();
      const newTokens = tokens.slice();
      newTokensBet[0]=tokensBet[0]+tokensSelected;
      newTokens[0]=tokens[0]-tokensSelected;
      setTokensBet(newTokensBet);
      setTokens(newTokens);
      setTokensSelected(0);

      setPrevAction(newPrevAction);
      setGameState(BET_WAIT_STATE);
    } else {
      socket.send(`bet${tokensSelected}`)
    }
  }

  function handleFold(){
    if(mode===BOT) setGameState(FOLD_STATE);
    else socket.send("fold");
  }

  const handleGameIDChange = (event) => {
    setGameID(event.target.value);
  };
  
  if (gameState===SELECT_STATE){
    return (
      <div className="table full-center-container">
        <div>
          <div>
            <button className="select-button" onClick={handleBotStart}>Play Against Bot</button>
          </div>
          <div>
            <button className="select-button" onClick={handleOnlineStart}>Start Online Game</button>
          </div>
          <div>
            <button className="select-button" onClick={handleOnlineJoin} disabled={!gameID}>Join Online Game</button>
          </div>
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <input style={{display:"block", margin:"5px", width:"100%", textAlign:"center"}} onChange={handleGameIDChange} type="text" placeholder="Game Code"/>
          </div>
        </div>
      </div>
    );
  } else if (gameState===ONLINE_WAIT_STATE) {
    return (
      <div className="table full-center-container">
        <div style={{textAlign:"center"}}>
          <div style={{margin:"10px", backgroundColor:"#2a503d", border:"5px solid #2a503d", borderRadius:"10px", color:"white"}}>Waiting for Player 2 to Join!</div>
          <div style={{backgroundColor:"#2a503d", borderRadius:"10px", border:"5px solid #2a503d"}}><span style={{color:"white"}}>Game Code:</span> <span style={{backgroundColor:"white", borderRadius:"5px", border:"2px solid black"}}>{gameID}</span></div>
          <button style={{margin:"5px"}} onClick={() => {socket.close(1000)}}>Go Back</button>
        </div>
      </div>
    );
  } else if (gameState===GAME_OVER_STATE){
    return (
      <div className="table full-center-container">
        <div>
          <div style={{textAlign:"center"}}>
            <span className="game-over-text">You {tokens[0]===16 ? "Won!" : "Lost..."}</span>
          </div>
          <div>
            <button className="select-button" onClick={() => {mode===ONLINE ? socket.close(1000) : setGameState(SELECT_STATE)}}>Go Home</button>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="table">
        <button style={{position:"absolute", margin:"5px"}} onClick={() => {mode===ONLINE ? socket.close(1000) : setGameState(SELECT_STATE)}}>Go Back</button>
        {/* <text style={{display: tokens[0]===16||tokens[1]===16 ? "inline" : "none", color:"yellow",fontSize:"200px"}}>YOU {tokens[0]===16 ? "WIN!" : "LOSE..."}</text> */}
        <div className="container" style={{marginTop:"5px"}}>
          {/*Opponent Lives*/}
          <div style={{position:"absolute", transform:"translateX(-180px)"}}><LivesBox lives={tokens[1]} selected={0}/></div>
          {/*Opponent Lights*/}
          <LightBox opponentCards={opponentHand}/>
        </div>
        {/*Opponent Played Card*/}
        <div className="container" style={{marginTop:"30px"}}>
          <LivesBox lives={tokensBet[1]}/>
          <PlayedCard cardValue={playedCards[1]} flipState={gameState===WIN_STATE||gameState===FOLD_STATE}/>
        </div>
        {/*Player Played Card*/}
        <div className="container">
          <LivesBox lives={tokensBet[0]}/>
          <span><PlayedCard cardValue={playedCards[0]} flipState={gameState===WIN_STATE||gameState===FOLD_STATE}/></span>
        </div>
        {/*Betting Options*/}
        <div 
          className="footer"
          style={{margin:"7px", transform:"translateX(-450px)", display: gameState===BET_STATE ? "inline" : "none"}}        
        >
          <div style={{textAlign:"center"}}>
            <span>
              <button onClick={handleBet}>{tokensSelected===0 ? "CHECK" : tokensSelected===prevRaise[1] ? "CALL" : "RAISE"}</button>
              <button onClick={handleFold}>FOLD</button>
            </span>
          </div>
          <span>
            <span style={{margin:"5px", color:"WHITE", fontWeight:"bold"}}>TOKENS:</span>
            <button onClick={() => setTokensSelected(tokensSelected-1)} disabled={tokensSelected===prevRaise[1]}>-</button>
            <input style={{maxWidth:"40px", minWidth:"20px"}} readOnly type="text" value={tokensSelected}/>
            <button onClick={() => setTokensSelected(tokensSelected+1)} disabled={tokensSelected===tokens[0] || (prevAction[1]===CALL_OR_CHECK&&tokensSelected===tokens[1]) || (prevAction[1]===RAISE&&tokensSelected===prevRaise[1]+tokens[1])}>+</button>
          </span>
        </div>
        {/*Player Lives*/}
        <div 
          className="footer"
          style={{margin:"5px", transform:"translateX(-280px) rotate(180deg)"}}
        >
          <LivesBox lives={tokens[0]} selected={tokensSelected}/>
        </div>
        {/*Player Cards*/}
        <div className="footer">
          <HandCard cardValue={hand[0]} selected={cardSelection[0]} onCardClick={() => handleCardClick(0)}/>
          <HandCard cardValue={hand[1]} selected={cardSelection[1]} onCardClick={() => handleCardClick(1)}/>
        </div>
        <button
          disabled={!(cardSelection[0]||cardSelection[1])}
          onClick={handlePlayCard} 
          className="footer" 
          style={{margin:"7px", marginLeft:"153px", display: gameState===PLAY_STATE ? "inline" : "none"}}
        >
          Play Card
        </button>
      </div>
    );
  }
}