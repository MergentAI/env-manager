export const parseEnv = (content: string): { key: string; value: string }[] => {
  const lines = content.split('\n');
  const variables: { key: string; value: string }[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    // Ignore comments and empty lines
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const match = trimmedLine.match(/^([^=]+)=(.*)$/);
    if (match) {
      let key = match[1].trim();
      let value = match[2].trim();

      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      variables.push({ key, value });
    }
  }

  return variables;
};
