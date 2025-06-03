import { GameData, GameState, ActiveMap, Token, TextCard, ChoiceCard, Choice, Map, CardID } from './types';

const tokens = {
  "1": { id: "1", cardId: "1", mapId: "1" },
  "2": { id: "2", cardId: "2", mapId: "1" },
  "3": { id: "3", cardId: "3", mapId: "1" },
  "4": { id: "4", cardId: "4", mapId: "2" },
  "5": { id: "5", cardId: "5", mapId: "2" },
  "6": { id: "6", cardId: "6", mapId: "2" },
  "18": { id: "18", cardId: "18", mapId: "2" },
  "16": { id: "16", cardId: "16", mapId: "3" },
  "17": { id: "17", cardId: "17", mapId: "3" },
  "22": { id: "22", cardId: "22", mapId: "3" },
  "23": { id: "23", cardId: "23", mapId: "3" },
  "24": { id: "24", cardId: "24", mapId: "3" },
  "87": { id: "87", cardId: "87", mapId: "3" }
};

const maps = {
  "1": {
    id: "1",
    name: "Brama przed domem Ciotki",
    tokens: ["1", "2"]
  },
  "2": {
    id: "2",
    name: "W Domu Ciotki",
    tokens: ["4", "5", "6", "18"]
  },
  "3": {
    id: "3",
    name: "Boruciny",
    tokens: ["16", "17", "22", "23", "24", "87"]
  }
};

