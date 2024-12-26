package com.kyleperry.onepoker.backend.online;

import java.io.IOException;
import java.util.Map;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kyleperry.onepoker.backend.game.OnePoker;

public class Game {
    private String gameId; 
    private OnePoker pokerGame;
    private WebSocketSession[] playerSessions = new WebSocketSession[2];
    private String state;

    public Game(String gameId, WebSocketSession session) {
        this.playerSessions[0]=session;
        this.gameId = gameId;
        this.pokerGame = new OnePoker(1); 
        this.state = "waiting-p2";
    }

    public void addPlayer2(WebSocketSession session) throws IOException {
        this.playerSessions[1]=session;
        this.state = "in-progress";
        pokerGame.setState("play");
        broadcast("message", "p2joined", playerSessions[0]);
    }

    public void removePlayer2(){
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

    public void broadcast(String type, String message, WebSocketSession session) throws IOException{

        ObjectMapper objectMapper = new ObjectMapper();
        String jsonMessage = objectMapper.writeValueAsString(Map.of(
            "type", type,
            "message", message
        ));

        if(session.isOpen()){
            session.sendMessage(new TextMessage(jsonMessage));
        }
    }

    public void broadcastGameState(WebSocketSession session) throws IOException{
        if(session.isOpen()){
            String jsonMessage = "";
            String state = pokerGame.getState();
            if(session.equals(playerSessions[0])){

                if(state.equals("play")) state = "play";
                if(state.equals("p1play")) state = "play";
                if(state.equals("p2play")) state = "wait";
                if(state.equals("p1bet")) state = "bet";
                if(state.equals("p2bet")) state = "bet-wait";
                if(state.equals("decide-winner")) state = "decide-winner";
                if(state.equals("game-over")) state = "game-over";

                jsonMessage = "{"
                    + "\"type\": \"UPDATE\","
                    + "\"state\": \"" + state + "\","
                    + "\"Card1\": \"" + pokerGame.getCards()[0] + "\","
                    + "\"Card2\": \"" + pokerGame.getCards()[1] + "\","
                    + "\"Tokens\": \"" + pokerGame.getTokens() + "\","
                    + "\"TokensBet\": \"" + pokerGame.getTokensBet() + "\","
                    + "\"PlayedCard\": \"" + pokerGame.getP2OpponentPlayedCard() + "\","
                    + "\"OpponentPlayedCard\": \"" + pokerGame.getOpponentPlayedCard() + "\","
                    + "\"OpponentHand1\": \"" + pokerGame.getOpponentCardsUp()[0] + "\","
                    + "\"OpponentHand2\": \"" + pokerGame.getOpponentCardsUp()[1] + "\","
                    + "\"OpponentTokens\": \"" + pokerGame.getP2Tokens() + "\","
                    + "\"OpponentTokensBet\": \"" + pokerGame.getP2TokensBet() + "\","
                    + "\"PreviousOpponentRaise\": \"" + pokerGame.getP2PreviousRaise() + "\""
                    + "}";
            } else {

                if(state.equals("play")) state = "play";
                if(state.equals("p1play")) state = "wait";
                if(state.equals("p2play")) state = "play";
                if(state.equals("p1bet")) state = "bet-wait";
                if(state.equals("p2bet")) state = "bet";
                if(state.equals("decide-winner")) state = "decide-winner";
                if(state.equals("game-over")) state = "game-over";

                jsonMessage = "{"
                    + "\"type\": \"UPDATE\","
                    + "\"state\": \"" + state + "\","
                    + "\"Card1\": \"" + pokerGame.getP2Cards()[0] + "\","
                    + "\"Card2\": \"" + pokerGame.getP2Cards()[1] + "\","
                    + "\"Tokens\": \"" + pokerGame.getP2Tokens() + "\","
                    + "\"TokensBet\": \"" + pokerGame.getP2TokensBet() + "\","
                    + "\"PlayedCard\": \"" + pokerGame.getOpponentPlayedCard() + "\","
                    + "\"OpponentPlayedCard\": \"" + pokerGame.getP2OpponentPlayedCard() + "\","
                    + "\"OpponentHand1\": \"" + pokerGame.getP2OpponentCardsUp()[0] + "\","
                    + "\"OpponentHand2\": \"" + pokerGame.getP2OpponentCardsUp()[1] + "\","
                    + "\"OpponentTokens\": \"" + pokerGame.getTokens() + "\","
                    + "\"OpponentTokensBet\": \"" + pokerGame.getTokensBet() + "\","
                    + "\"PreviousOpponentRaise\": \"" + pokerGame.getPreviousRaise() + "\""
                    + "}";
            }
            session.sendMessage(new TextMessage(jsonMessage));
        }
    }
    
    public void broadcastGameStateAll() throws IOException{
        String jsonMessage = "";
        String state = pokerGame.getState();
        String returnState = "";
        if(state.equals("play")) returnState = "play";
        if(state.equals("p1play")) returnState = "play";
        if(state.equals("p2play")) returnState = "wait";
        if(state.equals("p1bet")) returnState = "bet";
        if(state.equals("p2bet")) returnState = "bet-wait";
        if(state.equals("decide-winner")) returnState = "decide-winner";
        if(state.equals("game-over")) returnState = "game-over";
        jsonMessage = "{"
            + "\"type\": \"UPDATE\","
            + "\"state\": \"" + returnState + "\","
            + "\"Card1\": \"" + pokerGame.getCards()[0] + "\","
            + "\"Card2\": \"" + pokerGame.getCards()[1] + "\","
            + "\"Tokens\": \"" + pokerGame.getTokens() + "\","
            + "\"TokensBet\": \"" + pokerGame.getTokensBet() + "\","
            + "\"PlayedCard\": \"" + pokerGame.getP2OpponentPlayedCard() + "\","
            + "\"OpponentPlayedCard\": \"" + pokerGame.getOpponentPlayedCard() + "\","
            + "\"OpponentHand1\": \"" + pokerGame.getOpponentCardsUp()[0] + "\","
            + "\"OpponentHand2\": \"" + pokerGame.getOpponentCardsUp()[1] + "\","
            + "\"OpponentTokens\": \"" + pokerGame.getP2Tokens() + "\","
            + "\"OpponentTokensBet\": \"" + pokerGame.getP2TokensBet() + "\","
            + "\"PreviousOpponentRaise\": \"" + pokerGame.getP2PreviousRaise() + "\""
            + "}";
        playerSessions[0].sendMessage(new TextMessage(jsonMessage));
        if(state.equals("play")) returnState = "play";
        if(state.equals("p1play")) returnState = "wait";
        if(state.equals("p2play")) returnState = "play";
        if(state.equals("p1bet")) returnState = "bet-wait";
        if(state.equals("p2bet")) returnState = "bet";
        if(state.equals("decide-winner")) returnState = "decide-winner";
        if(state.equals("game-over")) returnState = "game-over";
        jsonMessage = "{"
            + "\"type\": \"UPDATE\","
            + "\"state\": \"" + returnState + "\","
            + "\"Card1\": \"" + pokerGame.getP2Cards()[0] + "\","
            + "\"Card2\": \"" + pokerGame.getP2Cards()[1] + "\","
            + "\"Tokens\": \"" + pokerGame.getP2Tokens() + "\","
            + "\"TokensBet\": \"" + pokerGame.getP2TokensBet() + "\","
            + "\"PlayedCard\": \"" + pokerGame.getOpponentPlayedCard() + "\","
            + "\"OpponentPlayedCard\": \"" + pokerGame.getP2OpponentPlayedCard() + "\","
            + "\"OpponentHand1\": \"" + pokerGame.getP2OpponentCardsUp()[0] + "\","
            + "\"OpponentHand2\": \"" + pokerGame.getP2OpponentCardsUp()[1] + "\","
            + "\"OpponentTokens\": \"" + pokerGame.getTokens() + "\","
            + "\"OpponentTokensBet\": \"" + pokerGame.getTokensBet() + "\","
            + "\"PreviousOpponentRaise\": \"" + pokerGame.getPreviousRaise() + "\""
            + "}";
        playerSessions[1].sendMessage(new TextMessage(jsonMessage));
    }
}
