// Вариант 1

export function pow(x, y) {
    let result = 1;

    for (let i = 0; i < y; i++) {
        result = result * x;
    }
    return result;
}
console.log(pow(2, 3));
// Ответ = 8


// Вариант 2
// function pow(base, level) {
//     return base ** level;
// }

// console.log(pow(2, 3)); // 8