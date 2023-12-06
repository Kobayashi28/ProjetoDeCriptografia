import { Request, Response } from "express";

interface enResults{
    name:string
} 

export default class encryptionController{

    public static enResults = {
        'BINARY':'',
        'NOT':'',
        'INVERT':'',
        'keyBinary':'',
        'keyNot':'',
        'keyInvert':'',
        'XOR':'',
        'HEX':'',
        'SBOX':'',
        'AfterPadding':'',
        'ImprovedPadding':'',
    };

    private static secretKey = 'KBHJYdsa23°pFAG7ndsc'; 
    // private static secretKey = 'cikl1hs23d8u73'; 
    public static setKey(){
        var finalString = '';
        for(let i = 0; i < 16; i++){
            finalString += String.fromCharCode(Math.floor(Math.random() * (126 - 34 + 1) + 34));
        }

        return finalString;
    }

    
    private static sbox = [
        ['63','7c','77','7b','f2','6b','6f','c5','30','01','67','2b','fe','d7','ab','76'],
        ['ca','82','c9','7d','fa','59','47','f0','ad','d4','a2','af','9c','a4','72','c0'],
        ['b7','fd','93','26','36','3f','f7','cc','34','a5','e5','f1','71','d8','31','15'],
        ['04','c7','23','c3','18','96','05','9a','07','12','80','e2','eb','27','b2','75'],
        ['09','83','2c','1a','1b','6e','5a','a0','52','3b','d6','b3','29','e3','2f','84'],
        ['53','d1','00','ed','20','fc','b1','5b','6a','cb','be','39','4a','4c','58','cf'],
        ['d0','ef','aa','fb','43','4d','33','85','45','f9','02','7f','50','3c','9f','a8'],
        ['51','a3','40','8f','92','9d','38','f5','bc','b6','da','21','10','ff','f3','d2'],
        ['cd','0c','13','ec','5f','97','44','17','c4','a7','7e','3d','64','5d','19','73'],
        ['60','81','4f','dc','22','2a','90','88','46','ee','b8','14','de','5e','0b','db'],
        ['e0','32','3a','0a','49','06','24','5c','c2','d3','ac','62','91','95','e4','79'],
        ['e7','c8','37','6d','8d','d5','4e','a9','6c','56','f4','ea','65','7a','ae','08'],
        ['ba','78','25','2e','1c','a6','b4','c6','e8','dd','74','1f','4b','bd','8b','8a'],
        ['70','3e','b5','66','48','03','f6','0e','61','35','57','b9','86','c1','1d','9e'],
        ['e1','f8','98','11','69','d9','8e','94','9b','1e','87','e9','ce','55','28','df'],
        ['8c','a1','89','0d','bf','e6','42','68','41','99','2d','0f','b0','54','bb','16']
    ];


    public static shiftRows(msg:string){
        var blocks:any =  encryptionController.setBlocks(msg);
        var result = '';

        for(let i = 0; i < blocks.length; i++){
            for(let x = 0; x < blocks[i].length; x++){
                for(let y = 0 ; y < x; y++){
                    blocks[i][x].push(blocks[i][x].shift());
                }
            }
        }

        for(let i = 0; i < blocks.length; i++){
            for(let x = 0; x < blocks[i].length; x++){
                for(let y = 0 ; y < blocks[i][x].length; y++){
                    result += blocks[i][x][y];
                }
            }
        }
        return result;

    }

    public static setBlocks(msg:string){
        var finalResult = []
        var splitMsg = msg.split('');
        while(splitMsg.length%16 != 0){
            splitMsg.push('*');            
        }

        for(let i = 0 ; i <= splitMsg.length; i++){

            if(i%16 == 0 && i > 0){
                var blockContainer = [];
                
                for(let x = (i-16); x < i; x++){
                    if(x%4 == 0 && x!=splitMsg.length && x > 0){
                        
                        var block = [];
                        for(let y = (x-4); y < x; y++){
                            block.push(splitMsg[y]);


                            // block.push(y);
                        }
                        blockContainer.push(block);
                    }
                }
                finalResult.push(blockContainer);
            }
        }

        return finalResult;
        
    }


