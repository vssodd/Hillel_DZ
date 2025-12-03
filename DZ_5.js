function checkProbabilityTheory(count) {
    var min = 100;
    var max = 1000;
    var evenCount = 0;
    var oddCount = 0;

    for (var i = 0; i < count; i++) {
        var num = Math.floor(Math.random() * (max - min + 1)) + min;
    
        if (num % 2 === 0) {
            evenCount++;
        } else {
            oddCount++;
        }
    }

    var evenPercent = (evenCount / count * 100).toFixed(2);
    var oddPercent = (oddCount / count * 100).toFixed(2);

    console.log("Кількість згенерованих чисел: " + count);
    console.log("Парних чисел: " + evenCount);
    console.log("Непарних чисел: " + oddCount);
    console.log("Відсоток парних: " + evenPercent + "%");
    console.log("Відсоток непарних: " + oddPercent + "%");
    
}

checkProbabilityTheory(1000);