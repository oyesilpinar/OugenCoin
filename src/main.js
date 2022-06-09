const {Blockchain,Transaction}=require('./blockchain');
const EC=require('elliptic').ec;
const ec=new EC('secp256k1');

const myKey=ec.keyFromPrivate('19159d1149e66140efd261a6862f0675a3fd2424a497c0c07b8b0030d7effffc');
const myWalletAddress= myKey.getPublic('hex');


let ougenCoin =new Blockchain();


const tx1=new Transaction(myWalletAddress,'Genel Anahtar burada',15);
tx1.signTransaction(myKey);
ougenCoin.addTransaction(tx1);

console.log('\nGönderim işlemi başlatılıyor...');
ougenCoin.minePendingTransactions(myWalletAddress);

console.log('Ougenin Cüzdanı ',ougenCoin.getBalanceOfAddress(myWalletAddress));


console.log('Bu Blok doğrulanıyor mu ?',ougenCoin.isChainValid());
