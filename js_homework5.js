var services = {
    "стрижка": "60 грн",
    "гоління": "80 грн",
    "Миття голови": "100 грн",
    //"Фарбування": "500 грн",

    price: function () {
        var sum = 0;

        for (var key in this) {
            if (typeof this[key] === "string") {
                sum += parseInt(this[key]);
            }
        }

        return sum + " грн";
    },

    minPrice: function () {
        var min = Infinity;

        for (var key in this) {
            if (typeof this[key] === "string") {
                var value = parseInt(this[key]);
                if (value < min) {
                    min = value;
                }
            }
        }

        return min + " грн";
    },

    maxPrice: function () {
        var max = -Infinity;

        for (var key in this) {
            if (typeof this[key] === "string") {
                var value = parseInt(this[key]);
                if (value > max) {
                    max = value;
                }
            }
        }

        return max + " грн";
    }
};

// Приклад додавання нової послуги:
services["Розбити скло"] = "200 грн";

console.log(services.price());      // "440 грн"
console.log(services.minPrice());   // "60 грн"
console.log(services.maxPrice());   // "200 грн"
