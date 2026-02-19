const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const base = [1, 2, 4, 5, 7, 8, 10];

let testCases = [];
let totalTests = 0;
let currentIndex = 0;

rl.question("Masukkan jumlah test case: ", (t) => {
  totalTests = parseInt(t);

  console.log(`Silakan masukkan ${totalTests} nilai k:`);

  askInput();
});

function askInput() {
  if (currentIndex < totalTests) {
    rl.question(`Input k ke-${currentIndex + 1}: `, (k) => {
      testCases.push(parseInt(k));
      currentIndex++;
      askInput();
    });
  } else {
    processResults();
    rl.close();
  }
}

function processResults() {
  console.log("\nHasil:");

  for (let k of testCases) {
    const block = Math.floor((k - 1) / 7);
    const pos = (k - 1) % 7;
    const result = block * 10 + base[pos];

    console.log(result);
  }
}
