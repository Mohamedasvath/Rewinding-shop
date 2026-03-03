export const stageMessage = (stage, name) => {
  const msgs = {
    Received: `Hello ${name}, your motor has been received for service.`,
    Inspection: `Your motor is under inspection.`,
    Disassembly: `Your motor is being disassembled.`,
    Rewinding: `Rewinding process started.`,
    Assembly: `Motor assembly in progress.`,
    Testing: `Motor is under final testing.`,
    Completed: `Service completed. You can collect your motor.`
  };

  return msgs[stage] || "Service updated.";
};
