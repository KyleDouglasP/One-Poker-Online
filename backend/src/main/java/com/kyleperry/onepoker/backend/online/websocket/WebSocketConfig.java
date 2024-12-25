package com.kyleperry.onepoker.backend.online.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final GameWebSocketHandler gameWebSocketHandler;
    private final GameJoinWebSocketHandler gameJoinWebSocketHandler;

    public WebSocketConfig(GameWebSocketHandler gameWebSocketHandler, GameJoinWebSocketHandler gameJoinWebSocketHandler) {
        this.gameWebSocketHandler = gameWebSocketHandler;
        this.gameJoinWebSocketHandler = gameJoinWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(gameWebSocketHandler, "/game/create/{gameId}")
                .setAllowedOrigins("*");
        
        registry.addHandler(gameJoinWebSocketHandler, "/game/join/{gameId}")
                .setAllowedOrigins("*");
    }
}