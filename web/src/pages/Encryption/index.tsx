import react from 'react';

import api from '../../services/api';

import './style.css';

const Encryption = ()=>{

    const handleEncrypt = ()=>{
        let text = (document.getElementsByClassName('en-input')[0] as HTMLInputElement).value;
        let key = (document.getElementsByClassName('secretKey')[0] as HTMLInputElement).value;
        fetch(`${api}:4001/encrypt`,{
            method:'POST',
            body:JSON.stringify({'msg':text, 'secretKey':key}),
            headers:{
                'Content-Type':'application/json'
            }
        }).then(result=>result.json()).then(data=>{
            //@ts-ignore
            (document.getElementsByClassName('result')[0] as HTMLTextAreaElement).innerText=data.encrypted;
            console.log('Chave para binário: ' + data.process.keyBinary);
            console.log('Processo NOT na chave: ' + data.process.keyNot);
            console.log('Processo de inversão da chave: ' + data.process.keyInvert);
            console.log('Texto em binário: '+data.process.BINARY);
            console.log('Processo NOT no binário: ' + data.process.NOT);
            console.log('Processo de inversão no binário: '+ data.process.INVERT);
            console.log('Resultado do XOR entre a inversão do binário da chave e do texto: ' + data.process.XOR);
            console.log('Conversão do resultado do XOR para HEX: '+data.process.HEX);
            console.log('Resultado da caixa de substituição: ' + data.process.SBOX);
        });
    }

    const handleDecrypt = ()=>{
        let text = (document.getElementsByClassName('de-input')[0] as HTMLInputElement).value;
        let key = (document.getElementsByClassName('secretKey')[0] as HTMLInputElement).value;
        fetch(`${api}:4001/decrypt`,{
            method:'POST',
            body:JSON.stringify({'msg':text, 'secretKey':key}),
            headers:{
                'Content-Type':'application/json'
            }
        }).then(result=>result.json()).then(data=>{
            //@ts-ignore
            (document.getElementsByClassName('result')[0] as HTMLTextAreaElement).innerText=data.decrypted;
        });
    }

    return(
        <div className='en-container'>
            <textarea placeholder='chave simétrica' className='secretKey'></textarea>
            <div className="textareas">
                <textarea placeholder='Criptografar' className='en-input'></textarea>
                <textarea placeholder='Resultados' className='result'></textarea>
                <textarea placeholder='Descriptografar' className='de-input'></textarea>
            </div>
            <div className="buttons">
                <button onClick={handleEncrypt}>criptografar</button>
                <button onClick={handleDecrypt}>decriptar</button>
            </div>
        </div>
    )
}

export default Encryption;