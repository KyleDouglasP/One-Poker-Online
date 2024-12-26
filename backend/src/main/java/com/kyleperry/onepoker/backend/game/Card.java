package com.kyleperry.onepoker.backend.game;

public class Card implements Comparable<Card>{
    private Suit suit; 
    private int rank;

    public Card(Suit suit, int rank){
        this.suit = suit;
        this.rank = rank;
    }

    public Suit getSuit(){
        return this.suit;
    }

    public int getRank(){
        return this.rank;
    }

    public String toString(){
        return suit.name()+rank;
    }

    @Override
    /* Returns 1 if first card wins, -1 if second card wins, 0 if they draw */
    public int compareTo(Card card){
        if(this.rank==2 && card.rank==14) return 1;
        if(this.rank==14 && card.rank==2) return -1;
        if(this.rank > card.rank) return 1;
        else if (this.rank < card.rank) return -1;
        else return 0;

    }
}