import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const beginGame = async () => {
  try {
    const cards = await axios.get(`${API_URL}/begin`);
    return cards.data;
  } catch (error) {
    console.error('API Error beginning game', error);
  }
};

export const getOpponentCardsUp = async () => {
  try {
    const cards = await axios.get(`${API_URL}/opponenthand`);
    return cards.data;
  } catch (error) {
    console.error('API Fetching opponent cards', error);
  }
};

export const playCard = async (index) => {
  try {
    await axios.get(`${API_URL}/play?index=${index}`);
  } catch (error) {
    console.error('API Error playing card', error);
  }
};

export const getOpponentPlayedCard = async () => {
  try {
    const card = await axios.get(`${API_URL}/opponentcard`);
    return card.data;
  } catch (error) {
    console.error('API Error fetching opponent played card', error);
  }
};