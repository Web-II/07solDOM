'use strict';

class Uitgave {
  #id;
  #datum;
  #bedrag;
  #omschrijving;
  #categorie;
  constructor(id, datum, bedrag, omschrijving, categorie) {
    this.#id = id;
    this.#datum = datum;
    this.#bedrag = bedrag;
    this.#omschrijving = omschrijving;
    this.#categorie = categorie;
  }

  get id() {
    return this.#id;
  }
  get datum() {
    return this.#datum;
  }
  get bedrag() {
    return this.#bedrag;
  }
  get omschrijving() {
    return this.#omschrijving;
  }
  get categorie() {
    return this.#categorie;
  }
}

class UitgavenRepository {
  #uitgaven = [];
  constructor() {
    this.uitgavenOpvullen();
  }

  get uitgaven() {
    return this.#uitgaven;
  }

  voegUitgaveToe(uitgave) {
    this.#uitgaven.push(uitgave);
  }

  uitgavenOpvullen() {
    this.voegUitgaveToe(
      new Uitgave(1, new Date(2018, 2, 5), 25, 'Fnac Veldstraat', 'andere')
    );
    this.voegUitgaveToe(
      new Uitgave(2, new Date(2018, 2, 5), 560, 'Huur', 'woning')
    );
    this.voegUitgaveToe(
      new Uitgave(
        3,
        new Date(2018, 2, 6),
        15,
        'NMBS Gent-Sint-Pieters',
        'vervoer'
      )
    );
    this.voegUitgaveToe(
      new Uitgave(4, new Date(2018, 2, 7), 100, 'Delhaize Sterre', 'voeding')
    );
    this.voegUitgaveToe(
      new Uitgave(5, new Date(2018, 2, 7), 65, 'Texaco Tankstation', 'vervoer')
    );
    this.voegUitgaveToe(
      new Uitgave(6, new Date(2018, 2, 8), 15, 'Decascoop', 'andere')
    );
    this.voegUitgaveToe(
      new Uitgave(
        7,
        new Date(2018, 2, 9),
        20,
        'GB Sint-Denijs-Westrem',
        'voeding'
      )
    );
  }

  geefCategorieen() {
    return [
      ...new Set(this.uitgaven.map((uitgave) => uitgave.categorie).sort()),
    ];
  }

  totaalBedragUitgaven() {
    return this.#uitgaven.reduce(
      (totaal, uitgave) => totaal + uitgave.bedrag,
      0
    );
  }

  uitgavenPerCategorie(categorie) {
    return this.#uitgaven.reduce((totaal, uitgave) => {
      return uitgave.categorie === categorie
        ? (totaal += uitgave.bedrag)
        : totaal;
    }, 0);
  }
}

class BankComponent {
  #canvas;
  #ctx;
  #offset;
  #storage;
  #aantalBezoeken;
  #uitgavenRepository;
  constructor(window) {
    this.#canvas = window.document.getElementById('canvas');
    this.#ctx = this.#canvas.getContext('2d');
    this.#offset = 50;
    this.#storage = window.localStorage;
    this.#aantalBezoeken = 1;
    this.#uitgavenRepository = new UitgavenRepository();
  }

  get canvas() {
    return this.#canvas;
  }
  get ctx() {
    return this.#ctx;
  }
  get offset() {
    return this.#offset;
  }
  get storage() {
    return this.#storage;
  }
  get aantalBezoeken() {
    return this.#aantalBezoeken;
  }
  get uitgavenRepository() {
    return this.#uitgavenRepository;
  }

  toHtml() {
    this.resetCanvas();
    this.tekenen();
    this.tekst();
  }

  resetCanvas() {
    this.#canvas.width = this.#canvas.width;
  }

  tekenen() {
    // tekenen van de assen
    this.#ctx.lineWidth = 2;
    this.#ctx.strokeStyle = '#333';
    this.#ctx.font = 'italic 8pt sans-serif';

    // verticale as tekenen
    this.#ctx.moveTo(this.#offset, this.#offset);
    this.#ctx.lineTo(this.#offset, this.#canvas.height - this.#offset);
    this.#ctx.stroke();

    // horizontale as tekenen
    this.#ctx.moveTo(this.#offset, this.#canvas.height - this.#offset);
    this.#ctx.lineTo(
      this.#canvas.width - this.#offset,
      this.#canvas.height - this.#offset
    );
    this.#ctx.stroke();

