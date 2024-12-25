package com.kyleperry.onepoker.backend.online.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

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

        String uri = session.getUri().toString();
        String gameId = uri.substring(uri.lastIndexOf("/") + 1);
        System.out.println("Joining game at " + gameId);

        Game game = gameService.getGameById(gameId);
        
        if (game==null) {
            session.sendMessage(new TextMessage("Error: The game does not exist."));
            session.close(CloseStatus.NOT_ACCEPTABLE);
            return;
        }
        
        if (game.getState().equals("waiting-p2")) {
            game.addPlayer2();
            session.sendMessage(new TextMessage("Welcome Player 2 to the game: " + gameId));
        } else {
            session.sendMessage(new TextMessage("Error: The game is already full."));
            session.close(CloseStatus.NOT_ACCEPTABLE);  // Reject Player 2 if the game is full
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception{
        String uri = session.getUri().toString();
        String gameId = uri.substring(uri.lastIndexOf("/") + 1);
        System.out.println("P2 Leaving game at " + gameId);
        gameService.getGameById(gameId).removePlayer2();
    }

}
