import react, {ChangeEvent, useEffect, useState} from 'react';

import {useNavigate} from 'react-router-dom';

import './style.css';

import profilePic from '../../assets/user.jpeg';
import filter from '../../assets/filter.svg';
import send from '../../assets/send.png';
import arrow from '../../assets/arrowright.svg';
import logout from '../../assets/logout.svg';
import confirm from '../../assets/confirm.png';

import api from '../../services/api';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faUser } from '@fortawesome/free-regular-svg-icons';

import {socket} from '../../socket';

interface cookieType {
    'user_id':string,
    'username':string,
    'iat':number
}

interface channelDataType{
    id:number,
    channelName:string,
    secretKey:string,
    channelPicture:string
}

interface jsonMessageType{
    messageContent:string,
    sentTime:string,
    username:string,
    ds_type:string;
}


const Home = ()=>{

    const [user_id, setUser_id] = useState(0);
    const [username, setUsername] = useState('');
    const [msg, setMsg] = useState('');
    const [msgReceived, setMsgReceived] = useState('');
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [channel, setChannel] = useState('');
    // const [userSelection, setUserSelection] = useState<String[]>([]);


    const handleNewMessage = (messageData:jsonMessageType)=>{
        if(messageData.messageContent === '') return;
    


        var receivedBox = document.getElementsByClassName('lp-chatboxContent')[0];
        var newMsgContainer = document.createElement("div");
        var newMsgHeader = document.createElement('div');
        var usernameLabel = document.createElement('label');
        var timestampLabel = document.createElement('label');
        var messageWrapper = document.createElement('div');
    
        var newMsg = document.createElement('p');
    
        newMsgContainer.className = 'lp-messageContainer';
        newMsgHeader.className = 'lp-messageHeader';
        usernameLabel.className = 'lp-messageLabel';
        timestampLabel.className = 'lp-messageTimeLabel';
        
        if(messageData.ds_type == 'systemAlert'){
            console.log('sdfiokndsf');
            newMsg.innerText = messageData.messageContent;
            messageWrapper.className='lp-systemMessage';
            newMsgContainer.style.maxWidth='100%';
        }else{
            messageWrapper.className='lp-message';
            if(messageData.username == username){
                newMsgContainer.style.marginLeft='auto';
            }else{
                newMsgContainer.style.marginRight='auto';
            }
            var timeString = '';
            var splitTime = messageData.sentTime.split('T');
            if(splitTime.length > 1){
                var dateSplit = splitTime[0].split('-');
                timeString = (splitTime[1].substring(0,5)) + ' ' + dateSplit[2] + '/' + dateSplit[1] + '/' + dateSplit[0];
            }else{
                timeString = messageData.sentTime;
            }
            
            newMsg.innerText = messageData.messageContent;
            usernameLabel.innerText = messageData.username;
            timestampLabel.innerText = ' ' + timeString;
        }
        newMsgHeader.append(usernameLabel);
        newMsgHeader.append(timestampLabel);
    
        messageWrapper.append(newMsgHeader)
    
        messageWrapper.append(newMsg);
        newMsgContainer.append(messageWrapper);
        receivedBox.append(newMsgContainer);
        
       

        receivedBox.scrollTo(0, receivedBox.scrollHeight)
    }

const handleNewChannel = (data:channelDataType)=>{
    let channelList = document.getElementsByClassName('lp-contactList')[0];

    var contactItem = document.createElement('li');
    var contactProfilePic = document.createElement('div');
    // var profilePic = document.createElement('img');
    var contactMessageWrapper = document.createElement('div');
    var cmwRow = document.createElement('div');
    var contactName = document.createElement('h1');
    var contactLastMessageDate = document.createElement('h3');
    var contactLastMessage = document.createElement('h4');

    contactItem.id=''+data.id;

    contactItem.className = 'lp-contactItem';
    contactProfilePic.className = 'lp-contactProfilePic';
    contactProfilePic.style.backgroundImage=`url(${api}:4001/uploads/channel/${data.channelPicture})`
    // profilePic.className='lp-profilePic';
    contactMessageWrapper.className='lp-contactMessageWrapper';
    cmwRow.className='lp-CMW-row';
    contactName.className='lp-contactName';
    contactLastMessageDate.className='lp-contactLastMessageDate';
    contactLastMessage.className='lp-contactLastMessage';

    // profilePic.src=`${api}:4001/uploads/channel/${data.channelPicture}`;
    contactName.innerText=''+data.channelName;
    contactLastMessage.innerText='última mensagem do usuário';
    contactLastMessageDate.innerText='24/03/2018';

    cmwRow.append(contactName);
    cmwRow.append(contactLastMessageDate);
    contactMessageWrapper.append(cmwRow);
    contactMessageWrapper.append(contactLastMessage);

    contactItem.append(contactProfilePic);
    contactItem.append(contactMessageWrapper);

    contactItem.addEventListener('click', ()=>{
        setChannel(''+data.id);
    });

    channelList.append(contactItem);
}
const handleKeySubmit = ()=>{
    (document.getElementsByClassName('lp-chatboxWriteMessage')[0] as HTMLInputElement).addEventListener('keyup', (e)=>{
        if(e.key === 'Enter'){
            handleChatSubmit();
        }
    });
}

const handleChatSubmit = ()=>{
    var input = document.getElementsByClassName('lp-chatboxWriteMessage')[0] as HTMLInputElement;
    setMsg(input.value);
    input.value=''; 
};

const setChannelList = (changeChannel:boolean)=>{
    fetch(`${api}:4001/channel/list/${user_id}`,{
        method:'GET',
        headers: {
            'Content-Type':'application/json', 
        }
    }).then(result=>result.text())
    .then(data=>{
        let jsondata = JSON.parse(data);
        wipeChannelList();
        for(let i = 0; i < jsondata.length; i++){
            if(changeChannel){
                setChannel(''+jsondata[i].id);
            }
            handleNewChannel(jsondata[i]);                
        }
    });
}
    useEffect(()=>{
        fetch(`${api}:4001/auth/verify`,{
            method:'GET',
            credentials:'include',
            headers: {
                'Content-Type':'application/json', 
            }
        }).then(result=>result.text()).then(cookie=>{
            if(cookie == 'Forbidden'){
                redirect();
            }else{
                const access_token = JSON.parse(cookie) as cookieType;
                setUser_id(parseInt(access_token.user_id));
                setUsername(access_token.username);
            }
        })

    }, [])

    let navigate = useNavigate();

    const redirect = ()=>{
        navigate('/auth');
    }

    useEffect(()=>{
        socket.on('update-'+user_id, (msg:string)=>{
            console.log(msg);
            if(msg === 'newChannel' || msg === 'notification'){
                setChannelList(false);
            }else if(msg === ''){

            }
        });
    })

    useEffect(()=>{
        
        setChannelList(true);

        fetch(`${api}:4001/users/list`,{
            method:'GET',
            headers:{
                'Content-Type':'application/json'
            }
        }).then(res=>res.text()).then(data=>{
            let jsondata = JSON.parse(data);
            wipeUserList();
            for(let i = 0; i < jsondata.length; i++){
                handleUserList(jsondata[i]);
            }
        });

        
        const onConnect = ()=>{
            setIsConnected(true);
            console.log('conectado');
        };
        const onDisconnect = ()=>{
            setIsConnected(false);
        }

        socket.on('connect', onConnect);

        socket.on('disconnect', onDisconnect);
    

        return ()=>{
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        }
    }, [user_id])

    useEffect(()=>{
        const onReceiveMessage = (onMsg:string)=>{
            let msgSplit = onMsg.split(socketSeparator);
            setMsgReceived(onMsg[0]);
            let d = new Date();
            let dateString = d.getHours() + ":" + d.getMinutes() + " " + d.getUTCDate() + "/" + d.getUTCMonth() + "/" + d.getUTCFullYear();
            handleNewMessage({"messageContent":msgSplit[0],"sentTime":''+dateString,"username":msgSplit[1], ds_type:msgSplit[2]});
        }
        
        socket.on(channel, onReceiveMessage)

        document.getElementsByClassName('lp-chatboxContent')[0].innerHTML='';

        if(channel != '' && channel != '0'){
            fetch(`${api}:4001/channel/message/list/${channel}`, {
                method:'GET',
                headers: {
                    'Content-Type':'application/json', 
                }
            }).then(result=>result.json()).then(messages=>{
                //@ts-ignore
                for(let i = messages.results.length; i > 0 ; i--){
                    console.log(messages);
                    handleNewMessage(messages.results[i-1]);
                }
            });

            setChannelInfo();
        }
        
        return ()=>{socket.off(channel, onReceiveMessage);}

    }, [channel])

    const socketSeparator = '/][{}/';

    useEffect(()=>{
        if(msg != ''){
            socket.emit('chat', (user_id+socketSeparator+channel+socketSeparator+msg+socketSeparator+username));
        }
    }, [msg]);

const setChannelInfo = ()=>{
    fetch(`${api}:4001/channel/info/${channel}`, {
        method:'GET',
        headers: {
            'Content-Type':'application/json', 
        }
    }).then(result=>result.json()).then((data)=>{
        (document.getElementsByClassName('lp-ciImage')[0] as HTMLDivElement).style.backgroundImage=`url('${api}:4001/uploads/channel/${data[0].channelPicture}')`;
        (document.getElementsByClassName('lp-ciTitle')[0] as HTMLElement).innerText=data[0].channelName;
        (document.getElementsByClassName('lp-ciUserCount')[0] as HTMLElement).innerText=`Canal - ${data.length} usuários`;
        (document.getElementsByClassName('lp-chatboxTitle')[0] as HTMLElement).innerText=data[0].channelName;
        (document.getElementsByClassName('lp-chatboxImage')[0] as HTMLDivElement).style.backgroundImage=`url('${api}:4001/uploads/channel/${data[0].channelPicture}')`;
        

        var ciUsers = document.getElementsByClassName('lp-ciUsers')[0] as HTMLUListElement;

        ciUsers.innerHTML='';
        
        var concatUsers = '';

        var stopConcat = false;

        for(let i = 0; i < data.length; i++){
            let ciUser = document.createElement('li');
            ciUser.className='lp-ciUser';
            
            let ciULimg = document.createElement('div');
            ciULimg.className='lp-ciULimg';
            ciULimg.style.backgroundImage=`${api}:4001/uploads/profilePic/${data[i].profilePic}`;

            let ciULText = document.createElement('div');
            ciULText.className='lp-ciULText';
            ciULText.innerText=data[i].username;

            if(i < 12){
                if(i == (data.length-1)){
                    concatUsers += data[i].username;
                }else{
                    concatUsers += data[i].username + ', ';
                }
            }else{
                if(!stopConcat){
                    concatUsers +='...';
                    stopConcat = true;
                }
            }
            

            ciUser.append(ciULimg);
            ciUser.append(ciULText);

            ciUsers.append(ciUser);
        }
    

        (document.getElementsByClassName('lp-chatboxMemberList')[0] as HTMLElement).innerText=concatUsers;

        console.log();
    });
}

const wipeUserList = ()=>{
    var userList = document.getElementsByClassName('lp-ncUserList')[0];

    userList.innerHTML='';
}
const handleUserList = (data:any)=>{

    if(data.username == username)
        return;

    var userList = document.getElementsByClassName('lp-ncUserList')[0];

    var item = document.createElement('li');
    item.style.height='12vh';
    var ncUserPic = document.createElement('div');
    ncUserPic.className='lp-ncUserPic';
    item.className='lp-unselected';

    var userpic = document.createElement('img');
    userpic.src=`${api}:4001/uploads/profilePics/${data.profilePic}`;

    var ncUsername = document.createElement('h1');
    ncUsername.className='lp-ncUsername';
    ncUsername.innerText=data.username;

    item.addEventListener('click', ()=>{
        if(item.getAttribute('class') == 'lp-unselected'){
            item.removeAttribute('class');
            item.className='lp-selected';
        }else{
            item.removeAttribute('class');
            item.className='lp-unselected';
        }
        let ncFooter = document.getElementsByClassName('lp-ncFooter')[0] as HTMLElement;
        if(document.getElementsByClassName('lp-selected').length > 0){
            ncFooter.style.color='rgba(255,255,255,0.9)';
            ncFooter.style.cursor='pointer';
        }else{
            ncFooter.style.color='rgba(255,255,255,0.2)';
            ncFooter.style.cursor='auto';
        }
    });

    ncUserPic.append(userpic);
    item.append(ncUserPic);
    item.append(ncUsername);
    userList.append(item);
}

const handleChannelSubmit = ()=>{
    var selected = document.getElementsByClassName('lp-selected');

    let userList = '';
    let data = new FormData();

    for(let i = 0; i < selected.length; i++){
        userList+=((selected[i] as HTMLLIElement).children[1] as HTMLElement).innerText + '][';      
    }
    data.append('userList', userList);
    let channelPicture = document.getElementById('ncImgInput') as HTMLInputElement;
    let tmpFileType = (channelPicture.value).split('.');
    let fileType = tmpFileType[(tmpFileType.length-1)];

    if(fileType === 'png' || fileType === 'jpeg' || fileType === 'jpg'){
        //@ts-ignore
        data.append('channelPicture',channelPicture.files[0]);
    }else{
        console.log('nem vem com essa porra');
    }
    var ncNameInput = document.getElementsByClassName('lp-ncNameInput')[0] as HTMLInputElement;
    data.append('channelName', ncNameInput.value)
    data.append('owner', username);
    fetch(`${api}:4001/channel/create`, {
        method:'POST',
        body:data,
    }).then(res=>res.json()).then(result=>{
        if(result.status == 'ok'){
            handleMenuCall(false);
            (document.getElementsByClassName('lp-newChannel')[0] as HTMLDivElement).style.left='-35vw';
            getChannelID(ncNameInput.value);
            wipeChannelInfo();
        }
    })
    
}
const getChannelID = (ncNameInput:string)=>{
    fetch(`${api}:4001/channel/id/${ncNameInput}`,{
        method:'GET',
        headers: {
            'Content-Type':'application/json', 
        }
    }).then(results=>results.json()).then(result=>{
        console.log(result.channelId);
        setChannel(''+result.channelId);
    })
}

const wipeChannelInfo = ()=>{
    (document.getElementsByClassName('lp-ncNameInput')[0] as HTMLInputElement).value='';
    (document.getElementById('ncImgInput') as HTMLInputElement).value='';
    (document.getElementsByClassName('lp-ncFooter')[0] as HTMLElement).style.color='rgba(255,255,255,0.2)';
    (document.getElementsByClassName('lp-ncImgInput')[0] as HTMLLabelElement).style.backgroundImage=`url(${profilePic})`

    var selected = document.getElementsByClassName('lp-selected');
    let len = selected.length;
    for(let i = 0; i < len; i++){
        (selected[0] as HTMLElement).classList.remove('lp-selected');
    }
}

const handleNextChannel = ()=>{

    var selected = document.getElementsByClassName('lp-selected');

    if(selected.length == 0) return;

    var ncUserList = document.getElementsByClassName('lp-ncUserList')[0] as HTMLUListElement;
    
    if(window.getComputedStyle(ncUserList).display == 'flex'){
        ncUserList.style.display='none';
        handleMenuCall(true);
    }else{
        handleChannelSubmit();
    }



}

// const handleUserSelection = (data:any)=>{
    
//     // let separator = '/&**&/.';
    
//     setUserSelection((prev)=>[
//         ...prev, data.username
//     ]);


// }

// useEffect(()=>{
//     var us = userSelection;
//     // for(let i = 0; i < us.length; i++){
//     //     console.log('i')
//     //     for(let ii = 0; ii < us.length; ii++){
//     //         console.log('ii')
//     //         console.log(us);
//     //         if(us[i] == us[ii]){
//     //             us.pop();
//     //         }
//     //     }

//     // }
//     if(us.length > 1){
//         // console.log(us[us.length-1]);
//         for(let i = 0; i < us.length; i++){
//             console.log(us[us.length-1] + ' ' + us[i]);
//             if(us[us.length-1] == us[i]){
//                 // console.log(' CORTA '+ us[us.length-1] + ' ' + us[i] + ' ' + i);
//                 us.pop();
//             }
//         }
//     }
//     console.log(us);
//     setUserSelection(us);    
// }, [userSelection]);

const handleMenuCall = (callMenu:boolean)=>{
    var newChannel = document.getElementsByClassName('lp-newChannel')[0] as HTMLDivElement;
    var menuSize = window.getComputedStyle(document.getElementsByClassName('lp-menu')[0] as HTMLDivElement).width;
    newChannel.style.width = menuSize;

    var userListDisplay = window.getComputedStyle(document.getElementsByClassName('lp-ncUserList')[0] as HTMLUListElement).display;
    var ncInfo = document.getElementsByClassName('lp-ncChannelInfo')[0] as HTMLDivElement;
    var userList = document.getElementsByClassName('lp-ncUserList')[0] as HTMLDivElement;

    if(userListDisplay == 'flex'){
        if(callMenu){
            newChannel.style.left='0';
        }else{
            newChannel.style.left='-35vw';
            wipeChannelInfo();
        }
    }else{
        if(callMenu){
            userList.style.display='none';
            ncInfo.style.display='flex';
            (document.getElementsByClassName('lp-ncTitle')[0] as HTMLElement).innerText='Novo canal';
            (document.getElementsByClassName('lp-ncFooterSubmit')[0] as HTMLElement).innerText='Finalizar';
        }else{
            userList.style.display='flex';
            ncInfo.style.display='none';
            (document.getElementsByClassName('lp-ncTitle')[0] as HTMLElement).innerText='Selecione os usuários';
            (document.getElementsByClassName('lp-ncFooterSubmit')[0] as HTMLElement).innerText='Próximo';

        }
    }
    

}
const handleNcImgChange = (img:any)=>{
    (document.getElementsByClassName('lp-ncImgInput')[0] as HTMLLabelElement).style.backgroundImage=`url(${window.URL.createObjectURL(img)})`;
}

const handleChannelInfo = ()=>{
    var channelInfo = document.getElementsByClassName('lp-channelInfo')[0] as HTMLDivElement;
    if(window.getComputedStyle(channelInfo).position == 'absolute'){
        channelInfo.style.left='70vw';
        setTimeout(()=>{
            channelInfo.style.position='unset';
        }, 400)
    }else{
        channelInfo.style.position='absolute';
        channelInfo.style.left='120vw';
    }
}

const handleNewChannelUser = ()=>{
    var input = document.getElementsByClassName('lp-ciNewUserInput')[0] as HTMLInputElement;

    fetch(`${api}:4001/channel/add/user`,{
        method:'POST',
        body:JSON.stringify({username:input.value, channelID:channel}),
        headers:{
            'content-type':'application/json'
        }
    }).then(result=>result.json()).then(status=>{
        console.log(status.status);
        if(status.status == 'ok'){
            input.value='';
            setChannelInfo();
        }
    });

}
const handleChannelExit=()=>{
    console.log(channel + ' channel and user id ' + user_id)
    fetch(`${api}:4001/channel/remove/user`,{
        method:'POST',
        body:JSON.stringify({channelID:channel, userID:user_id, username:username}),
        headers:{
            'content-type':'application/json'
        }
    }).then(results=>results.json()).then(result=>{
        if(result.status === 'ok'){
            //@ts-ignore
            setChannelList(true);
        }
    })
}
const handleLogout = ()=>{
    fetch(`${api}:4001/auth/logout`, {
        method:'POST'
    }).then(results=>results.json()).then((result)=>{
        if(result.destroyed){
            redirect();
        }
    });
}
const handleHiddenButton = (amount:number)=>{
    for(let i = 0; i < amount; i++){
        console.log(i);
        socket.emit('chat', (user_id+socketSeparator+channel+socketSeparator+"MENSAGEM ÚNICA-"+i+socketSeparator+username+socketSeparator+'teste'));
    }
}
    return(
        <div className="lp-container">
            <div className="lp-newChannel">
                <header className="lp-ncHeader">
                    <div className="lp-ncBack">
                        <img  onClick={()=>handleMenuCall(false)} src={arrow} alt="" />
                    </div>
                    <h1 className="lp-ncTitle">Selecione os usuários</h1>
                </header>
                <ul className="lp-ncUserList">
                    {/* <li>
                        <div className="lp-ncUserPic">
                            <img src={profilePic} alt="" />
                        </div>
                        <h1 className="lp-ncUsername">Teste</h1>
                    </li> */}
                </ul>
                <div className="lp-ncChannelInfo">
                    <div className="lp-ncInfoWrapper">

                    <input id='ncImgInput' type='file' onChange={(e)=>{
                        //@ts-ignore
                        handleNcImgChange(e.target.files[0]);
                    }} style={{display:'none'}} />

                    <label htmlFor='ncImgInput' className='lp-ncImgInput' style={{backgroundImage:`url('${profilePic}')`}}></label>
                    <input type="text" className="lp-ncNameInput" placeholder='Insira o nome do canal'/>
                    </div>

                </div>
                <footer onClick={handleNextChannel} className="lp-ncFooter">
                    <h1 className='lp-ncFooterSubmit'>Próximo</h1>
                </footer> 
            </div>

            <div className="lp-menu">

                <header className="lp-menuHeader">

                    <ul className="lp-menuItens">
                        <li><img src={profilePic} alt="" /></li>
                        <li onClick={()=>handleMenuCall(true)}><FontAwesomeIcon icon={faComment} /></li>
                        <li><FontAwesomeIcon icon={faUser} /></li>
                        <li onClick={handleLogout}>{'>'}</li>
                    </ul>

                    <div className="lp-menuSubHeader">

                        <input type="text" name="searchBox" className="lp-menuSearchBox" placeholder='Pesquisar' />

                        <div className="lp-menuSearchFilter">
                            <img src={filter}/>
                        </div>

                    </div>

                </header>

                <ul className="lp-contactList">

                    {/* <li className="lp-contactItem">
                        <div className="lp-contactProfilePic">
                            <img src={profilePic} alt="" />
                        </div>

                        <div className="lp-contactMessageWrapper">
                            <div className="lp-CMW-row">
                                <h1 className="lp-contactName">Usuário identificado</h1>
                                <h3 className="lp-contactLastMessageDate">19/09/2023</h3>
                            </div>
        
                            <h4 className="lp-contactLastMessage">Boa tarde, como está?</h4>
                        </div>


                    </li> */}
                    

                </ul>
            </div>

            <div className="lp-chatbox">
                <header className="lp-chatboxHeader" onClick={handleChannelInfo}>
                    <div className="lp-chatboxImage">
                        {/* <img src={profilePic} alt="" className="contactProfilePic" /> */}
                    </div>
                    
                    <div className="lp-chatboxInfo">
                        <h1 className="lp-chatboxTitle">Um grupo qualquer</h1>

                        <h4 className="lp-chatboxMemberList">Você, aquele, aquela, ele, ela</h4>
                    </div>
                </header>

                <div className="lp-chatboxContent">

                </div>
                
                <footer className="lp-chatboxFooter">
                    <label className='cbFileLabel' htmlFor="cbFile">+</label>
                    <input type="file" id='cbFile' name="cbFile" className="lp-chatboxSelectFile" />
                    <input onFocus={handleKeySubmit} type='text' className="lp-chatboxWriteMessage" placeholder='Digite uma mensagem...'/>
                    <div className="lp-chatboxSubmitButton" onClick={handleChatSubmit}>
                        <img src={send} alt="" />
                    </div>

                </footer>
                



            </div>


            <div className="lp-channelInfo">
                <header className="lp-ciHeader">
                    <h1 className='lp-ciHeaderExit' onClick={handleChannelInfo}>X</h1>
                    <h5 className="lp-ciHeaderTitle">Dados do canal</h5>
                </header>
                <div className="lp-ciContentWrapper">
                    <div className="lp-ciIdentity">
                        <div className="lp-ciImage"></div>
                        <h1 className="lp-ciTitle">Nome do Grupo</h1>
                        <h5 className="lp-ciUserCount">Grupo - 23 usuários</h5>
                    </div>

                    <div className="lp-ciUserList">
                        <div className="lp-ciAddUser">
                            <input type="text" placeholder='Adicionar novo usuário pelo nome' className="lp-ciNewUserInput" />
                            <div onClick={handleNewChannelUser} className="lp-ciAddUserImg" style={{backgroundImage:`url('${confirm}')`}}></div>
                        </div>
                        <ul className="lp-ciUsers">
                            {/* <li className="lp-ciUser">
                                <div className="lp-ciULimg"></div>
                                <div className="lp-ciULText">usuário</div>
                            </li> */}
                            

                        </ul>
                    </div>

                    <footer className="lp-ciFooter" onClick={handleChannelExit}>
                        <div className="lp-ciFooterLeave">
                            <img className='lp-ciLeaveIcon' src={logout} alt="" />
                            <h4 className="lp-ciLeaveText">Sair do canal</h4>
                        </div>
                    </footer>
                </div>
            </div>
            <div className="hiddenButton" onClick={()=>{handleHiddenButton(1000)}}>hidden button</div>

            <div className="hiddenButton" onClick={()=>{handleHiddenButton(10000)}}>hidden button</div>

            <div className="hiddenButton" onClick={()=>{handleHiddenButton(100000)}}>hidden button</div>


        </div>
    )

}


const wipeChannelList = ()=>{
    let channelList = document.getElementsByClassName('lp-contactList')[0];
    channelList.innerHTML='';
}









export default Home;