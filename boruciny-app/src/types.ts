
export type TokenID = string;
export type CardID = string;  
export type MapID = string;
export type ItemID = string;
export type FlagID = string;


export interface Token {
  id: TokenID;
  cardId: CardID;
  mapId: MapID;
}


export type Card = TextCard | ChoiceCard;

interface CardBase {
  id: CardID;
  title?: string;
  removeToken?: boolean;
  condition?: string; 
  effect?: string;    
}


export interface TextCard extends CardBase {
  type: 'text';
  content: string;
  next?: CardID;
}


export interface ChoiceCard extends CardBase {
  type: 'choice';
  question: string;
  choices: Choice[];
}

export interface Choice {
  id: string;       // Usually "A", "B", "C"
  text: string;     // What player sees
  next: CardID;     // Which card follows
  effect?: string;  // e.g. "addItem:klucz"
}


export interface Map {
  id: MapID;
  name: string;
  tokens: TokenID[];
}


export interface ActiveMap {
  id: MapID;
  x: number;
  y: number;
}

export interface GameState {
  activeMaps: ActiveMap[];
  removedTokens: TokenID[];
  flags: FlagID[];
  inventory: ItemID[];
}

export interface GameData {
  tokens: Record<TokenID, Token>;
  cards: Record<CardID, Card>;
  maps: Record<MapID, Map>;
  initialGameState: GameState;
}
