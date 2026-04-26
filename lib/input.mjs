import readline from 'readline';

export function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

export async function hiddenInput(promptText) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(promptText, (answer) => {
      rl.close();
      resolve(answer);
    });

    rl.stdoutMuted = true;
    rl._writeToOutput = function (stringToWrite) {
      if (rl.stdoutMuted) {
        rl.output.write('*'.repeat(stringToWrite.length));
      } else {
        rl.output.write(stringToWrite);
      }
    };
  });
}

export function maskPassword(password) {
  if (password.length <= 4) {
    return '*'.repeat(password.length);
  }
  return (
    password.slice(0, 2) + '*'.repeat(password.length - 4) + password.slice(-2)
  );
}