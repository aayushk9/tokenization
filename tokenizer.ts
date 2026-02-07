const strInput = `hola guys👋  
i'm aayush, I build software in JS/TS, drink coffee ☕ and ship fast 🚀.  
Price: ₹499 • Users: 1,024 • Status: OK ✅  
Code snippet: const sum = (a, b) => a + b;
नमस्ते from India 🇮🇳
`
// UTF-8 
const bufferInput = Buffer.from(strInput, 'utf-8');
console.log(bufferInput)