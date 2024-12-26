package com.kyleperry.onepoker.backend.online.websocket;

import com.kyleperry.onepoker.backend.game.OnePoker;
import com.kyleperry.onepoker.backend.online.Game;
import com.kyleperry.onepoker.backend.online.GameService;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;

@Component  // Make it a Spring Bean
public class GameWebSocketHandler extends TextWebSocketHandler {

    private final GameService gameService;

    public GameWebSocketHandler(GameService gameService) {
        this.gameService = gameService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {


        String uri = session.getUri().toString();
        String gameId = uri.substring(uri.lastIndexOf("/") + 1);
        System.out.println("Opening game at " + gameId);
        
        gameService.createGame(gameId, session);

    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception{
        String uri = session.getUri().toString();
        String gameId = uri.substring(uri.lastIndexOf("/") + 1);
        System.out.println("Closing game at " + gameId);

        gameService.removeGame(gameId);
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
            pokerGame.playCard(0);
            game.broadcastGameStateAll();
        } else if(action.equals("playcard1")){
            pokerGame.playCard(1);
            game.broadcastGameStateAll();
        } else if(action.equals("winHand")){
            if(pokerGame.winHand()) game.broadcastGameStateAll();
        } else if(action.equals("fold")){
            pokerGame.fold();
            game.broadcastGameStateAll();
        } else if(action.contains("bet")){
            pokerGame.betTokens(Integer.parseInt(action.substring(action.lastIndexOf("bet")+3)));
            game.broadcastGameStateAll();
        } 
        /* TODO: Handle game actions based on the received message */
    }
}
