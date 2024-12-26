package com.kyleperry.onepoker.backend.game;

public class OnePoker {

    private final int BOT_MODE = 0;
    private final int ONLINE_MODE = 1;

    private final boolean CALL_OR_CHECK = true;
    private final boolean RAISE = false;

    private int mode;

    private Deck mainDeck;

    private Card[] player1Cards;
    private Card player1PlayedCard;
    private int player1Tokens;
    private int player1BetTokens;
    private boolean player1PreviousAction;
    private int player1PreviousRaise;
    private boolean player1Fold = false;

    private Card[] player2Cards;
    private Card player2PlayedCard;
    private int player2Tokens;
    private int player2BetTokens;
    private boolean player2PreviousAction;
    private int player2PreviousRaise;
    private boolean player2Fold = false;

    private String state;

    public OnePoker(int mode){
        player1Tokens=8;
        player2Tokens=8;
        player1BetTokens=0;
        player2BetTokens=0;
        player1PreviousRaise=0;
        player2PreviousRaise=0;
        player1PreviousAction=RAISE;
        player2PreviousAction=RAISE;
        state = "not-started";
        mainDeck = new Deck();
        player1Cards = new Card[] {mainDeck.draw(),mainDeck.draw()};
        player2Cards = new Card[] {mainDeck.draw(),mainDeck.draw()};
        this.mode = mode;
    }

    public void playCard(int index){

        player1PlayedCard = player1Cards[index];
        player1Cards[index] = null;
        player1BetTokens++;
        player1Tokens--;
        if(player2PlayedCard==null) state = "p2play";
        else state = "p2bet";

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
        player2BetTokens++;
        player2Tokens--;
        if(player1PlayedCard==null) state = "p1play";
        else state = "p1bet";
    }

    public void betTokens(int tokens){
        player1Tokens-=tokens;
        player1BetTokens+=tokens;
        player1PreviousRaise=tokens-player2PreviousRaise;
        if (player1PreviousRaise==0) player1PreviousAction=CALL_OR_CHECK;
        else player1PreviousAction=RAISE;
        if(player1PreviousAction&&player2PreviousAction) state="decide-winner";
        else state="p2bet";
    }

    public int getTokens(){
        return player1Tokens;
    }

    public int getTokensBet(){
        return player1BetTokens;
    }

    public int getPreviousRaise(){
        return player1PreviousRaise;
    }
    
    public void P2BetTokens(int tokens){
        player2Tokens-=tokens;
        player2BetTokens+=tokens;
        player2PreviousRaise=tokens-player1PreviousRaise;
        if (player2PreviousRaise==0) player2PreviousAction=CALL_OR_CHECK;
        else player2PreviousAction=RAISE;
        if(player1PreviousAction&&player2PreviousAction) state="decide-winner";
        else state="p1bet";
    }

    public int getP2Tokens(){
        return player2Tokens;
    }

    public int getP2TokensBet(){
        return player2BetTokens;
    }

    public int getP2PreviousRaise(){
        return player2PreviousRaise;
    }

    public Card[] getCards(){
        return player1Cards;
    }

    public Card[] getP2Cards(){
        return player2Cards;
    }

    public boolean[] getOpponentCardsUp(){
        if(player2Cards[0]==null || player2Cards[1]==null) return new boolean[] {false,false};
        boolean up[] = {player2Cards[0].getRank()>7,player2Cards[1].getRank()>6};
        return up;
    }

    public boolean[] getP2OpponentCardsUp(){
        if(player1Cards[0]==null || player1Cards[1]==null) return new boolean[] {false,false};
        boolean up[] = {player1Cards[0].getRank()>7,player1Cards[1].getRank()>6};
        return up;
    }

    public Card getOpponentPlayedCard(){
        return player2PlayedCard;
    }

    public Card getP2OpponentPlayedCard(){
        return player1PlayedCard;
    }

    public void setState(String state){
        this.state = state;
    }

    public String getState(){
        return state;
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
        } else return -1;
    }

    public boolean winHand(){

        int winner = decideWinner();
        if(player1Fold){
            winner=-1;
            player1Fold=false;
        } else if(player2Fold){
            winner=1;
            player2Fold=false;
        }

        if(winner==1){
            player1Tokens+=player1BetTokens;
            player1Tokens+=player2BetTokens;
        } else if (winner==-1){
            player2Tokens+=player1BetTokens;
            player2Tokens+=player2BetTokens;
        } else {
            player1Tokens+=player1BetTokens;
            player2Tokens+=player2BetTokens;
        }
        player1BetTokens=0;
        player2BetTokens=0;
        player1PlayedCard=null;
        player2PlayedCard=null;
        player1PreviousRaise=0;
        player2PreviousRaise=0;
        player1PreviousAction=RAISE;
        player2PreviousAction=RAISE;
        if(player1Tokens==16 || player2Tokens==16) state = "game-over";
        else state = "play";
        redraw();
        return true;
    }

    public void fold(){
        player1Fold=true;
        state="decide-winner";
    }

    public void P2Fold(){
        player2Fold=true;
        state="decide-winner";
    }

}