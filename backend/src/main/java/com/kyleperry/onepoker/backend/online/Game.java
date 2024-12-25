package com.kyleperry.onepoker.backend.online;

import java.io.IOException;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import com.kyleperry.onepoker.backend.game.OnePoker;

public class Game {
    private String gameId; 
    private OnePoker pokerGame;
    private WebSocketSession[] playerSessions = new WebSocketSession[2];
    private String state;
    private String prevState;

    public Game(String gameId, WebSocketSession session) {
        this.playerSessions[0]=session;
        this.gameId = gameId;
        this.pokerGame = new OnePoker(1); 
        this.state = "waiting-p2";
    }

    public void addPlayer2(WebSocketSession session) throws IOException {
        this.playerSessions[1]=session;
        this.prevState = this.state;
        this.state = "in-progress";
        broadcast("p2joined", playerSessions[0]);
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

    public void broadcast(String message, WebSocketSession session) throws IOException{
        if(session.isOpen()){
            session.sendMessage(new TextMessage(message));
        }
    }
}
