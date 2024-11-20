import { useState, useEffect } from "react";
import { getHelloMessage } from "./services/api";
import { cardToAsset } from "./utils/cardMap";


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

function PlayedCard({cardValue}){
  return ( // Nothing displayed if cardToAsset cannot return a valid filepath
    <div className="played-card-outline container">
      <img src={cardToAsset(cardValue)} style={{marginTop:"5px", display: cardToAsset(cardValue) ? "inline" : "none"}} width={90} height={126} alt="" />
    </div>
  )
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
          <Light on={true}/>
          <Light on={false}/>
        </div>
      </div>
      <div>
        <div className="light-text-box">
          DOWN
        </div>
        <div className="light-box">
          <Light on={true}/>
          <Light on={false}/>
        </div>
      </div>
    </>
  );
}

function Lives(){

}

export default function Table() {

  const [gameState, setgameState] = useState(0);
  const [opponentHand, setOpponentHand] = useState(Array(2).fill(null));
  const [hand, setHand] = useState(Array(2).fill("SPADES1"));
  const [cardSelection, setCardSelection] = useState(Array(2).fill(false));
  const [playedCards, setPlayedCards] = useState(Array(2).fill(null));

  function handleCardClick(cardNumber){
    const newSelection = Array(2).fill(false);
    newSelection[cardNumber] = true;
    setCardSelection(newSelection);
  }

  function handlePlayCard(){
    let playedCard = null;
    const newHand = hand.slice();
    if(cardSelection[0]){
      playedCard = hand[0];
      newHand[0]=null;
    }
    else if(cardSelection[1]){
      playedCard = hand[1];
      newHand[1]=null;
    }
    else return;

    setHand(newHand);

    const newPlayedCards = playedCards.slice();
    newPlayedCards[0]=playedCard;
    setPlayedCards(newPlayedCards);

    setCardSelection(Array(2).fill(false));

  }
  
  return (
    <div className="table">
      {/*Opponent Lights*/}
      <div className="container" style={{marginTop:"5px"}}>
          <LightBox/>
      </div>
      {/*Opponent Played Card*/}
      <div className="container" style={{marginTop:"30px"}}>
        <PlayedCard cardValue={playedCards[1]}/>
      </div>
      {/*Player Played Card*/}
      <div className="container">
        <PlayedCard cardValue={playedCards[0]}/>
      </div>
      {/*Player Tokens*/}
      <div className="container">

      </div>
      {/*Player Cards*/}
      <div className="footer">
        <HandCard cardValue={hand[0]} selected={cardSelection[0]} onCardClick={() => handleCardClick(0)}/>
        <HandCard cardValue={hand[1]} selected={cardSelection[1]} onCardClick={() => handleCardClick(1)}/>
      </div>
      <button onClick={handlePlayCard} className="footer" style={{margin:"5px",marginLeft:"150px"}}>Play Card</button>
    </div>
  );
}