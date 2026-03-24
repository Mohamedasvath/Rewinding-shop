import mongoose from "mongoose";

/* ───────── LOAD TEST ───────── */
const loadTestSchema = new mongoose.Schema({
  wt: String,
  amps: String,
  rpm: String,
  kw: String,
}, { _id: false });

/* ───────── MAIN SCHEMA ───────── */
const qualityRecordSchema = new mongoose.Schema({

  /* ───────── HEADER ───────── */
  companyName: String,
  address: String,
  srfNumber: String,
  date:        { type: Date, default: null },
  partyGPNumber: String,
  partyGPDate: { type: Date, default: null },
  dNoteNumber: String,
  dNoteDate:   { type: Date, default: null },
  billNo: String,
  billDate:    { type: Date, default: null },
  serialNumber: String,

  /* ───────── INSPECTION & TESTING ───────── */
  /* ✅ "type" field-ஐ { type: String } னு escape பண்ணினோம் */
  inspectionTesting: {
    make:        String,
    hp:          String,
    kw:          String,
    amps:        String,
    volts:       String,
    phase:       String,
    rpm:         String,
    insulation:  String,
    connection:  String,
    frame:       String,
    type:        { type: String },
    slNo:        String,
    exV:         String,
    exA:         String,
  },

  /* ───────── CORE DETAILS ───────── */
  /* ✅ type:{} wrapper remove பண்ணினோம் */
  coreDetails: {
    coreLength:     String,
    coreDia:        String,
    rotorLength:    String,
    rotorPerimeter: String,
  },

  /* ───────── CONDITION DETAILS ───────── */
  /* ✅ type:{} wrapper remove பண்ணினோம் */
  conditionDetails: {
    bearingNo:            String,
    driveEndBearing:      String,
    nonDriveEndBearing:   String,
    endShieldCondition:   String,
    driveEndCondition:    String,
    nonDriveEndCondition: String,
    shaftDriveEnd:        String,
    shaftNonDriveEnd:     String,
    growlerTest:          String,
    rotor:                String,
    statorCoil:           String,
    rotorPosition:        String,
    airGap:               String,
  },

  /* ───────── PAPER DETAILS ───────── */
  /* ✅ type:{} wrapper remove பண்ணினோம் */
  paperDetails: {
    slotL:    String,
    slotB:    String,
    centre:   String,
    top:      String,
    separate: String,
  },

  /* ───────── WINDING DETAILS ───────── */
  /* ✅ type:{} wrapper remove பண்ணினோம் */
  windingDetails: {
    swg:              String,
    slot:             String,
    winding:          String,
    pitch:            String,
    turns:            String,
    totalCoils:       String,
    totalMeter:       String,
    materialEstimate: String,
    windingType:      String,
  },

  /* ───────── WORK DETAILS ───────── */
  mechanicalWorkDone: String,
  causeOfFailure:     String,

  /* ───────── PROCESS ROW ───────── */
  /* ✅ type:{} wrapper remove பண்ணினோம் */
  processDetails: {
    dismantled:  String,
    wireRemoved: String,
    rewound:     String,
    assembled:   String,
  },

  /* ───────── ASSEMBLING & TESTING ───────── */
  /* ✅ type:{} wrapper remove பண்ணினோம் */
  assemblingTesting: {
    hvTest:          String,
    runningTime:     String,
    temperature:     String,
    noLoadVoltageL1: String,
    noLoadVoltageL2: String,
    noLoadVoltageL3: String,
    noLoadAmpsL1:    String,
    noLoadAmpsL2:    String,
    noLoadAmpsL3:    String,
    drumSize:        String,
    rpm:             String,
  },

  /* ───────── LOAD TESTING TABLE ───────── */
  /* ✅ loadTestSchema use பண்றோம் — சரியா இருக்கு */
  loadTesting: {
    type: [loadTestSchema],
    default: Array.from({ length: 5 }, () => ({
      wt: "", amps: "", rpm: "", kw: "",
    })),
  },

  /* ───────── EFFICIENCY ───────── */
  /* ✅ Already correct */
  efficiencyDetails: {
    kwh:                  String,
    pf:                   String,
    hz:                   String,
    efficiency:           String,
    percentageEfficiency: String,
    loadPercentage:       String,
  },

  /* ───────── CONNECTION DETAILS ───────── */
  connectionDetails: String,

  /* ───────── IMAGE PROOF ───────── */
  assembledProof: {
    imageUrl:  String,
    driveLink: String,
  },

  /* ───────── SIGNATURE ───────── */
  authorizedSignature: String,

}, { timestamps: true });

export default mongoose.model("QualityRecord", qualityRecordSchema);