    public static setImprovedPadding (msg:string){
        let result = '';
        let start = Math.floor(Math.random() * (98 - 11 + 1) + 11);
        let counter = start;
        for(let i = 0; i < msg.split('').length;i++){
            if(counter > 100){
                counter = 1;
            }
            result+=String.fromCharCode(msg.split('')[i].charCodeAt(0)*counter);
            counter++;
        }
        return (String.fromCharCode(('' + start).split('')[0].charCodeAt(0)*150) + result + String.fromCharCode(('' + start).split('')[1].charCodeAt(0)*150));
    }

    public static setPadding(row:number, column:number){
        var padding = [row+2,row-2,column+2,column-2];
        var paddingValues = ['','','',''];
        // console.log(encryptionController.sbox[row][column]);
        for(let i = 0; i < padding.length; i++){
            if(padding[i] > 15){
                padding[i] -= 16;
            }else if(padding[i] < 0){
                padding[i] += 16;
            }

            if(i<2){
                paddingValues[i] = encryptionController.sbox[padding[i]][column];
            }else{
                paddingValues[i] = encryptionController.sbox[row][padding[i]];
            }
        }
        // console.log(paddingValues);
        return paddingValues;
    }

    public encrypt(req:Request, res:Response){  
        var binMsg = encryptionController.binOperation(req.body.msg, false);
        var newKey = '';
        var keyLen = req.body.secretKey.split('').length;
        var keyCounter = 0;
        for(let i = 0; i < req.body.msg.split('').length; i++){
            if(keyCounter >= keyLen){
                keyCounter = 0;
            }
            newKey+=req.body.secretKey.split('')[keyCounter];
            keyCounter++;
            
        }
        var binKey = encryptionController.binOperation(newKey, true);

        var xor = encryptionController.xorOperation(binKey, binMsg);
        encryptionController.enResults.XOR = xor;

        var hex = encryptionController.binToHex(xor);
        encryptionController.enResults.HEX = hex;

        var sbox = encryptionController.sBoxMethod(hex);

        // console.log(encryptionController.enResults);

        encryptionController.decrypt(sbox, req.body.secretKey);
        res.json({encrypted:sbox, process:encryptionController.enResults});
    }
    

    public static sBoxMethod(hex:string){
        var tmpFinal = '';
        var tmptmp = '';
        for(let i = 0; i < hex.split(' ').length; i++){
            var row = parseInt(parseInt(hex.split(' ')[i].split('')[0],16).toString(10));
            var column = parseInt(parseInt(hex.split(' ')[i].split('')[1], 16).toString(10));
            let padding = encryptionController.setPadding(column,row);
            tmptmp += String.fromCharCode(parseInt(parseInt(encryptionController.sbox[column][row],16).toString(10)));            
            encryptionController.enResults.SBOX += tmptmp;
            for(let p = 0; p <= padding.length; p++){
                if(p == 4){
                    tmpFinal += String.fromCharCode(parseInt(parseInt(encryptionController.sbox[column][row],16).toString(10)));
                }else{
                    tmpFinal+=String.fromCharCode(parseInt(parseInt(padding[p],16).toString(10)));
                }
            }
        }
        encryptionController.enResults.AfterPadding = tmpFinal;
        return encryptionController.setImprovedPadding(tmpFinal);
    }   

    public static binToHex(bin:string){
        var hex = '';
        for(let i = 0; i < bin.split(' ').length; i++){
            var row = '';
            for(let ii = 0; ii < bin.split(' ')[i].split(',').length; ii++){
                row+=bin.split(' ')[i].split(',')[ii];
            }
            
            let tmpHex = parseInt(row, 2).toString(16).toUpperCase();
            // console.log('binnnnn ' + row + ' hexxx ' + tmpHex);

            if(tmpHex.length < 2){
                hex += '0'+tmpHex;
            }else{
                hex += tmpHex;
            }
            if(i<(bin.split(' ').length-1)){
                hex+=' ';
            }
        }

        return hex;
    }

    public static xorOperation(binKey:string, binMsg:string){
        
        var xorRow = [];
        var xorColumn = '';
        for(let i = 0; i < binMsg.split(' ').length; i++){
            xorRow = [];
            for(let ii = 0; ii < binMsg.split(' ')[i].split(',').length; ii++){
                if(binMsg.split(' ')[i].split(',')[ii] == binKey.split(' ')[i].split(',')[ii]){
                    xorRow.push(0);
                }else{
                    xorRow.push(1);
                }
            }
            if(i < (binMsg.split(' ').length-1)){
                xorColumn+=xorRow + ' ';
            }else{
                xorColumn+=xorRow
            }
        }
        // console.log(binKey.split(' '));
        // console.log(binMsg.split(' '));
        // console.log(xorColumn.split(' '));
        return xorColumn;
    }

