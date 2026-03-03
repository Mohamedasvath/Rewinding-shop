import mongoose from "mongoose";

const loadTestSchema = new mongoose.Schema({
  wt: String,
  amps: String,
  rpm: String,
  kw: String,
}, { _id: false });

const qualityRecordSchema = new mongoose.Schema({

  companyName: String,
   address:String,
  srfNumber: String,
  date: Date,
  partyGPNumber: String,
  serialNumber:String,
  

  // INSPECTION & TESTING
  motorDetails: {
    make: String,
    hp: String,
    kw: String,
    amps: String,
    volts: String,
    phase: String,
    rpm: String,
    insulation: String,
    connection: String,
    frame: String,
    serialNumber: String,
  },

  coreDetails: {
    coreLength: String,
    coreDia: String,
    rotorLength: String,
    rotorPerimeter: String,
  },

  bearingDetails: {
    driveEnd: String,
    nonDriveEnd: String,
  },

  windingDetails: {
    swg: String,
    slot: String,
    winding: String,
    pitch: String,
    turns: String,
    totalCoils: String,
    totalMeter: String,
    materialEstimate: String,
  },

  mechanicalWorkDone: String,
  causeOfFailure: String,

  // ASSEMBLING & TESTING
  assemblingTesting: {
    hvTest: String,
    runningTime: String,
    temperature: String,
    noLoadVoltageL1: String,
    noLoadVoltageL2: String,
    noLoadVoltageL3: String,
    noLoadAmpsL1: String,
    noLoadAmpsL2: String,
    noLoadAmpsL3: String,
  },

  loadTesting: [loadTestSchema],

  efficiencyDetails: {
    kwh: String,
    pf: String,
    hz: String,
    efficiency: String,
  },

  connectionDetails: String,

  // IMPORTANT PART
  assembledProof: {
    imageUrl: String,
    driveLink: String,
  },

  authorizedSignature: String,

}, { timestamps: true });

export default mongoose.model("QualityRecord", qualityRecordSchema);