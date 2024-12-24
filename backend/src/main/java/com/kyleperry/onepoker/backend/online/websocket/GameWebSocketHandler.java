package com.kyleperry.onepoker.backend.online.websocket;

import com.kyleperry.onepoker.backend.game.OnePoker;
import com.kyleperry.onepoker.backend.online.Game;
import com.kyleperry.onepoker.backend.online.GameService;
import com.kyleperry.onepoker.backend.online.Player;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;

@Component  // Make it a Spring Bean
public class GameWebSocketHandler extends TextWebSocketHandler {

    private final GameService gameService;

    // Inject the GameService using constructor injection
    public GameWebSocketHandler(GameService gameService) {
        this.gameService = gameService;
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {
        String gameId = (String) session.getAttributes().get("gameId");  // Get gameId from session
        Game game = gameService.getGameById(gameId);  // Get the game instance by gameId
        OnePoker pokerGame = game.getPokerGame();

        // Get the player (Player 1 or Player 2)
        String playerName = (String) session.getAttributes().get("playerName");
        Player currentPlayer = playerName.equals(game.getPlayer1().getName()) ? game.getPlayer1() : game.getPlayer2();

        String action = message.getPayload();

        /* TODO: Handle game actions based on the received message */
    }
}
