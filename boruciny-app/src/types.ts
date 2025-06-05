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
  onConditionFail?: CardID;
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
  id: string;
  text: string;
  next: CardID;
  effect?: string;
  condition?: string; 
  onConditionFail?: CardID;
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
  discoveredTokens: TokenID[];
  flags: FlagID[];
  inventory: ItemID[];
  triggeredEvents: CardID[];
}

export interface GameData {
  tokens: Record<TokenID, Token>;
  cards: Record<CardID, Card>;
  maps: Record<MapID, Map>;
  events: CardID[];
  initialGameState: GameState;
}