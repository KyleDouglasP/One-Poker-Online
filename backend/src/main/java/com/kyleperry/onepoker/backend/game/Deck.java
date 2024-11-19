package com.kyleperry.onepoker.backend.game;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Deck{
    private List<Card> deck;

    public Deck(){
        deck = new ArrayList<>();
        for (Suit suit: Suit.values()){
            for(int i=1; i<14; i++){
                deck.add(new Card(suit, i));
            }
        }
    }

    public void shuffle(){
        Collections.shuffle(deck);
    }

    public Card draw(){
        if(deck.isEmpty()){
            for (Suit suit: Suit.values()){
                for(int i=1; i<14; i++){
                    deck.add(new Card(suit, i));
                }
            }
        }
        this.shuffle();
        return deck.remove(0);
    }
}