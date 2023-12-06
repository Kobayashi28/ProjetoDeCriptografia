import react from 'react';

import api from '../../services/api';

import { useNavigate } from 'react-router-dom';

import './style.css';

const Auth = ()=>{
    
    const handleSubmit=()=>{
        var username = (document.getElementById('username') as HTMLInputElement).value;
        var passwd = (document.getElementById('userpw') as HTMLInputElement).value;
    
        fetch(`${api}:4001/auth`, {
            method:'POST',
            body:JSON.stringify({username, passwd}),
            credentials:'include',
            headers: {
                'content-type':'application/json', 
                'origin':'http://192.168.1.110:3000',
            }
        }).then(res => res.json()).then(data => {
            if(data.logged){
                console.log(data);
                redirect();
            }else{
                alert('Usuário não existe');
            }
        }).catch(err=>console.log(err));
    }

    let navigate = useNavigate();

    const redirect = ()=>{
        navigate('/');
    }

    const handleRegister = ()=>{
        var register = document.getElementsByClassName('register');
        var data = new FormData();
        for(let i = 0 ; i < register.length; i++){
            let elmnt = register[i] as HTMLInputElement;
            if(elmnt.getAttribute('type') === 'file'){
                let tmpFileType = (elmnt.value).split('.');
                let fileType = tmpFileType[(tmpFileType.length-1)];
                if(fileType === 'png' || fileType === 'jpeg' || fileType === 'jpg'){
                    //@ts-ignore
                    data.append(i,elmnt.files[0]);
                }else{
                    console.log('nem vem com essa porra');
                }
            }else{
                //@ts-ignore
                data.append(`${i}`,elmnt.value);
            }
        }

        fetch(`${api}:4001/auth/getUser/${data.get('1')}`, {
            method:'GET',
        }).then(res=>res.json()).then(result=>{
            if(!result.status){
                fetch(`${api}:4001/auth/register`, {
                    method:'POST',
                    body:data,
                }).then(res=>res.json()).then(result=>{
                    console.log(result.status);
                    if(result.status){
                        alert('Usuário cadastrado');
                    }
                })
            }else{
                alert('Falha! Nome de usuário já cadastrado');
            }
        })
    };

    const handleImageChange = (img:any)=>{
        (document.getElementsByClassName('auth-imageUploadLabel')[0] as HTMLLabelElement).style.backgroundImage=`url(${window.URL.createObjectURL(img)})`;
    }
    const handleSectionChange = (section:string)=>{

        var login = document.getElementsByClassName('auth-login')[0] as HTMLDivElement;
        var register = document.getElementsByClassName('auth-register')[0] as HTMLDivElement;

        var regVH = (parseFloat(window.getComputedStyle(register).minHeight)*100)/window.innerHeight;
        var logVH = (parseFloat(window.getComputedStyle(login).minHeight)*100)/window.innerHeight;
        
        var id:any;

        var speed = 2;

        if(section === 'reg'){

            id = setInterval(()=>{
                if(logVH <= 0){
                    if(regVH < 91){
                        regVH+=speed;
                        register.style.minHeight=regVH+'vh';
                        register.style.height=regVH+'vh';
                    }else{  
                        stopInterval();
                    }
                }else{
                    logVH-=speed;
                    login.style.minHeight=logVH+'vh';
                    login.style.height=logVH+'vh';
                }

            }, 0.1);

            const stopInterval = ()=>{
                clearInterval(id);
            }

        }else if(section === 'log'){

            id = setInterval(()=>{
                if(regVH <= 0){
                    if(logVH <= 71){
                        logVH+=speed;
                        login.style.minHeight=logVH+'vh';
                        login.style.height=logVH+'vh';
                    }else{  
                        stopInterval();
                    }
                }else{
                    regVH-=speed;
                    register.style.minHeight=regVH+'vh';
                    register.style.height=regVH+'vh';
                }

            }, 0.1);

            const stopInterval = ()=>{
                clearInterval(id);
            }

        }
    }

    return (
        <div className="auth-container">
            <div className="auth-login">
                <h1>Acessar</h1>
                <div className="auth-loginWrapper">
                    <label className='auth-userIcon'></label>
                    <input autoCorrect='off' autoComplete='off' type="text" placeholder='Nome de usuário' name="username" id="username" />
                </div>
                <div className="auth-loginWrapper">
                    <label className='auth-lockIcon'></label>
                    <input type="password" placeholder='Senha' name="userpw" id="userpw" />
                </div>
                <button onClick={handleSubmit}>Acessar</button>
                <h4 onClick={()=>handleSectionChange('reg')}>Criar uma conta</h4>

            </div>
            <div className="auth-register">
                <h1>Registre-se</h1>
                <input id='auth-imageUpload' type="file" style={{display:"none"}} onChange={(e)=>{
                    //@ts-ignore
                    handleImageChange(e.target.files[0])
                }} className="image register" />
                <label htmlFor="auth-imageUpload" className='auth-imageUploadLabel'></label>
                <div className="auth-loginWrapper">
                    <label className='auth-userIcon'></label>
                    <input autoCorrect='off' autoComplete='off' type="text" className='username register' placeholder='username'/>
                </div>
                <div className="auth-loginWrapper">
                    <label className='auth-lockIcon'></label>
                    <input type="password" className='password register' placeholder='password'/>
                </div>     
                <div className="auth-loginWrapper">
                    <label className='auth-lockIcon'></label>
                    <input type="password" className="password register" placeholder='repeat the password' />
                </div>
                
                <button onClick={handleRegister}>registrar</button>
                <h4 onClick={()=>handleSectionChange('log')}>Já tem uma conta?</h4>

            </div>
        </div>
    )

    
}




export default Auth;