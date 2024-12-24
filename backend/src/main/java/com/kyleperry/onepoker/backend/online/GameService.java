package com.kyleperry.onepoker.backend.online;

import java.util.*;
import org.springframework.stereotype.Service;

@Service
public class GameService {
    
    private Map<String, Game> activeGames = new HashMap<>();  // Map of active games by gameId

    // Create a new game (for player1)
    public Game createGame(Player player1) {
        String gameId = UUID.randomUUID().toString();  // Generate a unique game ID
        Game game = new Game(gameId, player1);
        activeGames.put(gameId, game);
        return game;
    }

    // Join an existing game (for player2)
    public Game joinGame(String gameId, Player player2) {
        Game game = activeGames.get(gameId);
        if (game != null && game.getState().equals("waiting")) {
            game.addPlayer(player2);
        }
        return game;
    }

    // Get game by ID
    public Game getGameById(String gameId) {
        return activeGames.get(gameId);
    }

    // More methods to manage game lifecycle, etc.
}

