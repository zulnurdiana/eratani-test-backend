function generateRandomNumbers(length, max) {
  const numbers = [];

  for (let i = 0; i < length; i++) {
    numbers.push(Math.floor(Math.random() * max));
  }

  return numbers;
}

// Algoritma Selection Sort
function selectionSort(arr) {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;

    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }

    if (minIndex !== i) {
      const temp = arr[i];
      arr[i] = arr[minIndex];
      arr[minIndex] = temp;
    }
  }

  return arr;
}

const randomNumbers = generateRandomNumbers(10, 100);

console.log("Sebelum di-sort:");
console.log(randomNumbers);

const sortedNumbers = selectionSort([...randomNumbers]);

console.log("Setelah di-sort:");
console.log(sortedNumbers);
