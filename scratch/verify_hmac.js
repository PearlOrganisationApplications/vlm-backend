const crypto = require('crypto');

const secret = 'test_secret';
const prettyBody = '{\r\n  "event": "payment.captured",\r\n  "payload": {\r\n    "payment": {\r\n      "entity": {\r\n        "id": "pay_manual_test_123",\r\n        "amount": 500,\r\n        "currency": "INR",\r\n        "order_id": "order_SiroS87XISTrex",\r\n        "status": "captured",\r\n        "notes": {\r\n          "userId": "69f07cb186c80add7fcfc9fd"\r\n        }\r\n      }\r\n    }\r\n  }\r\n}';

const hmacCRLF = crypto.createHmac('sha256', secret).update(prettyBody).digest('hex');

console.log('HMAC (CRLF):', hmacCRLF);
console.log('App Expected:', '0bdea2260122f996a4ef3270019f9a9e5621f2a9520d83fd93a1d7089edeb7eb');


