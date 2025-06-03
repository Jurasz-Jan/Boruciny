// data.ts
import {
    GameData,
    Token,
    TextCard,
    ChoiceCard,
    Map,
    GameState
  } from './types';
  
  const tokens: Record<string, Token> = {
    "1": { id: "1", cardId: "1", mapId: "1" },
    "4": { id: "4", cardId: "4", mapId: "1" },
    "5": { id: "5", cardId: "5", mapId: "1" },
    "16": { id: "16", cardId: "16", mapId: "2" },
    "17": { id: "17", cardId: "17", mapId: "2" },
    "22": { id: "22", cardId: "22", mapId: "2" },
  };
  
  const cards: Record<string, TextCard | ChoiceCard> = {
    // Karta wyboru (Brama)
    "1": {
      id: "1",
      type: "choice",
      question: "Brama jest zamknięta. Co robisz?",
      choices: [
        { id: "A", text: "Spróbuj otworzyć bramę", next: "2A", effect: "setFlag:triedGate" },
        { id: "B", text: "Przeskocz nad bramą", next: "2B" }
      ]
    },
  
    "2A": {
      id: "2A",
      type: "text",
      content: "Podchodzi starszy mężczyzna. To leśniczy Władek.",
      effect: "setFlag:metForester",
      removeToken: true
    },
  
    "2B": {
      id: "2B",
      type: "text",
      content: "Z trudem przeskakujesz przez bramę.",
      removeToken: true
    },
  
    "4": {
      id: "4",
      type: "choice",
      question: "Kot w ogrodzie patrzy na ciebie surowo.",
      choices: [
        { id: "A", text: "Wyciągasz rękę", next: "4A" },
        { id: "B", text: "Siadasz spokojnie", next: "4B" }
      ]
    },
  
    "4A": {
      id: "4A",
      type: "text",
      content: "Kot prycha i znika w krzakach.",
      removeToken: true
    },
  
    "4B": {
      id: "4B",
      type: "text",
      content: "Kot siada obok. Na medalionie czytasz: 'Gustaw'.",
      effect: "setFlag:metGustaw",
      removeToken: true
    },
  
    "5": {
      id: "5",
      type: "choice",
      question: "Przeglądasz komodę.",
      choices: [
        { id: "A", text: "Gazety", next: "5A" },
        { id: "B", text: "Zdjęcia", next: "5B" }
      ]
    },
  
    "5A": {
      id: "5A",
      type: "text",
      content: "Stara gazeta z artykułem o tragedii sprzed lat.",
      removeToken: true
    },
  
    "5B": {
      id: "5B",
      type: "text",
      content: "Zdjęcie ciotki, rodziców i leśniczego.",
      removeToken: true
    },
  
    "16": {
      id: "16",
      type: "text",
      content: "Widzisz ruiny i dziwny cień na ścianie.",
      removeToken: true
    },
  
    "22": {
      id: "22",
      type: "choice",
      question: "Sklepik Alicji. Co robisz?",
      choices: [
        { id: "A", text: "Kup herbatę z melisą", next: "22A", effect: "addItem:herbata" },
        { id: "B", text: "Zapytaj o leśniczego", next: "22B" }
      ]
    },
  
    "22A": {
      id: "22A",
      type: "text",
      content: "Kupujesz herbatę z melisą. Pomoże ci się skupić.",
      removeToken: true
    },
  
    "22B": {
      id: "22B",
      type: "text",
      content: "Alicja: 'Władek wraca zawsze. Czasem z psem.'",
      removeToken: true
    },
  
    "special": {
      id: "special",
      type: "text",
      content: "Odkrywasz nowy obszar!",
      condition: "tokenRemoved:1 & tokenRemoved:4",
      effect: "addMap:2:1:0"
    }
  };
  
  const maps: Record<string, Map> = {
    "1": {
      id: "1",
      name: "Dom Ciotki",
      tokens: ["1", "4", "5"]
    },
    "2": {
      id: "2",
      name: "Boruciny",
      tokens: ["16", "17", "22"]
    }
  };
  
  const initialGameState: GameState = {
    activeMaps: [{ id: "1", x: 0, y: 0 }],
    removedTokens: [],
    flags: [],
    inventory: []
  };
  
  const gameData: GameData = {
    tokens,
    cards,
    maps,
    initialGameState
  };
  
  export default gameData;
  