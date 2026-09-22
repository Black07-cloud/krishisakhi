export const generateAIResponseContent = (reasoningResult) => {
  const { headline, sections, recommendation, actions } = reasoningResult;

  let lines = [];

  if (headline) {
    lines.push(`### ${headline}\n`);
  }

  if (sections && sections.length > 0) {
    sections.forEach((sec) => {
      lines.push(sec);
    });
    lines.push("");
  }

  if (recommendation) {
    lines.push(`**Recommendation:**\n${recommendation}\n`);
  }

  if (actions && actions.length > 0) {
    actions.forEach((act) => {
      if (act.type === "TASK_CREATED") {
        lines.push(`✅ **Action Taken**: Created task *"${act.title}"* scheduled for ${act.dueDate}.`);
      }
    });
  }

  return lines.join("\n");
};
