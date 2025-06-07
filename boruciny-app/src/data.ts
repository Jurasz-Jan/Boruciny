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
  "9": { id: "9", cardId: "9", mapId: "10" },
  "18": { id: "18", cardId: "18", mapId: "2" },
  "16": { id: "16", cardId: "16", mapId: "5" },
  "17": { id: "17", cardId: "17", mapId: "6" },
  "22": { id: "22", cardId: "22", mapId: "6" },
  "23": { id: "23", cardId: "23", mapId: "3" },
  "24": { id: "24", cardId: "24", mapId: "3" },
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
    tokens: ["4", "5", "6",  "18"]
  },
  "3": {
    id: "3",
    name: "Ścieżka do Borucin",
    tokens: ["16", "23", "24"]
  },
  "4": {
    id: "4",
    name: "Miejsce gdzie powiesili proboszcza",
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
    tokens: ["1"]
  },
  "9": {
    id: "9",
    name: "Ratusz",
    tokens: ["1"]
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
    question: "Brama jest zamknięta, za bramą kręci się jakaś osoba.",
    choices: [
      { id: "1A", text: "Spróbuj otworzyć bramę", next: "1A_try_open" },
      { id: "1B_choice", text: "Przeskocz nad bramą", next: "1B" }
    ],
    removeToken: false,
  } as ChoiceCard, 
  // Type assertion for clarity,
  "1A": {
  id: "1A",
  type: "text",
  condition: "hasFlag:bramaOtwarta",
  content: "Brama otwarta",
  effect: "addMap:2:0:0; removeToken:1; addMap:3:1:0; addMap:4:1:1; addMap:5:1:2; addMap:6:2:1; addMap:7:2:2; addMap:8:0:1; addMap:9:0:2;", // <-- POPRAWIONY CIĄG EFEKTÓW
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
    next: "1A" // Jeśli warunek spełniony, przejdź do karty sukcesu
  } as TextCard,

  "1B": {
    id: "1B",
    type: "text",
    content: "Wyjebałeś się na ryj debilu.",
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
    question: "Władek Leśniczy",
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
    content: "LESINCZY A.",
    removeToken: false,
  } as TextCard,

  "2B": {
    id: "2B",
    type: "text",
    content: "LESNICZY B",
    removeToken: false,
  } as TextCard,

  // W Domu Ciotki
  "4": {
    id: "4",
    type: "choice",
    question: "Rudy kot siedzi zupełnie nieruchomo, jakby to nie on był gościem w ogrodzie, lecz ty. Na jego szyi metalowy medalion lekko migocze w słońcu. Kot mierzy Cię krytycznym wzrokiem i wyraźnie Cię ocenia.",
    choices: [
      { id: "4A_choice", text: "Kucasz i sięgasz ręką, by go zawołać.", next: "4A" },
      { id: "4B_choice", text: "Siadasz w cieniu nie odzywasz się.", next: "4B" }
    ],
    removeToken: true
  } as ChoiceCard,

  "4A": {
    id: "4A",
    type: "text",
    content: "Gdy się zbliżasz, kot prycha z oburzeniem i znika w krzakach. Zostawia po sobie tylko chmurkę sierści i uczucie zniesmaczenia. Najwyraźniej naruszyłeś królewską etykietę.",
    removeToken: true
  } as TextCard,

  "4B": {
    id: "4B",
    type: "text",
    content: "Kot siada obok i łaskawie pozwala Ci obejrzeć medalion. Wygrawerowano na nim jedno słowo “Gustaw”. W jego sierści znajdujesz zabłąkany spinacz i oswobadzasz kota z śmiecia. Kot Gustaw patrzy się na Ciebie z wyższością i powoli odchodzi.",
    effect: "setFlag:metGustaw; addItem:Zielony Spinacz",
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
    content: "Sięgasz po pierwszą z wierzchu. Lokalna gazeta sprzed 30-tu lat. Na 1-szej stronie artykuł: 'Lokalna tragedia' wspomina samobójstwo jednego z mieszkańców.",
    removeToken: true
  } as TextCard,

  "5B": {
    id: "5B",
    type: "text",
    content: "Zdjęcie rodzinne z lat 60. Przed domem stoją Ciotka, twoi rodzice oraz wątła sylwetka ówczesnego leśniczego.",
    removeToken: true
  } as TextCard,

  "6": {
    id: "6",
    type: "choice",
    question: "Jeden z regałów w salonie się trzęsie, jakby coś za nim było. Przesuwasz go. W ścianie odkrywasz zamknięty na klucz schowek.",
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
    content: "Drzwiczki schowka ani drgną. Gdybyś tylko  znalazł jakiś klucz…",
    
    removeToken: false
  } as TextCard,

  "7": {
    id: "7",
    type: "text",
    content: "Za drzwiami skrytki znajduje się pudełko. Jest ono wyposażone w sześcioliterowy zamek. Otworzy się tylko, jak wpiszesz poprawne hasło. Pomyśl…",
    condition: "inputCode:PAMIĘĆ",
    onConditionFail:"",
    next: "8",
    removeToken: false
  } as TextCard,

  "8": {
    id: "8",
    type: "text",
    content: "Słychać kliknięcie. Drzwiczki sejfu ustępują. W środku znajdujesz plik pożółkłych notatek. To notatki ciotki o Borucinach... Są pełne dziwnych obserwacji o ludziach, którzy 'wracają' i miejscach, które 'pamiętają'. Znajdujesz też… klucz do auta.",
    effect: "setFlag:zagadkaRozwiazana; addItem:notatkiCiotki; addItem:kluczykDoAuta; revealToken:102;",
    removeToken: true
  } as TextCard,

  "9": {
    id: "9",
    type: "choice",
    question: "W garażu lub na podjeździe stoi stary samochód ciotki. Pokryty jest warstwą kurzu, ale wygląda na to, że mógłby jeszcze jeździć.",
    choices: [
      { id: "9A_choice", text: "Spróbuj uruchomić auto", next: "9A" },
      { id: "9B_choice", text: "Odejdź", next: "" } // Change null to empty string or a designated 'end' card ID
    ],
    removeToken: false
  } as ChoiceCard,

  "9A": {
    id: "9A",
    type: "text",
    content: "Nie zapomniałeś kluczyków?",
    condition: "!hasItem:kluczykDoAuta",
    removeToken: false
  } as TextCard,

  "9A2": {
    id: "9A2",
    type: "text",
    content: "Odpalasz auto i ruszasz. Po chwili wieś Boruciny zostaje za Tobą. Ale wiesz, że kiedyś znowu będziesz musiał tu przyjechać. I tak już będzie bez końca. Gratulacje, wygrałeś grę… ale czy na pewno?",
    condition: "hasItem:kluczykDoAuta",
    effect: "setFlag:graWygrana",
    removeToken: true
  } as TextCard,

  "18": {
    id: "18",
    type: "choice",
    question: "W kuchni unosi się zapach rumianku. Na stole zostawiono filiżankę z herbatą. Wszystko wygląda jakby ktoś dopiero co wyszedł.",
    choices: [
      { id: "18A_choice", text: "Sprawdź herbatę", next: "18A" },
      { id: "18B_choice", text: "Sprawdź słoiki", next: "18B" }
    ],
    removeToken: true
  } as ChoiceCard,

  "18A": {
    id: "18A",
    type: "text",
    content: "W wystygłej herbacie odbija się Twoje odbicie. Masz silne uczucie deja vu.",
    removeToken: true
  } as TextCard,

  "18B": {
    id: "18B",
    type: "text",
    content: "W słoiku jest suchy proszek, etykietowany “Na pamięć”.",
    effect: "addItem:ziołaNaPamięć",
    removeToken: true
  } as TextCard,

  // Boruciny
  "16": {
    id: "16",
    type: "choice",
    question: "Za ladą siedzi pani Bogusia. Obok stoi Leśniczy Władek i chyba brakuje mu na papierosy.",
    choices: [
      { id: "16A_choice", text: "Zapytaj Bogusię o ciotkę", next: "16A" },
      { id: "16B_choice", text: "Zaoferuj kupienie Władkowi szlugów", next: "16B_choice" }
    ],
    removeToken: true
  } as ChoiceCard,

  "16A": {
    id: "16A",
    type: "text",
    content: "Pani Bogusia uśmiecha się lekko. „Zawsze mnie zagadywała. Czy rano, czy wieczorem — zawsze to jej 'dzień dobry, pani Bogusiu' i potem sto tematów. A niby tylko po gazetę przyszła, z tym swoim koszykiem wypchanym ziołami. Dobra kobieta była. Jak się uśmiechnęła, to człowiekowi od razu lżej.”",
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
    content: "Władek Ci ufa, kierowniku, i przyjmuje twoją ofertę z radością ściskając ci dłoń na gest wdzięczności. Po uścisku w twojej dłoni zostaje spinacz.",
    condition: "hasFlag:zaufanieWladka",
    effect: "addItem:Niebieski Spinacz",
    removeToken: true
  } as TextCard,

  "16C": {
    id: "16C",
    type: "text",
    content: "Władek jest 'wdzięczny za ofertę, kierowniku', ale woli kupić szlugi na własną kieszeń.",
    condition: "!hasFlag:zaufanieWladka",
    removeToken: true
  } as TextCard,

  "17": {
    id: "17",
    type: "choice",
    question: "Mały bar pachnący pierogami i dymem. Alicja zmywa szklanki, a Eryk drzemiąc przysłuchuje się radiu grającemu stare przeboje z Programu Trzeciego Polskiego Radia.",
    choices: [
      { id: "17A_choice", text: "Zamów coś i zagadaj", next: "17A" },
      { id: "17B_choice", text: "Zapytaj o mieszkańców", next: "17B" }
    ],
    removeToken: true
  } as ChoiceCard,

  "17A": {
    id: "17A",
    type: "text",
    content: "Alicja przysiada się na chwilę. „Twoja ciotka… dobra kobieta była. Czasem dziwna, ale kto tu nie jest? Przychodziła, zamawiała rumianek i wyciągała ten swój notes. Mówiła, że musi zapisać, zanim zapomni. Że coś się zaciera. Nie mówiła co, ale... miała taki wzrok, jakby to naprawdę ją przerażało.”",
    removeToken: true
  } as TextCard,

  "17B": {
    id: "17B",
    type: "text",
    content: "Eryk zbudzony przeciąga się i poprawia czapkę. „Mała wioska, każdy każdego zna. Albo znał. Bo to różnie teraz... Twarze znajome, ale czasem czuję, że coś mi umyka. Że ktoś tu jest, a nie powinno go być. Albo odwrotnie. Ale nie mów tego Alicji, bo powie, że znowu spałem za długo i bredzę.”",
    removeToken: true
  } as TextCard,

  "22": {
    id: "22",
    type: "choice",
    question: "Alicja siedzi za ladą, w dłoni trzyma kubek z parującą herbatą. Półki za nią uginają się od słoików z suszonymi ziołami, butelek z domowymi nalewkami i lokalnych dżemów z pokrzywą. Na ladzie stoi ceramiczny kogut.",
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
    content: "Leśny Dzban to lokalny trunek, butelkowany przez Alicję i Eryka. Pachnie ziołami i czymś... nieznanym. Plotki mówią, że ma dziwne działanie – jednych 'uspokaja', innych 'ożywia'. Eryk uśmiecha się pod nosem, gdy pytasz o Leśny Dzban. 'To nie jest coś, co po prostu stoi na półce. To... specjalny towar. Potrzebujemy... nietypowej zapłaty. Wystarczą nam trzy spinacze. Nie pytaj, po co nam spinacze. Biznes to biznes, kierowniku.'",
    next: "22A2", // Automatically transition to the next card to offer purchase
    removeToken: false // Keep token active until purchase is made
  } as TextCard,

  "22A2": {
    id: "22A2",
    type: "choice", // This is where the choice to buy happens
    question: "Czy chcesz kupić Leśny Dzban za trzy spinacze?",
    choices: [
        { id: "buy_dzban", text: "Kup Leśny Dzban", next: "DZBAN_PURCHASE_CONFIRM", effect: " addItem:LeśnyDzban", condition: "hasItem:Zielony Spinacz && hasItem:Niebieski Spinacz && hasItem:Czerwony Spinacz" },
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
    content: "Alicja wzdycha i zerka przez okno. „Władek? Był tu rano. Wziął paczkę ziół dla psa – ten jego stary kundel podobno znowu coś połknął. Władek jest taki trochę… inny. On tak chodzi po wsi, niby że patroluje, ale bardziej wygląda, jakby czegoś szukał. Nic od niego nie dowiesz się więcej w tym zakresie, przynajmniej mi się nie udało”",
    removeToken: true
  } as TextCard,

  "23": {
    id: "23",
    type: "choice",
    question: "Przy ścieżce, pod rozłożystą brzozą, siedzi bardzo stary kundel. Ma pysk naznaczony szarymi plamami czasu. Patrzy na ciebie tymi mądrymi, starymi oczami, zupełnie nieruchomo, jakby znał cię od zawsze i czekał na jakiś znajomy znak.",
    choices: [
      { id: "23A_choice", text: "Spróbuj podejść do psa", next: "23A" },
      { id: "23B_choice", text: "Zawołaj go", next: "23B" }
    ],
    removeToken: true
  } as ChoiceCard,

  "23A": {
    id: "23A",
    type: "text",
    content: "Podchodzisz powoli, wyciągasz dłoń. Pies wącha ją długo i poznaje, że przyjaciel Władka jest i jego przyjacielem. Pies wstaje, znika na moment w zaroślach i wraca z czymś w pysku.",
    effect: "addItem:Czerwony Spinacz",
    condition: "hasFlag:zaufanieWladka",
    removeToken: true
  } as TextCard,

  "23B": {
    id: "23B",
    type: "text",
    content: "Pies ewidentnie ma więcej rozsądku od Ciebie w tej sytuacji. Po chwili wstaje, wchodzi w las i znika, jakby go wcale tu nie było. Może trzeba było podejść inaczej.",
    condition: "!hasFlag:zaufanieWladka",
    removeToken: true
  } as TextCard,

  // IMPORTANT: You have two versions of Card "24" with different content and choices.
  // This implies conditional display. I'll use your "_v2" naming for the second version.
   
  

  "24": {
    id: "24",
    type: "choice",
    question: "Proboszcz zaprasza cię do środka. Wnętrze jest proste — trochę książek, krzyż nad drzwiami, zapach parzonej herbaty. Siadacie przy stole. Cicho za oknem, tylko słychać, jak wiatr szarpie drzwiami stodoły.",
    choices: [
      { id: "24_choice_A", text: "Siadasz, pijesz herbatę i słuchasz", next: "24A" },
      { id: "24_choice_B", text: "Zagadujesz go o Boruciny", next: "24B" }
    ],
    removeToken: false 
  } as ChoiceCard,

  "24A": {
    id: "24A",
    type: "choice", 
    question: "„Twoja ciotka… często tu wpadała. Pogadać, zostawić jakiś słoik z ziołami. Miała swoje teorie, ale kto ich nie ma? Mówiła, że pamięć to najważniejsze, że jak ludzie zapomną, to wszystko zniknie. Że ta wieś… coś pamięta. Że to w ludziach siedzi, i w domu, i w ogrodzie. Dziwnie to brzmiało, ale... była w tym jakaś prawda.”",
    choices: [
      { id: "24A_choice_A", text: "Zapytaj, co konkretnie miała na myśli", next: "25A" },
      { id: "24A_choice_B", text: "Powiedz, że też coś czujesz", next: "25B" }
    ],
    removeToken: false 
  } as ChoiceCard,

  "25A": {
    id: "25A",
    type: "text",
    content: "„Nie wiem. Może że ludzie tu żyją bardziej wspomnieniami niż tym, co jest. Że jak coś się raz wydarzyło, to już zostaje. A niektórzy... jakby nie potrafili już ruszyć dalej.”",
    removeToken: true 
  } as TextCard,

  "25B": {
    id: "25B",
    type: "text",
    content: "„To nie jesteś pierwszy. Tu wiele osób ma takie wrażenie. Że coś tu nie gra. Ale nie w taki zły sposób. Tylko jakby… coś się zawiesiło.”",
    removeToken: true 
  } as TextCard,

  "24B": {
    id: "24B",
    type: "choice", 
    question: "Proboszcz sięga po czajnik i dolewa ci herbaty. „Boruciny… Czasami myślę, że to nie jest zwykła wieś. Wszystko się tu kręci wokół starych spraw. Ludzie pamiętają więcej, niż powinni. A czasem nie pamiętają wcale. Może to kwestia wieku? Kto wie”",
    choices: [
      { id: "24B_choice_A", text: "Pytasz, czy on sam coś takiego przeżył", next: "26A" },
      { id: "24B_choice_B", text: "Pytasz, czy da się temu jakoś zaradzić", next: "26B" }
    ],
    removeToken: false 
  } as ChoiceCard,

  "26A": {
    id: "26A",
    type: "text",
    content: "„Nie powiem, że nie. Czasem budzę się i nie wiem, czy coś się wydarzyło, czy nie. A twarze… niektóre jakby znajome, choć nie powinny być.”",
    
    removeToken: true 
  } as TextCard,

  "26B": {
    id: "26B",
    type: "text",
    content: "„Nie wiem. Nie jestem od tego. Ale może to nie o rozwiązanie chodzi. Może wystarczy tylko... pamiętać. Albo zrozumieć, co się tak naprawdę pamięta.”",
    
    removeToken: true 
  } as TextCard,
  "27": {
    id: "27",
    type: "choice",
    question: "Na ławeczce na głównym placyku siedzą miejscowi pijacy. Ich wzrok jest mętny, ale wydają się obserwować wszystko wokół. Czujesz, że mogą wiedzieć więcej, niż wyglądają.",
    choices: [
      { id: "27A_choice", text: "Postaw im 'Leśny Dzban' i spróbuj wyciągnąć informacje.", next: "27A", condition: "hasItem:LeśnyDzban" },
      { id: "27B_choice", text: "Obejdź ławeczkę szerokim łukiem", next: "" }
    ],
    removeToken: true
  } as ChoiceCard,

  "27A": {
    id: "27A",
    type: "text",
    content: "Po kilku 'dzbanach' rozmowa staje się płynniejsza, choć chaotyczna. Mówią o 'zapomnianych drogach', 'domach, które wracają' i o tym, że 'proboszcz za dużo wiedział'. Jeden z nich, mrugając okiem, mamrocze coś o kluczach. 'Czasem najlepsze klucze znajdują się tam, gdzie nikt ich nie szuka... na ziemi'.",
    effect: "setFlag:knowWhereKey",
    removeToken: true
  } as TextCard,

  "87": {
    id: "87",
    type: "choice",
    question: "Kapliczka Świętego Rocha, patrona pamięci. Skromna ale zadbana, pod nią stoją świeże kwiaty. Na płycie w kapliczce jest coś napisane.",
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
    content: "Cichy szept modlitwy unosi się w powietrze, a ty czujesz chwilową ulgę.",
    removeToken: false
  } as TextCard,

  "87B": {
    id: "87B",
    type: "text",
    content: "Kapliczka św. Rocha, patrona pamięci. ",
    condition: "hasFlag:knowWhereKey",
    onConditionFail: "87B_read",
    next: "87B_key",
    removeToken: false
  } as TextCard,

  "87B_key": {
    id: "87B_key",
    type: "text",
    content: "Między świeżymi kwiatami zauważasz połyskujący stary, mosiężny klucz. Zabierasz klucz spod kapliczki.",
    effect: "addItem:klucz",
    removeToken: true
  } as TextCard,

  "87B_read": {
    id: "87B_read",
    type: "text",
    content: "Z bliska odczytujesz ledwie widoczne słowa wyryte w kamieniu: „Pamięć trwa, gdy serce czuwa.”",
    removeToken: false
  } as TextCard,
  // Poranek (eventy)
  "100": {
    id: "100",
    type: "text",
    condition: "hasFlag:playerIsReady",
    content: "Zapadła noc.",
    effect: "revealToken:101; revealToken:27; removeToken:24;",
    next:"105",
    removeToken: true
  } as TextCard,

  "105": {
    id: "100",
    type: "text",
    content: "W nocy słyszysz nieopodal jakiś dziwny dźwięk. Rano powinieneś zbadać co to.",
    removeToken: true
  } as TextCard,

  "101": {
    id: "101",
    type: "text",
    content: "Odkrywasz wiszące ciało. Ręce zszyte ma razem i ułożone w znak modlitwy. To Proboszcz.",
    effect: "setFlag:ProboszczMartwy",
    removeToken: true
  } as TextCard,

  "102": {
    id: "102",
    type: "text",
    content: "Wreszcie nadchodzi koniec Borucin. Wchodzisz na niewielki, okrągły pieniek. Wkładasz pętlę na szyję, zaciskasz, kopiesz kawałek drewna. Gratulacje, właśnie wygrałeś grę…",
    condition: "hasItem:notatkiCiotki",
    effect: "setFlag:graWygranaSuicide",
    removeToken: true
  } as TextCard,
};

// Your initial game state
const initialGameState: GameState = {
  activeMaps: [{ id: "1", x: 0, y: 0 }],
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