    this.#ctx.fillStyle = 'black';
    // labels
    for (let i = 0; i <= 100; i += 10) {
      this.#ctx.fillText(
        i,
        this.#offset - 15,
        this.#canvas.height - this.#offset - i * 3
      );
    }

    //const categorieen = this.#uitgavenRepository.geefCategorieen();
    const totaleUitgaven = this.#uitgavenRepository.totaalBedragUitgaven();

    this.#uitgavenRepository
      .geefCategorieen()
      .forEach((categorie, index, array) => {
        const uitgavePerCategorie =
          this.#uitgavenRepository.uitgavenPerCategorie(categorie);
        const breedteKolom = Math.round(
          (this.#canvas.width - 2 * this.#offset - array.length * 20) /
            array.length
        );
        const percentage = Math.round(
          (uitgavePerCategorie * 100) / totaleUitgaven,
          0
        );
        this.#ctx.beginPath();
        this.#ctx.fillStyle = 'red';
        this.#ctx.fillRect(
          this.#offset + 10 + (breedteKolom + 20) * index,
          this.#canvas.height - this.#offset - 3 * percentage,
          breedteKolom,
          3 * percentage
        );
        this.#ctx.closePath();
        this.#ctx.beginPath();
        this.#ctx.fillStyle = 'black';
        this.#ctx.fillText(
          categorie,
          this.#offset + 10 + (breedteKolom + 20) * index,
          this.#canvas.height - this.#offset + 10
        );
        this.#ctx.closePath();
      });
  }

  tekst() {
    document.getElementById('aantalBezoeken').innerHTML = this.#aantalBezoeken;
    document.getElementById('data').innerHTML = '';
    this.#uitgavenRepository.uitgaven.forEach((uitgave) => {
      document.getElementById('data').insertAdjacentHTML(
        'beforeend',
        `<div class="aankoop">
        <img src="images/${uitgave.categorie}.png">
        <h4>${uitgave.omschrijving} - €${uitgave.bedrag}</h4>
        <p>${uitgave.datum.datumNotatie()}</p>
      </div>`
      );
    });
  }

  getAantalBezoekenFromStorage() {
    if (this.#storage.getItem('aantalBezoeken')) {
      this.#aantalBezoeken =
        parseInt(this.#storage.getItem('aantalBezoeken')) + 1;
      console.log(this.#aantalBezoeken);
    } else {
      this.#aantalBezoeken = 1;
    }
  }

  setAantalBezoekenInStorage() {
    try {
      this.#storage.setItem('aantalBezoeken', this.#aantalBezoeken);
    } catch (e) {
      if (e === QUOTA_EXCEEDED_ERR) alert('Quota exceeded!');
    }
  }
}

function init() {
  // Testcode Deel 1

  const uitgave1 = new Uitgave(
    1,
    new Date(2018, 2, 2),
    25,
    'Fnac Veldstraat',
    'andere'
  );
  const uitgave2 = new Uitgave(2, new Date(2018, 2, 2), 560, 'Huur', 'woning');
  console.log(uitgave1);
  console.log(uitgave2);

  // Testcode Deel 2
  const uitgavenRepository = new UitgavenRepository();
  console.log(uitgavenRepository.uitgaven);
  console.log(uitgavenRepository.geefCategorieen());
  console.log(uitgavenRepository.totaalBedragUitgaven());
  console.log(uitgavenRepository.uitgavenPerCategorie('andere'));
  // Testcode Deel 3

  const bankComponent = new BankComponent(this);
  bankComponent.getAantalBezoekenFromStorage();
  bankComponent.setAantalBezoekenInStorage();
  bankComponent.toHtml();
}

window.onload = init;

Date.prototype.datumNotatie = function () {
  const dagen = [
    'Zondag',
    'Maandag',
    'Dinsdag',
    'Woensdag',
    'Donderdag',
    'Vrijdag',
    'Zaterdag',
  ];
  return `${dagen[this.getDay()]} ${this.getDate()}/${
    this.getMonth() + 1
  }/${this.getFullYear()}`;
};