    public static binOperation (msg:string, isKey:boolean){
        var msgToEncrypt = msg.split('');
        var binary = [];
        var finalString = '';
        for(let i = 0; i < msgToEncrypt.length; i++){
            binary = (msgToEncrypt[i].charCodeAt(0).toString(2)).split('');
            if(binary.length != 8){
                let binLength = binary.length;
                for(let ii = binLength; ii < 8; ii++){
                    binary.unshift('0');
                }
            }

            if(isKey){
                encryptionController.enResults.keyBinary = encryptionController.enResults.keyBinary+' '+binary;
            }else{
                encryptionController.enResults.BINARY = encryptionController.enResults.BINARY+' '+binary;
            }
            for(let ii = 0; ii < binary.length; ii++){
                if(binary[ii] === '0'){
                    binary[ii] = '1';
                }else{
                    binary[ii] = '0';
                }
            }
            
            var invertBinary = [];

            for(let ii = 0; ii < binary.length; ii++){
                invertBinary.unshift(binary[ii]);
            }

            if(isKey){
                encryptionController.enResults.keyNot = encryptionController.enResults.keyNot + ' ' + binary;
                encryptionController.enResults.keyInvert = encryptionController.enResults.keyInvert+' '+invertBinary;
            }else{
                encryptionController.enResults.NOT = encryptionController.enResults.NOT+' '+binary;
                encryptionController.enResults.INVERT = encryptionController.enResults.INVERT+' '+invertBinary;
            }

            if(i < (msgToEncrypt.length-1)){
                finalString += invertBinary + ' '; 
            }else{
                finalString += invertBinary;
            }

        };
        return finalString;
    }
    




    // DECRIPTAÇÃO  


   

    public static decrypt(msg:string, secretKey:string){
        
        // console.log('o\f+Ä­1\\g\f\fIbÍ|{\n');

        var hex = encryptionController.sBoxDecrypt(msg);
        // console.log(req.body.msg);

        var bin = encryptionController.hexToBin(hex);

        var newKey = '';
        var keyLen = secretKey.split('').length;
        var keyCounter = 0;

        for(let i = 0; i < bin.split(' ').length; i++){
            if(keyCounter >= keyLen){
                keyCounter = 0;
            }
            newKey+=secretKey.split('')[keyCounter];
            keyCounter++;
            
        }

        var binKey = encryptionController.binOperation(newKey, true);

        var unxor = encryptionController.xorDecrypt(binKey, bin);
        console.log(encryptionController.binOperationDecrypt(unxor));
        // res.json({'decrypted':encryptionController.binOperationDecrypt(unxor) });
    }

    public static unshiftRows(msg:string){

        var result = '';
        var blocks = encryptionController.setBlocks(msg);
        for(let i = 0; i < blocks.length; i++){
            for(let x = 0; x < blocks[i].length; x++){
                for(let y = x-1 ; y > 0; y--){
                    //@ts-ignore
                    blocks[i][x].push(blocks[i][x].shift());
                }
            }
        }
      console.log(blocks);


        for(let i = 0; i < blocks.length; i++){
            for(let x = 0; x < blocks[i].length; x++){
                for(let y = 0 ; y < blocks[i][x].length; y++){
                    result += blocks[i][x][y];
                }
            }
        }
        console.log(result);
        return result;
    }

    public static removePadding(msg:string){
    
        var splitMsg = msg.split('');

        var counter = parseInt(String.fromCharCode(Math.round(splitMsg[0].charCodeAt(0)/150)) + '' +String.fromCharCode(Math.round(splitMsg[splitMsg.length-1].charCodeAt(0)/150)));

        var result = '';

        for(let i = 1 ; i < (splitMsg.length-1); i++){
            if(counter > 100){
                counter = 1;
            }
            result += String.fromCharCode(splitMsg[i].charCodeAt(0)/counter);
            counter++;
        }
        return result;
    }

