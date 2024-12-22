package com.kyleperry.onepoker.backend.opponent;

import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.io.IOException;

public class GameWebSocketHandler extends TextWebSocketHandler {

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        try {
            // Process the incoming message
            System.out.println("Received message: " + message.getPayload());

            // Respond with a simple message
            session.sendMessage(new TextMessage("Response: Game message processed"));

        } catch (IOException e) {
            // Handle IOException specifically
            e.printStackTrace();
            session.sendMessage(new TextMessage("Error processing message: " + e.getMessage()));
        } catch (Exception e) {
            // Handle other exceptions
            e.printStackTrace();
            session.sendMessage(new TextMessage("Unexpected error: " + e.getMessage()));
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // Logic when WebSocket connection is established
        System.out.println("WebSocket connection established with session ID: " + session.getId());
    }
}
