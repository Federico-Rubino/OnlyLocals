const mongoose = require('mongoose');

const PositionSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitudine, latitudine]
      required: true
    }
  },
  indirizzo: String
}, { _id: false });

const DaySchema = new mongoose.Schema({
  mattina: { type: PositionSchema, default: null },
  pomeriggio: { type: PositionSchema, default: null },
  sera: { type: PositionSchema, default: null }
}, { _id: false });

const EventSchema = new mongoose.Schema({
  name: String,
  description: String,
  date: Date
}, { _id: false });

const PromotionSchema = new mongoose.Schema({
  description: String,
  value: String,
  startDate: Date,
  endDate: Date
}, { _id: false });

const VantaggioSchema = new mongoose.Schema({
  descrizione: String,
  valore: Number,
  sogliaPunti: Number
}, { _id: false });

const FidelityCardSchema = new mongoose.Schema({
  numeroUtenti: Number,
  ultimaModifica: Date,
  modificabile: Boolean,
  tassoConversione : Number,
  vantaggi: [VantaggioSchema]
}, { _id: false });

const StatisticheSchema = new mongoose.Schema({
  numSalvataggi: Number,
  mappaAccessi: [{
    data: Date,
    valore: Number
  }],
  storicoFeedback: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback'
  }],
  votoMedio: Number,
  totaleFeedback: Number,
  ultimoAggiornamento: Date
}, { _id: false });

const shopSchema = new mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String, required: true},

  category: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Devi selezionare almeno una categoria.'
    },
    enum: {
      values: [
        'Ortofrutta', 
        'Macelleria & Salumi', 
        'Latteria & Formaggi', 
        'Pescheria', 
        'Gastronomia & Drink', 
        'Abbigliamento', 
        'Artigianato & Design',
        'Libri & Media',
        'Eventi & Pop-up',
        'Musei & Mostre',
        'Benessere & Fitness',
        'Ristorazione',
        'Tecnologia & Elettronica',
        'Casa & Giardino',
        'Giocattoli & Bambini',
        'Animali & Accessori',
        'Servizi & Professionisti'
      ],
      message: '{VALUE} non è una categoria valida'
    }
  },

  itinerario: {
    lunedi: DaySchema,
    martedi: DaySchema,
    mercoledi: DaySchema,
    giovedi: DaySchema,
    venerdi: DaySchema,
    sabato: DaySchema,
    domenica: DaySchema
  },

  allLocations: {
    type: [{
      location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true }
      }
    }],
    default: []
  },

  events: [EventSchema],
  promotions: [PromotionSchema],
  fidelityCardManager: FidelityCardSchema,
  statistiche: StatisticheSchema

});

shopSchema.pre('save', async function() {
    const shop = this;
    const newLocations = [];
  
    const giorni = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'];
    const fasce = ['mattina', 'pomeriggio', 'sera'];
  
    giorni.forEach(g => {
      fasce.forEach(f => {
        const pos = shop.itinerario[g] && shop.itinerario[g][f];
        if (pos && pos.location && pos.location.coordinates) {
          newLocations.push({ location: pos.location });
        }
      });
    });
  
    shop.allLocations = newLocations;
  });

const giorni = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'];
const fasce = ['mattina', 'pomeriggio', 'sera'];

giorni.forEach(giorno => {
  fasce.forEach(fascia => {
    const indexPath = `itinerario.${giorno}.${fascia}.location`;
    
    shopSchema.index({ [indexPath]: '2dsphere' }, { sparse: true });
  });
});

shopSchema.index({ "allLocations.location": "2dsphere" });

module.exports = mongoose.model('Shop', shopSchema, 'shops');