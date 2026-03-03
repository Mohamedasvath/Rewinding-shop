import Counter from "../models/Counter.js";

export const getNextSRF = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "srf" },
    { $inc: { value: 1 } },
    {
      returnDocument: "after",  // 🔥 no mongoose warning
      upsert: true
    }
  );

  return counter.value;
};
