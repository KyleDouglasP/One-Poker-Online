package com.kyleperry.onepoker.backend.online;

import java.util.*;
import com.kyleperry.onepoker.backend.game.OnePoker;

public class Game {
    private String gameId; 
    private OnePoker pokerGame;  
    private String state;
    private String prevState;

    public Game(String gameId) {
        this.gameId = gameId;
        this.pokerGame = new OnePoker(1); 
        this.state = "waiting-p2";
    }

    public void addPlayer2() {
        this.prevState = this.state;
        this.state = "in-progress";
    }

    public void removePlayer2(){
        this.prevState = this.state;
        this.state = "waiting-p2";
    }

    public String getGameId() {
        return gameId;
    }

    public OnePoker getPokerGame() {
        return pokerGame;
    }

    public String getState() {
        return state;
    }

}
