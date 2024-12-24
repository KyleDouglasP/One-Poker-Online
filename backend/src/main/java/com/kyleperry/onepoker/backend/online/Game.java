package com.kyleperry.onepoker.backend.online;

import java.util.*;
import com.kyleperry.onepoker.backend.game.OnePoker;

public class Game {
    private String gameId; 
    private Player player1;  
    private Player player2; 
    private OnePoker pokerGame;  
    private String state;  

    public Game(String gameId, Player player1) {
        this.gameId = gameId;
        this.player1 = player1;
        this.pokerGame = new OnePoker(1); 
        this.state = "waiting";
    }

    public void addPlayer(Player player2) {
        this.player2 = player2;
        this.state = "in-progress";
    }

    public String getGameId() {
        return gameId;
    }

    public Player getPlayer1(){
        return player1;
    }

    public Player getPlayer2(){
        return player2;
    }

    public OnePoker getPokerGame() {
        return pokerGame;
    }

    public String getState() {
        return state;
    }

}
