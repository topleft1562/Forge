const bs58 = require('bs58');

// convert ARRAY key to private key
const array = [19,117,246,46,3,106,100,62,208,247,116,53,174,51,88,106,148,28,42,156,140,159,190,198,78,97,80,83,23,86,151,38,112,59,183,218,112,54,238,133,62,76,251,101,67,227,225,158,48,231,218,74,44,18,233,203,83,234,243,246,36,237,122,194]
const encoded = bs58.encode(Buffer.from(array));
console.log("PKEY", encoded);

// convert pkey to array
const encoded2 = "PZsrcdtg2UjkEcoyXwShAKZfpbcjBsDdLdTUzNfjqUHfWgwFzySpXFaco9gG6mU1WxRGUxSrpYSLWjoBbztAHWy";
const decodedBuffer = bs58.decode(encoded2);
const byteArray = Array.from(decodedBuffer);
console.log(byteArray);
