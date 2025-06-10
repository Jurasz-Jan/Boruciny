// Import the necessary types
import {
  Token,
  Card,
  Map,
  GameState,
  GameData,
  TextCard, 
  ChoiceCard,
  CardID 
} from './types'; 

//tokens
const tokens: Record<string, Token> = {
  "1": { id: "1", cardId: "1", mapId: "1" },
  "2": { id: "2", cardId: "2", mapId: "1" },
  "4": { id: "4", cardId: "4", mapId: "2" },
  "5": { id: "5", cardId: "5", mapId: "2" },
  "6": { id: "6", cardId: "6", mapId: "2" },
  "9": { id: "9", cardId: "9", mapId: "2" },
  "18": { id: "18", cardId: "18", mapId: "2" },
  "16": { id: "16", cardId: "16", mapId: "5" },
  "17": { id: "17", cardId: "17", mapId: "6" },
  "22": { id: "22", cardId: "22", mapId: "6" },
  "23": { id: "23", cardId: "23", mapId: "3" },
  "24": { id: "24", cardId: "24", mapId: "8" },
  "27": { id: "27", cardId: "27", mapId: "5" },
  "87": { id: "87", cardId: "87", mapId: "7" },
  "101": { id: "101", cardId: "101", mapId: "4" },
  "102": { id: "102", cardId: "102", mapId: "4" },
};

// Your maps definition
const maps: Record<string, Map> = {
  "1": {
    id: "1",
    name: "Brama w lesie",
    tokens: ["1", "2"]
  },
  "2": {
    id: "2",
    name: "Dom Ciotki",
    tokens: ["4", "5", "6", "9", "18"]
  },
  "3": {
    id: "3",
    name: "Ścieżka do Borucin",
    tokens: [ "23"]
  },
  "4": {
    id: "4",
    name: "Lasek koło plebanii",
    hiddenTokens: ["101", "102"], // Hidden tokens for this map
    tokens: ["101", "102"]
  },
  "5": {
    id: "5",
    name: "Plac główny, kiosk Pani Bogusi",
    tokens: ["16", "27"],
    hiddenTokens:["27"] 
  },
  "6": {
    id: "6",
    name: "Sklep i bar Alicji i Eryka",
    tokens: ["17", "22"]
  },
  "7": {
    id: "7",
    name: "Kapliczka św. Rocha",
    tokens: ["87"]
  },
  "8": {
    id: "8",
    name: "Kościół i plebania",
    tokens: [ "24"]
  },
  "10": {
    id: "10",
    name: "Samochód Ciotki",
    tokens: ["9"]
  },
};

