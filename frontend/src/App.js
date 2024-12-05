import { useState, useEffect } from "react";
import { beginGame, getOpponentCardsUp, getOpponentPlayedCard, playCard, getWinner, getPlayerHand } from "./services/api";
import { cardToAsset } from "./utils/util";


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
      {lifetable.map(item => (
        <tr>
          <td>{item[0]}</td>
          <td>{item[1]}</td>
          <td>{item[2]}</td>
          <td>{item[3]}</td>
        </tr>
      ))}
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
  
  const SELECT_STATE = -1;
  const PLAY_STATE = 0;
  const WAIT_STATE = 1;
  const BET_STATE = 2;
  const BET_WAIT_STATE = 3;
  const WIN_STATE = 4;
  const GAME_OVER_STATE = 5;

  const CALL_OR_CHECK = true;
  const RAISE = false;

  const [gameState, setGameState] = useState(PLAY_STATE);
  const [opponentHand, setOpponentHand] = useState(Array(2).fill(null));
  const [hand, setHand] = useState(Array(2).fill(null));
  const [cardSelection, setCardSelection] = useState(Array(2).fill(false));
  const [playedCards, setPlayedCards] = useState(Array(2).fill(null));
  const [tokens, setTokens] = useState(Array(2).fill(8));
  const [tokensSelected, setTokensSelected] = useState(1);
  const [tokensBet, setTokensBet] = useState(Array(2).fill(0));
  const [prevAction, setPrevAction] = useState(Array(2).fill(RAISE));
  const [prevRaise, setPrevRaise] = useState(Array(2).fill(0));

  const [loading, setLoading] = useState(true); // State for loading state
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    const getData = async () => {
      const cards = await beginGame();
      setHand(cards);
      const opponentUp = await getOpponentCardsUp();
      setOpponentHand(opponentUp);
    };
    getData();
  }, []); // Empty dependency array means that useEffect only runs on the first render

  // UseEffect for when both cards are played to determine winner of the hand and reset
  useEffect(() => {
    const winState = async () => {
      try {
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

        if(tokens[0]==0||tokens[1]==0){
          setGameState(GAME_OVER_STATE);
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
        setPlayedCards(Array(2).fill(null));
        const newHand = await getPlayerHand();
        const newLights = await getOpponentCardsUp();
        setHand(newHand);
        setOpponentHand(newLights);
        setGameState(PLAY_STATE);

      } catch (error) {
        setError('Failed to begin the game'); // Handle the error
      } finally {
        setLoading(false); // Set loading to false once data is fetched or error occurs
      }
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

    const gameOverState = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
      setPlayedCards(Array(2).fill(null));
      const cards = await beginGame();
      setHand(cards);
      const opponentUp = await getOpponentCardsUp();
      setOpponentHand(opponentUp);
      setTokens(Array(2).fill(8));
      setGameState(PLAY_STATE);
    }

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
      case GAME_OVER_STATE:
        gameOverState();
        break;
    }

  },[gameState])

  useEffect(() => {
    const update = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
      setGameState(WIN_STATE);
    }
    if(prevAction[0]==CALL_OR_CHECK && prevAction[1]==CALL_OR_CHECK) update();
  }, [prevAction]);

  function handleCardClick(cardNumber){
    if(playedCards[0]) return;
    const newSelection = Array(2).fill(false);
    newSelection[cardNumber] = true;
    setCardSelection(newSelection);
  }

  async function handlePlayCard(){
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

    setTokensSelected(0);
    const newTokensBet = tokensBet.slice();
    newTokensBet[0]=1;
    const newTokens = tokens.slice();
    newTokens[0]--;
    setTokens(newTokens)
    setTokensBet(newTokensBet);
    setHand(newHand);

    const newPlayedCards = playedCards.slice();
    newPlayedCards[0]=playedCard;
    setCardSelection(Array(2).fill(false));
    setPlayedCards(newPlayedCards);

    setGameState(WAIT_STATE);

  }

  function handleBet(){
    const newPrevRaise = prevRaise.slice();
    const newPrevAction = prevAction.slice();

    if (tokensSelected==prevRaise[1]){
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
  }

  function handleFold(){
    /* TODO */
  }
  
  return (
    <div className="table">
      {/* <text style={{display: tokens[0]==16||tokens[1]==16 ? "inline" : "none", color:"yellow",fontSize:"200px"}}>YOU {tokens[0]==16 ? "WIN!" : "LOSE..."}</text> */}
      <div className="container" style={{marginTop:"5px"}}>
        {/*Opponent Lives*/}
        <div style={{position:"absolute", transform:"translateX(-180px)"}}><LivesBox lives={tokens[1]} selected={0}/></div>
        {/*Opponent Lights*/}
        <LightBox opponentCards={opponentHand}/>
      </div>
      {/*Opponent Played Card*/}
      <div className="container" style={{marginTop:"30px"}}>
        <LivesBox lives={tokensBet[1]}/>
        <PlayedCard cardValue={playedCards[1]} flipState={gameState==WIN_STATE}/>
      </div>
      {/*Player Played Card*/}
      <div className="container">
        <LivesBox lives={tokensBet[0]}/>
        <span><PlayedCard cardValue={playedCards[0]} flipState={gameState==WIN_STATE}/></span>
      </div>
      {/*Betting Options*/}
      <div 
        className="footer"
        style={{margin:"7px", transform:"translateX(-450px)", display: gameState==BET_STATE ? "inline" : "none"}}        
      >
        <div style={{textAlign:"center"}}>
          <span>
            <button onClick={handleBet}>{tokensSelected==0 ? "CHECK" : tokensSelected==prevRaise[1] ? "CALL" : "RAISE"}</button>
            <button onClick={handleFold}>FOLD</button>
          </span>
        </div>
        <span>
          <text style={{margin:"5px", color:"WHITE", fontWeight:"bold"}}>TOKENS:</text>
          <button onClick={() => setTokensSelected(tokensSelected-1)} disabled={tokensSelected==0}>-</button>
          <input style={{maxWidth:"40px", minWidth:"20px"}} readOnly type="text" value={tokensSelected}/>
          <button onClick={() => setTokensSelected(tokensSelected+1)} disabled={tokensSelected==tokens[0]}>+</button>
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
        style={{margin:"7px", marginLeft:"153px", display: gameState==PLAY_STATE ? "inline" : "none"}}
      >
        Play Card
      </button>
    </div>
  );
}