import { GameData, GameState, ActiveMap, Token, TextCard, ChoiceCard, Choice, Map, CardID } from './types';

const tokens: Record<string, Token> = {
  "1": { id: "1", cardId: "1", mapId: "1" },
  "4": { id: "4", cardId: "4", mapId: "1" },
  "5": { id: "5", cardId: "5", mapId: "1" },
  "16": { id: "16", cardId: "16", mapId: "2" },
  "17": { id: "17", cardId: "17", mapId: "2" },
  "22": { id: "22", cardId: "22", mapId: "2" }
};

const cards: Record<string, TextCard | ChoiceCard> = {
  "1": {
    id: "1",
    type: "choice",
    question: "Brama do ogrodu. Co robisz?",
    choices: [
      { id: "A", text: "Otwórz ją", next: "2A", effect: "setFlag:openedGate" },
      { id: "B", text: "Zostaw ją", next: "2B" }
    ]
  },
  "2A": {
    id: "2A",
    type: "text",
    content: "Udało ci się otworzyć bramę.",
    removeToken: true
  },
  "2B": {
    id: "2B",
    type: "text",
    content: "Zostawiasz bramę w spokoju.",
    removeToken: true
  },
  "4": {
    id: "4",
    type: "choice",
    question: "Widzisz kota. Co robisz?",
    choices: [
      { id: "A", text: "Głaszcz kota", next: "4A" },
      { id: "B", text: "Ignoruj", next: "4B" }
    ]
  },
  "4A": {
    id: "4A",
    type: "text",
    content: "Kot mruczy i patrzy na ciebie uważnie.",
    effect: "setFlag:petCat",
    removeToken: true
  },
  "4B": {
    id: "4B",
    type: "text",
    content: "Kot odchodzi z pogardą.",
    removeToken: true
  },
  "5": {
    id: "5",
    type: "choice",
    question: "Komoda. Co przeszukujesz?",
    choices: [
      { id: "A", text: "Szuflada", next: "5A" },
      { id: "B", text: "Półka", next: "5B" }
    ]
  },
  "5A": {
    id: "5A",
    type: "text",
    content: "Znalazłeś zegarek.",
    effect: "addItem:zegarek",
    removeToken: true
  },
  "5B": {
    id: "5B",
    type: "text",
    content: "Nic ciekawego.",
    removeToken: true
  },
  "16": {
    id: "16",
    type: "text",
    content: "Ruiny starej stodoły. Pachnie dymem.",
    removeToken: true
  },
  "17": {
    id: "17",
    type: "text",
    content: "Na drzwiach napis: NIE WCHODŹ.",
    effect: "setFlag:seenWarning",
    removeToken: true
  },
  "22": {
    id: "22",
    type: "choice",
    question: "Sklepik. Co kupujesz?",
    choices: [
      { id: "A", text: "Herbata", next: "22A", effect: "addItem:herbata" },
      { id: "B", text: "Nic", next: "22B" }
    ]
  },
  "22A": {
    id: "22A",
    type: "text",
    content: "Masz herbatę.",
    removeToken: true
  },
  "22B": {
    id: "22B",
    type: "text",
    content: "Wychodzisz bez zakupów.",
    removeToken: true
  },
  "special": {
    id: "special",
    type: "text",
    content: "Nowy obszar odblokowany: Boruciny",
    condition: "tokenRemoved:1 & tokenRemoved:4",
    effect: "addMap:2:1:0",
    removeToken: false
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
  discoveredTokens: ["1", "4", "5", "16", "17", "22"],
  flags: [],
  inventory: [],
  triggeredEvents: []
};

const events: CardID[] = ["special"];

const gameData: GameData = {
  tokens,
  cards,
  maps,
  events,
  initialGameState
};

export default gameData;