    public static sBoxDecrypt(paddingMSG:string){
        var msg = encryptionController.removePadding(paddingMSG);
        var hex = '';

        for(let i = 4; i < msg.split('').length;i+=5){

            var tmpHex = msg.split('')[i].charCodeAt(0).toString(16).toUpperCase();

            if(tmpHex.length < 2){
                tmpHex = '0'+ tmpHex
            }
            
            for(let row = 0; row < encryptionController.sbox.length; row++){
                for(let column = 0; column < encryptionController.sbox[row].length; column++){
                    if(encryptionController.sbox[row][column].toUpperCase() === tmpHex){
                        // console.log(tmpHex+ ' row > '+ row + ' column -> ' + column);
                        hex += column.toString(16)+ row.toString(16);
                    }
                }
            }
            
        }
        return hex;
    }

    public static hexToBin(hex:string){
        var newHex ='';
        for(let i = 0; i < hex.split('').length; i+=2){
            newHex += hex.split('')[i]+ hex.split('')[i+1];
            if(i < hex.split('').length-2){
                newHex+=' '
            }
        }
        var bin = '';
        for(let i = 0; i < newHex.split(' ').length; i++){
            // console.log(parseInt(newHex.split(' ')[i],16).toString(2) + ' binhex ' + newHex.split(' ')[i]);
            var tmpBin = parseInt(newHex.split(' ')[i],16).toString(2);
            for(let ii = tmpBin.split('').length; ii < 8; ii++){
                tmpBin = '0' + tmpBin;
            }
            bin+=tmpBin;
            if(i < (newHex.split(' ').length-1)){
                bin+=' ';
            }
        }
        return bin;
    }

    public static xorDecrypt(binKey:string, xorBin:string){
        var originalBin = '';
        for(let i = 0; i < binKey.split(' ').length; i++){
            for(let ii = 0; ii < binKey.split(' ')[i].split(',').length; ii++){
                if(binKey.split(' ')[i].split(',')[ii]===xorBin.split(' ')[i].split('')[ii]){
                    originalBin+='0';
                }else{
                    originalBin+='1';
                }
            }
            if(i<(binKey.split(' ').length-1))
                originalBin+=' ';
        }        
        // console.log(binKey.split(' '));
        // console.log(xorBin.split(' '));
        // console.log(originalBin.split(' '));
        return originalBin;
    }

    public static binOperationDecrypt (msg:string){
        var msgToDecrypt = msg.split(' ');
        var binary = '';
        var finalString = '';
        // console.log(msg.split(' ').length);
        for(let i = 0; i < msg.split(' ').length; i++){
            var tmpBin = '';
            for(let ii = (msg.split(' ')[i].split('').length-1); ii >= 0 ; ii--){
                // console.log(msg.split(' ')[i].split('').length)
                // console.log(msg.split(' ')[i].split('')[ii]);
                tmpBin += msg.split(' ')[i].split('')[ii];
            }
            binary+=tmpBin;
            if(i < msg.split(' ').length-1){
                binary+=' ';
            }

        }
        var finalBinary = '';
        for(let i = 0; i < binary.split(' ').length; i++){
            for(let ii = 0; ii < binary.split(' ')[i].split('').length; ii++){
                if(binary.split(' ')[i].split('')[ii] == '0'){
                    finalBinary+='1';
                }else{
                    finalBinary+='0'
                }
            }
            if(i < binary.split(' ').length-1){
                finalBinary+=' ';
            }
        }
        var result = '';
        for(let i = 0; i < finalBinary.split(' ').length; i++){
            result += String.fromCharCode(parseInt(parseInt(finalBinary.split(' ')[i],2).toString(10),10));
        }
        // for(let i = 0; i < msgToDecrypt.length; i++){
        //     binary = (msgToDecrypt[i].charCodeAt(0).toString(2)).split('');
        //     if(binary.length != 8){
        //         let binLength = binary.length;
        //         for(let ii = binLength; ii < 8; ii++ ){
        //             binary.unshift('0');
        //         }
        //     }
        //     var revertBinary = [];

        //     for(let ii = 0; ii < binary.length; ii++){
        //         revertBinary.unshift(binary[ii]);
        //     }

        //     for(let ii = 0; ii < revertBinary.length; ii++){
        //         if(revertBinary[ii] === '0'){
        //             revertBinary[ii] = '1';
        //         }else{
        //             revertBinary[ii] = '0';
        //         }
        //     }

        //     // var binToAscci = 0;
        //     // var result = 128;

        //     // for(let ii = 0; ii < revertBinary.length; ii++){
        //     //     if(revertBinary[ii] == '1'){
        //     //         binToAscci += result;
        //     //     }
        //     //     result = result / 2;
        //     // }
        //     finalString+=revertBinary;
            
        // }
        return result;
    }
}