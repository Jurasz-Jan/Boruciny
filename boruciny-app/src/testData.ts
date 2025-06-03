import { GameData, GameState, Token, TextCard, ChoiceCard, Map, CardID } from './types';

const tokens = {
  "1": { id: "1", cardId: "1", mapId: "1" },
  "2": { id: "2", cardId: "2", mapId: "1" },
  "3": { id: "3", cardId: "3", mapId: "1" },
  "30": { id: "30", cardId: "30", mapId: "2" },
};

const maps = {
  "1": {
    id: "1",
    name: "Mapa Testowa",
    tokens: ["1", "2", "3"]
  },
  "2": {
    id: "2",
    name: "Sekretna Mapa",
    tokens: ["30",]
  },
  "3": {
    id: "3",
    name: "Mapa Zdarzenia",
    tokens: []
  }
};

const cards: Record<string, TextCard | ChoiceCard> = {
  "1": {
    id: "1",
    type: "text",
    content: "To jest karta testowa. Zostanie ustawiona flaga 'flagaTestowa'.",
    effect: "setFlag:flagaTestowa",
    removeToken: true
  },
  "2": {
    id: "2",
    type: "text",
    content: "Otrzymujesz przedmiot: klucz testowy.",
    effect: "addItem:testKey;",
    removeToken: true
  },
  "3": {
    id: "3",
    type: "text",
    content: "Ten tekst pojawi się TYLKO jeśli masz flagę 'flagaTestowa' i item 'testKey'.",
    condition: "hasFlag:flagaTestowa & hasItem:testKey",
    effect: "setFlag:flagaNumerTrzy; removeItem:testKey; addItem:staryList;addMap:2:1:0;",
    removeToken: true
  },
  "30": {
  id: "30",
  type: "choice",
  question: "W kącie pokoju stoi tajemnicza skrzynia. Jest stara, ozdobiona symbolami i lekko uchylona.",
  choices: [
    { id: "30A", text: "Otwórz skrzynię", next: "30A" },
    { id: "30B", text: "Zostaw ją w spokoju", next: "30B" }
  ]
},
"30A": {
  id: "30A",
  type: "text",
  content: "Wewnątrz znajduje się stary naszyjnik i notatka z inicjałami Twojej ciotki.",
  effect: "addItem:staryNaszyjnik; setFlag:skrzyniaOtwarta"
},
"30B": {
  id: "30B",
  type: "text",
  content: "Czujesz dziwną obecność, ale postanawiasz nie ruszać skrzyni.",
  effect: "setFlag:skrzyniaZignorowana"
},
  "eventTest": {
    id: "eventTest",
    type: "text",
    content: "Zdarzenie testowe zostało wywołane po usunięciu tokenów 1 i 2.",
    condition: "tokenRemoved:1 & tokenRemoved:2",
    effect: "addMap:3:0:1"
  }
};

const initialGameState: GameState = {
  activeMaps: [{ id: "1", x: 0, y: 0 }],
  removedTokens: [],
  discoveredTokens: ["1", "2", "3"],
  flags: [],
  inventory: [],
  triggeredEvents: []
};

const events: CardID[] = ["eventTest"];

const gameData: GameData = {
  tokens,
  maps,
  cards,
  events,
  initialGameState
};

export default gameData;