// --- THIS IS CRITICAL---
const cards: Record<string, Card> = {
  // Brama przed domem Ciotki
  "1": {
    id: "1",
    type: "choice", // This is now correctly type-checked as the literal "choice"
    question: "Dobierz kartę 1",
    choices: [
      { id: "1A", text: "Spróbuj otworzyć bramę", next: "1A_try_open" },
      { id: "1B_choice", text: "Przeskocz nad bramą", next: "1B" }
    ],
    removeToken: false,
  } as ChoiceCard, 
  // Type assertion for clarity,
  "3": {
  id: "3",
  type: "text",
  condition: "hasFlag:bramaOtwarta",
  content: "Dobierz kartę 3",
  effect: "addMap:2:0:0; removeToken:1; addMap:3:1:1; addMap:4:2:2; addMap:5:0:3; addMap:6:0:2; addMap:7:1:3; addMap:8:1:2; addMap:9:0:2;", // <-- POPRAWIONY CIĄG EFEKTÓW
  removeToken: true, // Usuwamy token, bo brama otwarta (ten removeToken tutaj jest już niepotrzebny, skoro masz go w 'effect', ale nie zaszkodzi)
} as TextCard,

  "1A_try_open": { // Zmieniono ID, aby było jasne co robi ta karta
    id: "1A_try_open",
    type: "text", // Może być tekstową, jeśli tylko sprawdza warunek i przekierowuje
    content: "Próbujesz otworzyć bramę...", // Ten tekst może się nie pojawić, jeśli warunek od razu przekieruje
    condition: "hasFlag:bramaOtwarta", // Nadal sprawdzamy flagę dla sukcesu
    onConditionFail: "1C", // Przekierowanie, jeśli flaga NIE jest ustawiona
    effect: "", // Brak efektu na tej karcie, bo to tylko "przejście"
    removeToken: false,
    next: "3" // Jeśli warunek spełniony, przejdź do karty sukcesu
  } as TextCard,

  "1B": {
    id: "1B",
    type: "text",
    content: "Co prawda upadłeś na ziemię, ale również nie udało Ci się otworzyć bramy.",
    removeToken: false,
  } as TextCard,

  "1C": {
    id: "1C",
    type: "text",
    content: "Nie masz klucza, nie otworzysz bramy.",
    removeToken: false,
  } as TextCard,

  

  "2": {
    id: "2",
    type: "choice", 
    question: "Dobierz kartę 2",
    choices: [
      { id: "2A", text: "Poproś o otworzenie bramy", next: "2A", effect: "setFlag:bramaOtwarta" },
      { id: "2B", text: "Zagadaj do leśniczego", next: "2B", effect: "setFlag:zaufanieWladka; setFlag:bramaOtwarta" }
    ],
    removeToken: true,
    // condition: "!hasItem:klucz"
  } as ChoiceCard, // Type assertion for clarity

  "2A": {
    id: "2A",
    type: "text",
    content: "Nie ma sprawy młody człowieku. No, poszło, kierowniku złoty.",
    removeToken: false,
  } as TextCard,

  "2B": {
    id: "2B",
    type: "text",
    content: "Jak tam u mnie? Ja jeszcze w pracy, ale kto późno przychodzi ten wcześnie wychodzi! No, otworzyłem Ci bramę, kierowniku.",
    removeToken: false,
  } as TextCard,


  // 3 brama sie otwiera
  // W Domu Ciotki
  "4": {
    id: "4",
    type: "choice",
    question: "Dobierz kartę 4",
    choices: [
      { id: "4A_choice", text: "Kucasz i sięgasz ręką, by go zawołać.", next: "4A" },
      { id: "4B_choice", text: "Siadasz w cieniu nie odzywasz się.", next: "4B" }
    ],
    removeToken: true
  } as ChoiceCard,

  "4A": {
    id: "4A",
    type: "text",
    content: "Dobierz kartę 4A",
    removeToken: true
  } as TextCard,

  "4B": {
    id: "4B",
    type: "text",
    content: "Dobierz kartę 4B",
    effect: "setFlag:metGustaw; addItem:Pierwszy Dukat",
    removeToken: true
  } as TextCard,

  "5": {
    id: "5",
    type: "choice",
    question: "Blat komody zapełniony jest różnorakimi przedmiotami. Twoją uwagę przyciągają jednak sterta starych gazet i zdjęcia rodzinne.",
    choices: [
      { id: "5A_choice", text: "Przejrzyj gazety", next: "5A" },
      { id: "5B_choice", text: "Spójrz na zdjęcia", next: "5B" }
    ],
    removeToken: true
  } as ChoiceCard,

  "5A": {
    id: "5A",
    type: "text",
    content: "Dobierz kartę 5A",
    removeToken: true
  } as TextCard,

  "5B": {
    id: "5B",
    type: "text",
    content: "Dobierz kartę 5B",
    removeToken: true
  } as TextCard,

  "6": {
    id: "6",
    type: "choice",
    question: "Dobierz kartę 6.",
    choices: [
      { id: "6A_choice", text: "Spróbuj otworzyć schowek", next: "6A_try_open" },
      { id: "6B_choice", text: "Odejdź", next: "" } // Change null to empty string or a designated 'end' card ID
    ],
    removeToken: false
  } as ChoiceCard,

  "6A_try_open": {
    id: "6A_try_open",
    type: "text",
    content: "Próbujesz otworzyć schowek…",
    condition: "hasItem:klucz",
    onConditionFail: "6A", 
    next: "7", 
    
    removeToken: false
  } as TextCard,

  "6A": {
    id: "6A",
    type: "text",
    content: "Dobierz kartę 6A",
    
    removeToken: false
  } as TextCard,

  "7": {
    id: "7",
    type: "text",
    content: "Dobierz kartę 7",
    condition: "inputCode:PAMIĘĆ",
    onConditionFail:"",
    next: "8",
    removeToken: false
  } as TextCard,

  "8": {
    id: "8",
    type: "text",
    content: "Dobierz kartę 8. Przeczytaj załącznik nr 1.",
    effect: "setFlag:zagadkaRozwiazana; addItem:notatkiCiotki; addItem:kluczykDoAuta; revealToken:102;",
    removeToken: true
  } as TextCard,

  "9": {
    id: "9",
    type: "choice",
    question: "Dobierz kartę 9.",
    choices: [
      { id: "9A_choice", text: "Spróbuj uruchomić auto", next: "9_choice" },
      { id: "9B_choice", text: "Odejdź", next: "" } // Change null to empty string or a designated 'end' card ID
    ],
    removeToken: false
  } as ChoiceCard,

  "9_choice": {
    id: "9_choice",
    type: "text",
    content: "Wchodzisz do auta",
    condition: "hasItem:kluczykDoAuta",
    onConditionFail: "9A",
    next: "9B",
    removeToken: true
  } as TextCard,
  
  "9A": {
    id: "9A",
    type: "text",
    content: "Dobierz kartę 9A",
    condition: "!hasItem:kluczykDoAuta",
    removeToken: false
  } as TextCard,
  
  "9B": {
    id: "9B",
    type: "text",
    content: "Dobierz kartę 9B",
    condition: "hasItem:kluczykDoAuta",
    effect: "setFlag:graWygrana",
    removeToken: true
  } as TextCard,

  "18": {
    id: "18",
    type: "choice",
    question: "Dobierz kartę 18",
    choices: [
      { id: "18A_choice", text: "Sprawdź herbatę", next: "18A" },
      { id: "18B_choice", text: "Sprawdź słoiki", next: "18B" }
    ],
    removeToken: true
  } as ChoiceCard,

  "18A": {
    id: "18A",
    type: "text",
    content: "Dobierz kartę 18A",
    removeToken: true
  } as TextCard,

  "18B": {
    id: "18B",
    type: "text",
    content: "Dobierz kartę 18B",
    effect: "addItem:ziołaNaPamięć",
    removeToken: true
  } as TextCard,

  // Boruciny
  "16": {
    id: "16",
    type: "choice",
    question: "Dobierz kartę 16",
    choices: [
      { id: "16A_choice", text: "Zapytaj Bogusię o ciotkę", next: "16A" },
      { id: "16B_choice", text: "Zaoferuj kupienie Władkowi szlugów", next: "16B_choice" }
    ],
    removeToken: true
  } as ChoiceCard,

  "16A": {
    id: "16A",
    type: "text",
    content: "Dobierz kartę 16A",
    removeToken: true
  } as TextCard,

  "16B_choice": {
    id: "16B",
    type: "text",
    content: "Oferujesz Władkowi kupno paczki szlugów.",
    condition: "hasFlag:zaufanieWladka",
    onConditionFail: "16C",
    next: "16B",
    removeToken: true
  } as TextCard,

  "16B": {
    id: "16B",
    type: "text",
    content: "Dobierz kartę 16B",
    condition: "hasFlag:zaufanieWladka",
    effect: "addItem:Trzeci Dukat",
    removeToken: true
  } as TextCard,

  "16C": {
    id: "16C",
    type: "text",
    content: "Dobierz kartę 16C",
    condition: "!hasFlag:zaufanieWladka",
    removeToken: true
  } as TextCard,

  "17": {
    id: "17",
    type: "choice",
    question: "Dobierz kartę 17",
    choices: [
      { id: "17A_choice", text: "Zamów coś i zagadaj", next: "17A" },
      { id: "17B_choice", text: "Zapytaj o mieszkańców", next: "17B" }
    ],
    removeToken: true
  } as ChoiceCard,

  "17A": {
    id: "17A",
    type: "text",
    content: "Dobierz kartę 17A",
    removeToken: true
  } as TextCard,

  "17B": {
    id: "17B",
    type: "text",
    content: "Dobierz kartę 17B",
    removeToken: true
  } as TextCard,

  "22": {
    id: "22",
    type: "choice",
    question: "Dobierz kartę 22",
    choices: [
      { id: "22A_choice", text: "Kup Leśny Dzban", next: "22A" },
      { id: "22B_choice", text: "Zapytaj o Leśniczego", next: "22B" }
    ],
    removeToken: false
  } as ChoiceCard,

  // IMPORTANT: 
  "22A": {
    id: "22A",
    type: "text",
    content: "Dobierz kartę 22A",
    next: "22C", // Automatically transition to the next card to offer purchase
    removeToken: false // Keep token active until purchase is made
  } as TextCard,

  "22C": {
    id: "22C",
    type: "choice", // This is where the choice to buy happens
    question: "Dobierz kartę 22C",
    choices: [
        { id: "buy_dzban", text: "Kup Leśny Dzban", next: "DZBAN_PURCHASE_CONFIRM", effect: " addItem:LeśnyDzban", condition: "hasItem:Pierwszy Dukat && hasItem:Drugi Dukat && hasItem:Trzeci Dukat" },
        { id: "dont_buy_dzban", text: "Nie kupuj", next: "" } // Leads nowhere or back to map
    ],
    removeToken: true
  } as ChoiceCard,
  // NOTE: You'll need a "DZBAN_PURCHASE_CONFIRM" card if you want a confirmation message.
  // For simplicity, if effect is applied, it means purchase is successful.
  // If next is "", it typically means returning to the map or ending current card flow.

  "22B": {
    id: "22B",
    type: "text",
    content: "Dobierz kartę 22B",
    removeToken: true
  } as TextCard,

  "23": {
    id: "23",
    type: "choice",
    question: "Dobierz kartę 23, kierowniku.",
    choices: [
      { id: "23A_choice", text: "Spróbuj podejść do psa", next: "23_does_have_weed" },
      { id: "23B_choice", text: "Zawołaj go", next: "23B" }
    ],
    removeToken: true
  } as ChoiceCard,

  "23_does_have_weed": {
    id: "23_does_have_weed",
    type: "text",
    content: "Podchodzisz powoli",
    condition: "hasItem:ziołaNaPamięć",
    onConditionFail: "23A",
    next: "23C",
    removeToken: true
  } as TextCard,

  "23B": {
    id: "23B",
    type: "text",
    content: "Pies ewidentnie ma więcej rozsądku od Ciebie w tej sytuacji. Po chwili wstaje, wchodzi w las i znika, jakby go wcale tu nie było. Może trzeba było podejść inaczej.",
    removeToken: true
  } as TextCard,


  "23C": {
    id: "22B",
    type: "text",
    content: "Dobierz kartę 23C, kierowniku.",
    effect: "addItem:Drugi Dukat",
    removeToken: true
  } as TextCard,
  // IMPORTANT: You have two versions of Card "24" with different content and choices.
  // This implies conditional display. I'll use your "_v2" naming for the second version.
   
  "23A": {
    id: "23A",
    type: "text",
    content: "Dobierz kartę 23A",
    removeToken: true
  } as TextCard,

  "24": {
    id: "24",
    type: "choice",
    question: "Dobierz kartę 24",
    choices: [
      { id: "24_choice_A", text: "Siadasz, pijesz herbatę i słuchasz", next: "24A" },
      { id: "24_choice_B", text: "Zagadujesz go o Boruciny", next: "24B" }
    ],
    removeToken: false 
  } as ChoiceCard,

  "24A": {
    id: "24A",
    type: "choice", 
    question: "Dobierz kartę 24A",
    choices: [
      { id: "24A_choice_A", text: "Zapytaj, co konkretnie miała na myśli", next: "25A" },
      { id: "24A_choice_B", text: "Powiedz, że też coś czujesz", next: "25B" }
    ],
    removeToken: false 
  } as ChoiceCard,

  "25A": {
    id: "25A",
    type: "text",
    content: "Dobierz kartę 25A",
    effect: "removeToken:24",
    removeToken: true 
  } as TextCard,

  "25B": {
    id: "25B",
    type: "text",
    content: " Dobierz kartę 25B",
    effect: "removeToken:24",
    removeToken: true 
  } as TextCard,

  "24B": {
    id: "24B",
    type: "choice", 
    question: "Dobierz kartę 24B",
    choices: [
      { id: "24B_choice_A", text: "Pytasz, czy on sam coś takiego przeżył", next: "26A" },
      { id: "24B_choice_B", text: "Pytasz, czy da się temu jakoś zaradzić", next: "26B" }
    ],
    removeToken: false 
  } as ChoiceCard,

  "26A": {
    id: "26A",
    type: "text",
    content: "Dobierz kartę 26A",
    effect: "removeToken:24",
    
    removeToken: true 
  } as TextCard,

  "26B": {
    id: "26B",
    type: "text",
    content: "Dobierz kartę 26B",
    effect: "removeToken:24",
    
    removeToken: true 
  } as TextCard,
  "27": {
    id: "27",
    type: "choice",
    question: "Dobierz kartę 27",
    choices: [
      { id: "27A_choice", text: "Postaw im 'Leśny Dzban' i spróbuj wyciągnąć informacje.", next: "27A", condition: "hasItem:LeśnyDzban" },
      { id: "27B_choice", text: "Obejdź ławeczkę szerokim łukiem", next: "" }
    ],
    removeToken: true
  } as ChoiceCard,

  "27A": {
    id: "27A",
    type: "text",
    content: "Dobierz kartę 27A",
    effect: "setFlag:knowWhereKey",
    removeToken: true
  } as TextCard,

  "87": {
    id: "87",
    type: "choice",
    question: "Dobierz kartę 87",
    effect:"setFlag:playerIsReady",
    choices: [
      { id: "87A_choice", text: "Pomódl się", next: "87A" },
      { id: "87B_choice", text: "Przyjrzyj się kapliczce", next: "87B" }
    ],
    removeToken: false
  } as ChoiceCard,

  "87A": {
    id: "87A",
    type: "text",
    content: "Dobierz kartę 87A",
    removeToken: false
  } as TextCard,

  "87B": {
    id: "87B",
    type: "text",
    content: "Kapliczka św. Rocha, patrona pamięci. ",
    condition: "hasFlag:knowWhereKey",
    onConditionFail: "87B_read",
    effect: "",
    next: "87C",
    removeToken: false
  } as TextCard,


  "87C": {
    id: "87C",
    type: "text",
    content: "Dobierz kartę 87C",
    effect: "addItem:klucz",
    removeToken: true
  } as TextCard,

  "87B_read": {
    id: "87B_read",
    type: "text",
    content: "Dobierz kartę 87B",
    removeToken: false
  } as TextCard,
  // Poranek (eventy)
  "100": {
    id: "100",
    type: "text",
    condition: "hasFlag:playerIsReady",
    content: "Zapadła noc. W nocy słyszysz nieopodal jakiś dziwny dźwięk. Rano powinieneś zbadać co to.",
    effect: "revealToken:101; revealToken:27; removeToken:24;",
    next:"105",
    removeToken: true
  } as TextCard,
  "101": {
    id: "101",
    type: "text",
    content: "Dobierz kartę 101",
    effect: "setFlag:ProboszczMartwy",
    removeToken: true
  } as TextCard,

  "102": {
    id: "102",
    type: "text",
    content: "Dobierz kartę 102. Gratulacje.",
    condition: "hasItem:notatkiCiotki",
    effect: "setFlag:graWygranaSuicide",
    removeToken: true
  } as TextCard,
};

// Your initial game state
const initialGameState: GameState = {
  activeMaps: [{ id: "1", x: 0, y: 1 }],
  removedTokens: [],
  discoveredTokens: ["1", "2", ],
  flags: [],
  inventory: [],
  triggeredEvents: []
};

// Your events
const events: CardID[] = ["100"];

// Export the full game data
const gameData: GameData = {
  tokens,
  maps,
  cards,
  events,
  initialGameState
};

export default gameData;