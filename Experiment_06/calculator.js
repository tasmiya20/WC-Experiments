const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function calculate(num1, operator, num2) {
  switch (operator) {
    case '+':
      return num1 + num2;
    case '-':
      return num1 - num2;
    case '*':
      return num1 * num2;
    case '/':
      if (num2 === 0) {
        return "Error: Division by zero.";
      }
      return num1 / num2;
    default:
      return "Error: Invalid operator.";
  }
}

function startCalculator() {
  rl.question('Enter calculation: ', (input) => {
    const parts = input.trim().split(' ');
    
    if (parts.length !== 3) {
      console.log('Invalid format. Please use: number operator number');
      askToContinue();
      return;
    }

    const num1 = parseFloat(parts[0]);
    const operator = parts[1];
    const num2 = parseFloat(parts[2]);

    if (isNaN(num1) || isNaN(num2)) {
      console.log('Invalid numbers provided.');
      askToContinue();
      return;
    }

    const result = calculate(num1, operator, num2);
    console.log(`Result: ${result}`);
    askToContinue();
  });
}

function askToContinue() {
    rl.question('Another calculation? (yes/no): ', (answer) => {
        if (answer.toLowerCase() === 'yes') {
            console.log('---------------------------------');
            startCalculator();
        } else {
            console.log('Goodbye!');
            rl.close();
        }
    });
}

console.log('Simple Command-Line Calculator');
console.log('Enter a calculation with spaces (e.g., 10 * 5)');
console.log('---------------------------------');
startCalculator();