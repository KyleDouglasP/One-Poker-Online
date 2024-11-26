package com.kyleperry.onepoker.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kyleperry.onepoker.backend.game.OnePoker;

@RestController
public class DeckController {

    OnePoker game;
    
    @GetMapping("/api/begin")
    public String[] beginGame() {
        game = new OnePoker(0); // Temporarily in BOT_MODE
        String cards[] = {game.getCards()[0].toString(), game.getCards()[1].toString()};
        return cards;
    }

    @GetMapping("/api/playerhand")
    public String[] playerHand() {
        String cards[] = {game.getCards()[0].toString(), game.getCards()[1].toString()};
        return cards;
    }

    @GetMapping("/api/opponenthand")
    public boolean[] opponentHand() {
        return game.getOpponentCardsUp();
    }

    @GetMapping("/api/play")
    public void playCard(int index){
        game.playCard(index);
    }

    @GetMapping("/api/opponentcard")
    public String getOpponentCard(){
        return game.getOpponentPlayedCard().toString();
    }

    @GetMapping("/api/handwinner")
    public int getWinnerOfHand(){
        /* TODO */
        int comparison = game.decideWinner();
        if (comparison==1) return 1;
        else if (comparison==-1) return -1;
        else return 0;
    }

    /* TODO */
    
}