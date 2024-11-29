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

function LivesBox({lives}){
  if(lives>16){
    console.error('Error: Too many lives');
    return;
  }

  let rows = Math.floor(lives/4);
  let remaining = lives%4;
  const lifetable = Array(rows).fill(Array(4).fill(<Life/>));
  lifetable.push(Array(remaining).fill(<Life/>));
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

function Life(){
  /* TODO */
  return (
    <div>
      <span className="life"></span>
    </div>
  )
}

export default function Table() {  

  const [gameState, setgameState] = useState(0);
  const [opponentHand, setOpponentHand] = useState(Array(2).fill(null));
  const [hand, setHand] = useState(Array(2).fill(null));
  const [cardSelection, setCardSelection] = useState(Array(2).fill(false));
  const [playedCards, setPlayedCards] = useState(Array(2).fill(null));
  const [flip, setFlip] = useState(false);
  const [tokens, setTokens] = useState(Array(2).fill(8));

  /* Test Code for API calls with parameters */

  const [data, setData] = useState(null); // State to store the data
  const [loading, setLoading] = useState(true); // State for loading state
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    const getData = async () => {
      try {
        const cards = await beginGame();
        setHand(cards);
        const opponentUp = await getOpponentCardsUp();
        setOpponentHand(opponentUp);
      } catch (error) {
        setError('Failed to begin the game'); // Handle the error
      } finally {
        setLoading(false); // Set loading to false once data is fetched or error occurs
      }
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
          newTokens[0]++;
          newTokens[1]--;
        } 
        else if (winner===-1){
          newTokens[0]--;
          newTokens[1]++;
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
        setFlip(true);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
        setTokens(newTokens);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
        setPlayedCards(Array(2).fill(null));
        const newHand = await getPlayerHand();
        const newLights = await getOpponentCardsUp();
        setHand(newHand);
        setOpponentHand(newLights);
        setFlip(false);
      } catch (error) {
        setError('Failed to begin the game'); // Handle the error
      } finally {
        setLoading(false); // Set loading to false once data is fetched or error occurs
      }
    }
    if(playedCards[0]&&playedCards[1]){
      winState();
    }
  },[playedCards])

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

    setHand(newHand);

    const newOpponentCard = await getOpponentPlayedCard();

    const newPlayedCards = playedCards.slice();
    newPlayedCards[0]=playedCard;
    setCardSelection(Array(2).fill(false));
    setPlayedCards(newPlayedCards);

    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s

    const newNewPlayedCards = newPlayedCards.slice();
    newNewPlayedCards[1]=newOpponentCard;
    setPlayedCards(newNewPlayedCards); 

    /* TODO: Code winning hand logic */

  }
  
  return (
    <div className="table">
      <div className="container" style={{marginTop:"5px"}}>
        {/*Opponent Lives*/}
        <div style={{position:"absolute", transform:"translateX(-180px)"}}><LivesBox lives={tokens[1]}/></div>
        {/*Opponent Lights*/}
        <LightBox opponentCards={opponentHand}/>
      </div>
      {/*Opponent Played Card*/}
      <div className="container" style={{marginTop:"30px"}}>
        <PlayedCard cardValue={playedCards[1]} flipState={flip}/>
      </div>
      {/*Player Played Card*/}
      <div className="container">
        <PlayedCard cardValue={playedCards[0]} flipState={flip}/>
      </div>
      {/*Player Tokens*/}
      <div className="container">

      </div>
      {/*Player Lives*/}
      <div 
        className="footer"
        style={{margin:"5px", transform:"translateX(-280px) rotate(180deg)"}}
      >
        <LivesBox lives={tokens[0]}/>
      </div>
      {/*Player Cards*/}
      <div className="footer">
        <HandCard cardValue={hand[0]} selected={cardSelection[0]} onCardClick={() => handleCardClick(0)}/>
        <HandCard cardValue={hand[1]} selected={cardSelection[1]} onCardClick={() => handleCardClick(1)}/>
      </div>
      <button 
        onClick={handlePlayCard} 
        className="footer" 
        style={{margin:"5px", marginLeft:"150px", display: playedCards[0] ? "none" : "inline"}}
      >
        Play Card
      </button>
    </div>
  );
}