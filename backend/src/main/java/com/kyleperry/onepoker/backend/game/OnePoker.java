package com.kyleperry.onepoker.backend.game;

public class OnePoker {

    final int BOT_MODE = 0;
    final int ONLINE_MODE = 1;
    private int mode;

    private Deck mainDeck;

    private Card[] player1Cards;
    private Card player1PlayedCard;
    private int player1Tokens;

    private Card[] player2Cards;
    private Card player2PlayedCard;
    private int player2Tokens;

    public OnePoker(int mode){
        if(mode == BOT_MODE){
            mainDeck = new Deck();
            player1Cards = new Card[] {mainDeck.draw(),mainDeck.draw()};
            player2Cards = new Card[] {mainDeck.draw(),mainDeck.draw()};
            mode = BOT_MODE;
        } else if (mode == ONLINE_MODE){
            /* TODO */
        }
    }

    public void playCard(int index){
        if(mode == BOT_MODE){
            player1PlayedCard = player1Cards[index];
            player1Cards[index] = null;
            // Temporary 50/50 logic for AI opponent
            double player2Chance = Math.random();
            int player2CardIndex = (player2Chance<.5 ? 0 : 1);
            player2PlayedCard = player2Cards[player2CardIndex];
            player2Cards[player2CardIndex] = null;
        } else if (mode == ONLINE_MODE){
            /* TODO */
        }
    }

    public Card[] getCards(){
        return player1Cards;
    }

    public boolean[] getOpponentCardsUp(){
        boolean up[] = {player2Cards[0].getRank()>7,player2Cards[1].getRank()>6};
        return up;
    }

    public Card getOpponentPlayedCard(){
        return player2PlayedCard;
    }

    /* Returns 1 if first card wins, 2 if second card wins, 0 if they draw */
    public int decideWinner(){
        if(player1PlayedCard!=null && player2PlayedCard!=null){
            return player1PlayedCard.compareTo(player2PlayedCard);
        } else return 0;
    }

}