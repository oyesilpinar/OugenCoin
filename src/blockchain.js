const SHA256=require('crypto-js/sha256');
const EC=require('elliptic').ec;
const ec=new EC('secp256k1');

//İşlemler İçin clas oluşturuldu.
class Transaction{
    constructor(fromAdress,toAdress,amount){
        this.fromAdress=fromAdress;
        this.toAdress=toAdress;
        this.amount=amount;
    }

    calculateHash(){
            return SHA256(this.fromAdress+this.toAdress+this.amount).toString();
    }

    //Private Key için method oluşturuyoruz.
    signTransaction(signingKey){

        //Cüzdanlar'ın eşitliğini kontrol ediyoruz.
        if(signingKey.getPublic('hex') !== this.fromAdress){
            throw new Error('Bu cüzdan için işlem gerçekleştiremezsiniz.')
        }

        const hashTx=this.calculateHash();
        const sig=signingKey.sign(hashTx,'base64');
        this.signature=sig.toDER('hex');

    }
    isValid(){
            if(this.fromAdress === null ) return true;

            //İmza olup olmadığını kontrol ediyoruz
            if(!this.signature || this.signature.length===0) {
                throw new Error('Bu işlem gerçekleştirilemez');
            }
            //eğer bir imza varsa genel anahtar çıkartıcağız
            const publicKey=ec.keyFromPublic(this.fromAdress,'hex');
            return publicKey.verify(this.calculateHash(),this.signature);
    
    
        }



}


class Block{
    constructor(timestamp,transactions,previousHash=''){
        this.previousHash=previousHash;
        this.timestamp=timestamp;
        this.transactions=transactions;
        this.hash=this.calculateHash();
        this.nonce =0;
    }


    calculateHash(){

        return SHA256(this.previousHash+this.timestamp+JSON.stringify(this.data)+this.nonce).toString();

    }
    //Her adımda farklı blockchain hashi oluşturulur
    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty)!== Array(difficulty+1).join("0")){
            this.nonce++;
            this.hash =this.calculateHash();
        }
        console.log("Block mined: "+ this.hash);
    }

    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }

    
}





class Blockchain{
    constructor(){
        this.chain=[this.createGenesisBlock()];
        //başına 0 koyarak yazdırma
        this.difficulty=2;
        this.pendingTransactions=[];
        this.miningReward=100;

    }

    createGenesisBlock(){
        //Yeni Blok Olustur.
        return new Block("14/04/2022","Genesis Block","0");

    }


    getLatestBlock(){
        //Son bloğu getir
        return this.chain[this.chain.length-1];
    }

    //Yeni blok ekliyoruz bu kısımda
   minePendingTransactions(miningRewardAdress){
       const rewardTx=new Transaction(null,miningRewardAdress,this.miningReward);
       this.pendingTransactions.push(rewardTx);


       let block=new Block(Date.now(),this.pendingTransactions,this.getLatestBlock().hash);
       block.mineBlock(this.difficulty);

       console.log('Blok İşlemi Başarılı!');
       this.chain.push(block);
       this.pendingTransactions=[
           new Transaction(null,miningRewardAdress,this.miningReward)
       ];

   }
   //Bir işlem yaratıyoruz ve bu işlemlerde bekleyen işlemler olucak tüm işlemler burada gerçekleşicek
   addTransaction(transactions){
       if(!transactions.fromAdress || !transactions.toAdress){
           throw new Error('İşlem bir bir adres içermelidir.');

       }

       if(!transactions.isValid()){
           throw new Error ('Zincire geçersiz işlem eklenemez');
       }

       this.pendingTransactions.push(transactions);
   }


   //İşlem bakiyesini düşürüp arttırmak için bir dengeleyeci method yazıyoruz
   getBalanceOfAddress(address){
       let balance=0;
       for(const block of this.chain){
         for(const trans of block.transactions){
            if(trans.fromAdress===address){
                    balance-=trans.amount;            
            }
            if(trans.toAdress===address){
                balance += trans.amount;
            }
        }
       }
       return balance;
   }

    isChainValid(){
        //Burada validate işlemi yaptık bir önceki blok ile ve şuanki hash ile karşılaşmaması için
        for(let i=1;i<this.chain.length;i++){
            const currentBlock=this.chain[i];
            const previousBlock=this.chain[i-1];

            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            if(currentBlock.hash!==currentBlock.calculateHash()){
                return false;
            }
            if(currentBlock.previousHash!==previousBlock.hash){
                return false;
            }
        }
        return true;

    }




}


module.exports.Blockchain=Blockchain;
module.exports.Transaction=Transaction;