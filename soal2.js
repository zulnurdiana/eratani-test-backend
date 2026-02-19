const readline = require("readline");

function isPalindrome(str) {
  const normalized = str.toLowerCase();
  const reversed = normalized.split("").reverse().join("");
  return normalized === reversed;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Masukkan sebuah kata atau angka: ", (input) => {
  if (isPalindrome(input)) {
    console.log("Palindrome ✅");
  } else {
    console.log("Bukan palindrome ❌");
  }
  rl.close();
});
