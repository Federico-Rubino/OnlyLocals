const mongoose = require('mongoose');

const PositionSchema = new mongoose.Schema({
  latitudine: Number,
  longitudine: Number,
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
  value: Number,
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
        return v && v.length > 0; // Impedisce di inviare un array vuoto []
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
        'Abbiliamento', 
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

  events: [EventSchema],
  promotion: [PromotionSchema],
  fidelityCardManager: FidelityCardSchema,
  statistiche: StatisticheSchema

});

module.exports = mongoose.model('Shop', shopSchema, 'shops');