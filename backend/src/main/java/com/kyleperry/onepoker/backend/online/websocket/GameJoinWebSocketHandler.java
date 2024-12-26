package com.kyleperry.onepoker.backend.online.websocket;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kyleperry.onepoker.backend.game.OnePoker;
import com.kyleperry.onepoker.backend.online.Game;
import com.kyleperry.onepoker.backend.online.GameService;

@Component
public class GameJoinWebSocketHandler extends TextWebSocketHandler {

    private final GameService gameService;

    public GameJoinWebSocketHandler(GameService gameService) {
        this.gameService = gameService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {

        ObjectMapper objectMapper = new ObjectMapper();
        String jsonMessage = "";

        String uri = session.getUri().toString();
        String gameId = uri.substring(uri.lastIndexOf("/") + 1);
        System.out.println("Joining game at " + gameId);

        Game game = gameService.getGameById(gameId);
        
        if (game==null) {
            jsonMessage = objectMapper.writeValueAsString(Map.of(
            "type", "ERROR",
            "message", "Error: The game does not exist."
            ));
            session.sendMessage(new TextMessage(jsonMessage));
            session.close(CloseStatus.NOT_ACCEPTABLE);
            return;
        }
        
        if (game.getState().equals("waiting-p2")) {
            game.addPlayer2(session);
            jsonMessage = objectMapper.writeValueAsString(Map.of(
            "type", "MESSAGE",
            "message", ("Welcome Player 2 to the game: " + gameId)
            ));
            session.sendMessage(new TextMessage(jsonMessage));
            game.broadcastGameStateAll();
        } else {
            jsonMessage = objectMapper.writeValueAsString(Map.of(
            "type", "ERROR",
            "message", "Error: The game is already full."
            ));
            session.sendMessage(new TextMessage(jsonMessage));
            session.close(CloseStatus.NOT_ACCEPTABLE);  // Reject Player 2 if the game is full
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception{
        String uri = session.getUri().toString();
        String gameId = uri.substring(uri.lastIndexOf("/") + 1);
        System.out.println("P2 Leaving game at " + gameId);
        Game game = gameService.getGameById(gameId);
        if (!(game==null)) game.removePlayer2();
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String uri = session.getUri().toString();
        String gameId = uri.substring(uri.lastIndexOf("/") + 1);
        Game game = gameService.getGameById(gameId);  // Get the game instance by gameId

        OnePoker pokerGame = game.getPokerGame();
        String action = message.getPayload();

        if(action.equals("updateRequest")) game.broadcastGameState(session);
        else if(action.equals("playcard0")) {
            pokerGame.P2PlayCard(0);
            game.broadcastGameStateAll();
        } else if(action.equals("playcard1")){
            pokerGame.P2PlayCard(1);
            game.broadcastGameStateAll();
        } else if(action.equals("winHand")){
        } else if(action.equals("fold")){
            pokerGame.P2Fold();
            game.broadcastGameStateAll();
        } else if(action.contains("bet")){
            pokerGame.P2BetTokens(Integer.parseInt(action.substring(action.lastIndexOf("bet")+3)));
            game.broadcastGameStateAll();
        } 
        /* TODO: Handle game actions based on the received message */
    }

}
