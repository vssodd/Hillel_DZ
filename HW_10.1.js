var arr = [
  {
    "userName":"Test",
    "lastName":"Test",
    "email":"test.test@gmail.com"
  },
  {
    "userName":"Dmitro",
    "lastName":"Porohov",
    "email":"<dmitro.porohov@yahoo.com>"
  },
  {
    "userName":"Andrii",
    "lastName":"",
    "email":"andrii@mail.ru"
  }
];

var reTrusted = /^\w+(\.\w+)?@(gmail\.com|yahoo\.com)$/i;

var reGarbage = /[<>\s]/g;

var trustedEmails = [];

for (var i = 0; i < arr.length; i++) {
  var email = arr[i].email;;
  // 1) чистим мусор
  email = email.replace(reGarbage, "");

  // 2) проверяем по правилам доверия
 if (reTrusted.test(email)) {
    trustedEmails.push(email);
 }
}
console.log(trustedEmails);