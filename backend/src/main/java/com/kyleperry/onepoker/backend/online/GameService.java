package com.kyleperry.onepoker.backend.online;

import java.io.IOException;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;

@Service
public class GameService {

    private Map<String, Game> activeGames = new HashMap<>();  // Map of active games by gameId

    // Create a new game (for player1)
    public String createGame(String gameId, WebSocketSession session) {
        Game game = new Game(gameId, session);
        activeGames.put(gameId, game);
        return gameId;
    }

    // Join an existing game (for player2)
    public Game joinGame(String gameId, WebSocketSession session) throws IOException {
        Game game = activeGames.get(gameId);
        if (game != null && game.getState().equals("waiting")) {
            game.addPlayer2(session);
        }
        return game;
    }

    // Get game by ID
    public Game getGameById(String gameId) {
        return activeGames.get(gameId);
    }

    public boolean containsGame(String gameId){
        return activeGames.containsKey(gameId);
    }

    public Game removeGame(String gameId){
        return activeGames.remove(gameId);
    }
}

