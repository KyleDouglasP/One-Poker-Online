package com.kyleperry.onepoker.backend.game;

public class OnePoker {

    final int BOT_MODE = 0;
    final int ONLINE_MODE = 1;
    private int mode;

    private Deck mainDeck;

    private Card[] player1Cards;
    private Card player1PlayedCard;
    private int player1Tokens;
    private int player1BetTokens;
    private boolean player1PreviousAction; /* TODO: Setup backend logic for raise turn tracking */

    private Card[] player2Cards;
    private Card player2PlayedCard;
    private int player2Tokens;
    private int player2BetTokens;
    private boolean player2PreviousAction;

    public OnePoker(int mode){
        player1Tokens=8;
        player2Tokens=8;
        player1BetTokens=0;
        player2BetTokens=0;
        mainDeck = new Deck();
        player1Cards = new Card[] {mainDeck.draw(),mainDeck.draw()};
        player2Cards = new Card[] {mainDeck.draw(),mainDeck.draw()};
        this.mode = mode;
    }

    public void playCard(int index){

        player1PlayedCard = player1Cards[index];
        player1Cards[index] = null;

        if(mode == BOT_MODE){
            // Temporary 50/50 logic for AI opponent
            double player2Chance = Math.random();
            int player2CardIndex = (player2Chance<.5 ? 0 : 1);
            player2PlayedCard = player2Cards[player2CardIndex];
            player2Cards[player2CardIndex] = null;
        } else if (mode == ONLINE_MODE){

        }
    }

    public void P2PlayCard(int index){
        player2PlayedCard = player2Cards[index];
        player2Cards[index] = null;
    }

    public void betTokens(int tokens){
        player1Tokens-=tokens;
        player1BetTokens+=tokens;
    }

    public int getTokens(){
        return player1Tokens;
    }

    public int getTokensBet(){
        return player1BetTokens;
    }
    
    public void P2BetTokens(int tokens){
        player2Tokens-=tokens;
        player2BetTokens+=tokens;
    }

    public int getP2Tokens(){
        return player2Tokens;
    }

    public int getP2TokensBet(){
        return player2BetTokens;
    }

    public Card[] getCards(){
        return player1Cards;
    }

    public Card[] getP2Cards(){
        return player2Cards;
    }

    public boolean[] getOpponentCardsUp(){
        boolean up[] = {player2Cards[0].getRank()>7,player2Cards[1].getRank()>6};
        return up;
    }

    public boolean[] getP2OpponentCardsUp(){
        boolean up[] = {player1Cards[0].getRank()>7,player1Cards[1].getRank()>6};
        return up;
    }

    public Card getOpponentPlayedCard(){
        return player2PlayedCard;
    }

    public Card getP2OpponentPlayedCard(){
        return player1PlayedCard;
    }

    private void redraw(){
        if(player1Cards[0]==null) player1Cards[0]=mainDeck.draw();
        if(player1Cards[1]==null) player1Cards[1]=mainDeck.draw();
        if(player2Cards[0]==null) player2Cards[0]=mainDeck.draw();
        if(player2Cards[1]==null) player2Cards[1]=mainDeck.draw();
    }

    /* Returns 1 if first card wins, 2 if second card wins, 0 if they draw */
    public int decideWinner(){
        if(player1PlayedCard!=null && player2PlayedCard!=null){
            redraw();
            return player1PlayedCard.compareTo(player2PlayedCard);
        } else return 0;
    }

    public void fold(){
        /* TODO */
    }

    public void P2Fold(){
        /* TODO */
    }

}