var text = "Wonderful, Joyful, Happiness, Time, Task, Apple";

const re = /\b[^aA\s]{6,}\b/g;

console.log(text.match(re));