const cards: Record<string, TextCard | ChoiceCard> = {
  // Brama przed domem Ciotki
  "1": {
    id: "1",
    type: "choice",
    question: "Brama jest zamknięta, za bramą kręci się jakaś osoba",
    choices: [
      { id: "1A", text: "Spróbuj otworzyć bramę", next: "1A" },
      { id: "1B", text: "Przeskocz nad bramą", next: "1B" },
    ],
    removeToken: true,
  },
  "1A": {
    id: "1A",
    type: "text",
    content: "1a.",
    effect: "addMap:2:1:0",
    removeToken: true,
  },
  "1B": {
    id: "1B",
    type: "text",
    content: "1b.",
    effect: "addMap:3:1:1",
  },
  "2": {
    id: "2",
    type: "choice",
    question: "Widzisz twarz starszego mężczyzny w flanelowej koszuli. To miejscowy leśniczy, Władek. Patrzy ci się prosto w oczy — niegroźnie, ale z dystansem. „Zgubiłeś się, kierowniku?” — mówi głosem, który brzmi bardziej ciekawie niż podejrzliwie.",
    choices: [
      { id: "2A", text: "Poproś o otworzenie bramy", next: "3" },
      { id: "2B", text: "Zagadaj do leśniczego", next: "3" }
    ]
  },
  "3": {
    id: "3",
    type: "text",
    content: "Brama się otwiera i kontynuujesz do wnętrza Domu Ciotki."
  },

  // Dom Ciotki
  "4": {
    id: "4",
    type: "choice",
    question: "Rudy kot siedzi zupełnie nieruchomo, jakby to nie on był gościem w ogrodzie, lecz ty. Na jego szyi metalowy medalion lekko migocze w słońcu. Kot mierzy Cię krytycznym wzrokiem i wyraźnie Cię ocenia",
    choices: [
      { id: "4A", text: "Kucasz i sięgasz ręką, by go zawołać", next: "4A" },
      { id: "4B", text: "Siadasz w cieniu i nie odzywasz się", next: "4B" }
    ]
  },
  "4A": {
    id: "4A",
    type: "text",
    content: "Gdy się zbliżasz, kot prycha z oburzeniem i znika w krzakach. Zostawia po sobie tylko chmurkę sierści i uczucie zniesmaczenia. Najwyraźniej naruszyłeś królewską etykietę.",
    effect: "setFlag:gustawObrazony"
  },
  "4B": {
    id: "4B",
    type: "text",
    content: "Kot siada obok i łaskawie pozwala Ci obejrzeć medalion. Wygrawerowano na nim jedno słowo “Gustaw”. Kot Gustaw patrzy się na Ciebie z wyższością i powoli odchodzi.",
    effect: "addItem:medalionGustaw"
  },
  "5": {
    id: "5",
    type: "choice",
    question: "Blat komody zapełniony jest różnorakimi przedmiotami. Twoją uwagę przyciągają jednak sterta starych gazet i zdjęcia rodzinne.",
    choices: [
      { id: "5A", text: "Przejrzyj gazety", next: "5A" },
      { id: "5B", text: "Spójrz na zdjęcia", next: "5B" }
    ]
  },
  "5A": {
    id: "5A",
    type: "text",
    content: "Sięgasz po pierwszą z wierzchu. Lokalna gazeta sprzed 30-tu lat. Na 1-szej stronie artykuł: \"Lokalna tragedia\" wspomina samobójstwo jednego z mieszkańców."
  },
  "5B": {
    id: "5B",
    type: "text",
    content: "Zdjęcie rodzinne z lat 60. Przed domem stoją Ciotka, twoi rodzice oraz wątła sylwetka ówczesnego leśniczego."
  },
  "6": {
    id: "6",
    type: "choice",
    question: "Jeden z regałów w salonie się trzęsie, jakby coś za nim było. Przesuwasz go. W ścianie odkrywasz zamknięty na klucz schowek.",
    choices: [
      { id: "6A", text: "Spróbuj otworzyć schowek", next: "6A" },
      { id: "6B", text: "Odejdź", next: "6B" }
    ]
  },
  "6A": {
    id: "6A",
    type: "text",
    content: "Drzwiczki schowka ani drgną. Gdybyś tylko wcześniej znalazł jakiś klucz…"
  },
  "6B": {
    id: "6B",
    type: "text",
    content: "Decydujesz się nie otwierać schowka."
  },
  "18": {
    id: "18",
    type: "choice",
    question: "W kuchni unosi się zapach rumianku. Na stole zostawiono filiżankę z herbatą. Wszystko wygląda jakby ktoś dopiero co wyszedł.",
    choices: [
      { id: "18A", text: "Sprawdź herbatę", next: "18A" },
      { id: "18B", text: "Sprawdź słoiki", next: "18B" }
    ]
  },
  "18A": {
    id: "18A",
    type: "text",
    content: "W wystygłej herbacie odbija się Twoje odbicie. Masz silne uczucie deja vu."
  },
  "18B": {
    id: "18B",
    type: "text",
    content: "W słoiku jest suchy proszek, etykietowany “Na pamięć”."
  },

  // Boruciny
  "16": {
    id: "16",
    type: "choice",
    question: "Za ladą siedzi pani Bogusia. Obok stoi Leśniczy Władek i chyba brakuje mu na papierosy.",
    choices: [
      { id: "16A", text: "Zapytaj Bogusię o ciotkę", next: "16A" },
      { id: "16B", text: "Zaoferuj kupienie Władkowi szlugów", next: "16B" }
    ]
  },
  "16A": {
    id: "16A",
    type: "text",
    content: "Pani Bogusia uśmiecha się lekko. „Zawsze mnie zagadywała. Czy rano, czy wieczorem — zawsze to jej ‘dzień dobry, pani Bogusiu’ i potem sto tematów. A niby tylko po gazetę przyszła, z tym swoim koszykiem wypchanym ziołami. Dobra kobieta była. Jak się uśmiechnęła, to człowiekowi od razu lżej.”"
  },
  "16B": {
    id: "16B",
    type: "text",
    content: "Władek jest \"wdzięczny za ofertę, kierowniku”, ale woli kupić szlugi na własną kieszeń."
  },
  "17": {
    id: "17",
    type: "choice",
    question: "Mały bar pachnący pierogami i dymem. Alicja zmywa szklanki, a Eryk drzemiąc przysłuchuje się radiu grającemu stare przeboje. Wnętrze wygląda jakby nic się tu nie zmieniło od dekady.",
    choices: [
      { id: "17A", text: "Zamów coś i zagadaj", next: "17A" },
      { id: "17B", text: "Zapytaj o mieszkańców", next: "17B" }
    ]
  },
  "17A": {
    id: "17A",
    type: "text",
    content: "Alicja przysiada się na chwilę, wyciera ręce w fartuch. „Twoja ciotka… dobra kobieta była. Czasem dziwna, ale kto tu nie jest? Ciągle coś notowała. Przychodziła, siadała przy oknie, zamawiała rumianek i wyciągała ten swój notes. Mówiła, że musi zapisać, zanim zapomni. Że coś się zaciera. Nie mówiła co, ale... miała taki wzrok, jakby to naprawdę ją przerażało.”"
  },
  "17B": {
    id: "17B",
    type: "text",
    content: "Eryk zbudzony przeciąga się i poprawia czapkę. „Mała wioska, każdy każdego zna. Albo znał. Bo to różnie teraz... Twarze znajome, ale czasem czuję, że coś mi umyka. Że ktoś tu jest, a nie powinno go być. Albo odwrotnie. Ale nie mów tego Alicji, bo powie, że znowu spałem za długo i bredzę.”"
  },
  "22": {
    id: "22",
    type: "choice",
    question: "Alicja siedzi za ladą, w dłoni trzyma kubek z parującą herbatą. Półki za nią uginają się od słoików z suszonymi ziołami, butelek z domowymi nalewkami i lokalnych dżemów z pokrzywą. Na ladzie stoi ceramiczny kogut.",
    choices: [
      { id: "22A", text: "Kup herbatę z melisą", next: "22A" },
      { id: "22B", text: "Zapytaj o Leśniczego", next: "22B" }
    ]
  },
  "22A": {
    id: "22A",
    type: "text",
    content: "Alicja z uśmiechem sięga po słoika i sypie susz do papierowej torebki, po czym zalewa herbatę wrzątkiem. „To z naszego ogródka, z tyłu domu. Melisa, trochę lipy i szczypta tego... no, na zdrowie”"
  },
  "22B": {
    id: "22B",
    type: "text",
    content: "Alicja wzdycha i zerka przez okno. „Władek? Był tu rano. Wziął paczkę ziół dla psa – ten jego stary kundel podobno znowu coś połknął. Władek jest taki trochę… inny. On tak chodzi po wsi, niby że patroluje, ale bardziej wygląda, jakby czegoś szukał. Nic od niego nie dowiesz się więcej w tym zakresie, przynajmniej mi się nie udało”"
  },
  "23": {
    id: "23",
    type: "choice",
    question: "Przy ścieżce, pod brzozą, siedzi stary kundel. Ma szare plamy na pysku i jedno ucho postawione wyżej. Patrzy na ciebie uważnie, nieruchomo, jakby czekał na jakiś znak.",
    choices: [
      { id: "23A", text: "Podejdź i daj rękę do powąchania", next: "23A" },
      { id: "23B", text: "Zawołaj go", next: "23B" }
    ]
  },
  "23A": {
    id: "23A",
    type: "text",
    content: "Podchodzisz powoli, wyciągasz dłoń. Pies wącha ją długo, jakby rozpoznawał coś znajomego… albo próbował sobie przypomnieć. Nie odchodzi. Przeciwnie — wstaje, znika na moment w zaroślach i wraca z czymś w pysku. To stary, lekko pogięty spinacz. Kładzie go u twoich stóp i siada z powrotem."
  },
  "23B": {
    id: "23B",
    type: "text",
    content: "Zawołasz, klękasz, próbujesz zwrócić jego uwagę – ale pies tylko porusza uchem. Patrzy jeszcze chwilę i wstaje. Wchodzi w las i znika, bezszelestnie, jakby go wcale tu nie było. Może trzeba było podejść inaczej."
  },
  "24": {
    id: "24",
    type: "choice",
    question: "Proboszcz zaprasza cię do środka. Wnętrze jest proste — trochę książek, krzyż nad drzwiami, zapach parzonej herbaty. Siadacie przy stole. Cicho za oknem, tylko słychać, jak wiatr szarpie drzwiami stodoły.",
    choices: [
      { id: "24A", text: "Siadasz, pijesz herbatę i słuchasz", next: "24A" },
      { id: "24B", text: "Zagadujesz go o Boruciny", next: "24B" }
    ]
  },
  "24A": {
    id: "24A",
    type: "choice",
    question: "„Twoja ciotka… często tu wpadała. Pogadać, zostawić jakiś słoik z ziołami. Miała swoje teorie, ale kto ich nie ma? Mówiła, że pamięć to najważniejsze, że jak ludzie zapomną, to wszystko zniknie. Że ta wieś… coś pamięta. Że to w ludziach siedzi, i w domu, i w ogrodzie. Dziwnie to brzmiało, ale... była w tym jakaś prawda.”",
    choices: [
      { id: "24A_A", text: "Zapytaj, co konkretnie miała na myśli", next: "25A" },
      { id: "24A_B", text: "Powiedz, że też coś czujesz", next: "25B" }
    ]
  },
  "24B": {
    id: "24B",
    type: "choice",
    question: "Proboszcz sięga po czajnik i dolewa ci herbaty. „Boruciny… Czasami myślę, że to nie jest zwykła wieś. Wszystko się tu kręci wokół starych spraw. Ludzie pamiętają więcej, niż powinni. A czasem nie pamiętają wcale. Może to kwestia wieku? Kto wie”",
    choices: [
      { id: "24B_A", text: "Pytasz, czy on sam coś takiego przeżył", next: "26A" },
      { id: "24B_B", text: "Pytasz, czy da się temu jakoś zaradzić", next: "26B" }
    ]
  },
  "25A": {
    id: "25A",
    type: "text",
    content: "„Nie wiem. Może że ludzie tu żyją bardziej wspomnieniami niż tym, co jest. Że jak coś się raz wydarzyło, to już zostaje. A niektórzy... jakby nie potrafili już ruszyć dalej.”"
  },
  "25B": {
    id: "25B",
    type: "text",
    content: "„To nie jesteś pierwszy. Tu wiele osób ma takie wrażenie. Że coś tu nie gra. Ale nie w taki zły sposób. Tylko jakby… coś się zawiesiło.”"
  },
  "26A": {
    id: "26A",
    type: "text",
    content: "„Nie powiem, że nie. Czasem budzę się i nie wiem, czy coś się wydarzyło, czy nie. A twarze… niektóre jakby znajome, choć nie powinny być.”"
  },
  "26B": {
    id: "26B",
    type: "text",
    content: "„Nie wiem. Nie jestem od tego. Ale może to nie o rozwiązanie chodzi. Może wystarczy tylko... pamiętać. Albo zrozumieć, co się tak naprawdę pamięta.”"
  },
  "87": {
    id: "87",
    type: "choice",
    question: "Kapliczka Świętego Rocha, patrona pamięci. Skromna ale zadbana, pod nią stoją świeże kwiaty. Na płycie w kapliczce jest coś napisane.",
    choices: [
      { id: "87A", text: "Pomódl się", next: "87A" },
      { id: "87B", text: "Przyjrzyj się napisom", next: "87B" }
    ]
  },
  "87A": {
    id: "87A",
    type: "text",
    content: "Modlisz się. Czujesz się spokojniejszy."
  },
  "87B": {
    id: "87B",
    type: "text",
    content: "Z bliska odczytujesz ledwie widoczne słowa wyryte w kamieniu: „Pamięć trwa, gdy serce czuwa.” Między świeżymi kwiatami zauważasz połyskujący stary, mosiężny klucz. Zabierasz Klucz spod kapliczki."
  },
  "event1": {
  id: "event1",
  type: "text",
  content: "Cichy trzask gdzieś w oddali. Ktoś jakby uchylił drzwi w Domu Ciotki.",
  condition: "tokenRemoved:1 & tokenRemoved:2",
  effect: "addMap:2:1:0",
  removeToken: false
},
};

const initialGameState: GameState = {
  activeMaps: [{ id: "1", x: 0, y: 0 }],
  removedTokens: [],
  discoveredTokens: ["1"],
  flags: [],
  inventory: [],
  triggeredEvents: []
};

const events: CardID[] = ["event1"];

const gameData: GameData = {
  tokens,
  cards,
  maps,
  events,
  initialGameState
};

export default gameData;