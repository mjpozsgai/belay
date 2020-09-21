//class to load login page/handle signup and signin
class Login extends React.Component{
    constructor(props) {
        // var new_url = "http://127.0.0.1:5000/signup"
        // window.history.pushState({"html": "index.html","pageTitle":"Belay"},"", new_url)
        super(props);
        this.state = {
        forgotPassword: false,
        signUp: true,
        signIn: false,
        loadHome: false,
        error: null,
        channel: null,
        user_info: this.props.user,
    };
     }

     //onclick to transition to signup page
    signUpPage() {
       this.setState({
           signUp : true,
           signIn : false,
           forgotPassword: false,
           error: null,
       });
    }

    componentDidMount(){
        if (this.props.load == true){
            this.verifyToken();
        }


    }

    verifyToken(){
            var myHeaders = new Headers();
            var token = localStorage.getItem("session_token")
            var channel = this.props.channel
            myHeaders.append("token", token)
            myHeaders.append("channel", channel)

            return fetch('http://127.0.0.1:5000/api/verify', {
                method: 'get',
                headers: myHeaders,
                }).then(response => response.json())
                    .then((response) => {
                    if (response.status === "ok"){
                        this.setState({
                            user_info: response.user,
                            channel: this.props.channel,
                            loadHome: true
                        })
                    }else{
                        this.setState({
                            error : response.error,
                        });
                        window.history.pushState({"html":"index.html","pageTitle":"Belay"}, "http://127.0.0.1:5000/")
                    }
                })
            .then()
                .catch((error) => {
           console.error(error);
        });


    }

    magic(){
            const email = document.getElementById("email_recover").value
            var myHeaders = new Headers();
            myHeaders.append('email', email);
            return fetch('http://127.0.0.1:5000/api/forgotpassword', {
                method: 'post',
                headers: myHeaders,
                }).then(response => response.json())
                    .then((response) => {
                    if (response.status === "ok"){
                        var e = document.getElementById("sign-up")

                        e.innerHTML = "An email has been sent. Check your inbox and follow the link to reset your password"

                    }else{
                        this.setState({
                            error : response.error,
                        });
                    }
                })
            .then()
                .catch((error) => {
           console.error(error);
        });

    }

    //onclick to transition to signin page
    signInPage(){
        this.setState({
            signUp : false,
            signIn : true,
            forgotPassword: false,
            error: null,
        });
        // var new_url = "http://127.0.0.1:5000/signin"
        // window.history.pushState({"html":"index.html","pageTitle":"Belay"},"", new_url)
    }

    //onclick to transition to forgot password page
    forgotPassword(){
        this.setState({
            forgotPassword : true,
            signIn: false,
            signUp: false,
            error: null,
        });
        // var new_url = "http://127.0.0.1:5000/forgotpassword"
        // window.history.pushState({"html":"index.html","pageTitle":"Belay"},"", new_url)
    }

    //onclick to transition to home page - happens when user presses "Login"
    //hits /api/signup for new users or /api/signin for existing users
    //if response is ok, sets LoadHome to true so homepage is loaded in render, redirects to login (with error) otherwise
    loadHome(){
        var Email = document.getElementById("email").value;
        var Password = document.getElementById("password").value;
        if (Email == ""){
            this.setState({
                error: "Email cannot be blank"
            })
            return;
        }
        if (Password == ""){
            this.setState({
                error: "Password cannot be blank"
            })
            return;
        }
        if (this.state.signUp === true) {
            //on signup page - make new user
            var Username = document.getElementById("username").value;
            if (Username == ""){
            this.setState({
                error: "Username cannot be blank"
            })
                return;
        }
            var myHeaders = new Headers();
            myHeaders.append('email', Email);
            myHeaders.append('password', Password);
            myHeaders.append('username', Username);
            return fetch('http://127.0.0.1:5000/api/signup', {
                method: 'post',
                headers: myHeaders,
            }).then(response => response.json())
                .then((response) => {
                    if (response.status === "ok") {
                        this.setState({
                            forgotPassword: false,
                            signIn: false,
                            signUp: false,
                            loadHome: true,
                            error: null,
                            user_info:response.user_info
                        });
                        localStorage.setItem('session_token', response.session_token);
                        var new_url = "http://127.0.0.1:5000/channels"
                        window.history.pushState({"html":"index.html","pageTitle":"Belay"},"", new_url)

                    } else {
                        this.setState({
                            error: response.error,
                        });
                    }
                })
                .then()
                .catch((error) => {
                    console.error(error);
                });
        }else{
            //on signin page - authenticate existing user
            var myHeaders = new Headers();
            myHeaders.append('email', Email);
            myHeaders.append('password', Password);
            return fetch('http://127.0.0.1:5000/api/signin', {
                method: 'post',
                headers: myHeaders,
                }).then(response => response.json())
                    .then((response) => {
                    if (response.status === "ok"){
                        localStorage.setItem('session_token', response.token);
                        this.setState({
                            forgotPassword : false,
                            signIn: false,
                            signUp: false,
                            loadHome: true,
                            error: null,
                            user_info: response.user_info,
                        });

                    }else{
                        this.setState({
                            error : response.error,
                        });
                    }
                })
            .then()
                .catch((error) => {
           console.error(error);
        });
        }
    }

    //renders login class
  render() {

        if (this.props.reset_p === true){
                return(
                     <Home user = {this.props.user} channel={null} reset_p = {true} />
                    )

        }
        //if error is present, display login and error message
        if (this.state.error != null){

            if (this.state.signIn == true){
                            return(
                <div id="LoginBody">
                    <div className="login-div">
                        <div className="login-header">
                            <h2>{this.state.error} - try again</h2>
                        </div>
                        <div className="login-body">
                            <div className="email-div">
                                <input id = "email" type="text"  placeholder="email"/>
                            </div>
                            <div className="password-div">
                                <input id = "password" type="text" placeholder="password"/>
                            </div>

                            <div className="login-button-div">
                                <input type="submit" onClick={() => this.loadHome()} value="Login" className="login_btn"/>
                            </div>
                        </div>
                        <div className="login-footer">
                            <div className="sign-up">
                                Don't have an account?  <button  onClick={() => this.signUpPage()}> Sign Up </button>
                            </div>
                            <div className="forgot-password">
                                <button onClick={() => this.forgotPassword()}> Forgot your password? </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            else{
                return (
                <div id="LoginBody">
                    <div className="login-div">
                        <div className="login-header">
                            <h2>{this.state.error} - try again</h2>
                        </div>
                        <div className="login-body">
                            <div className="email-div">
                                <input id = "email" type="text"  placeholder="email address"/>
                            </div>
                            <div className="username-div">
                                <input id = "username" type="text"  placeholder="username"/>
                            </div>
                            <div className="password-div">
                                <input id = "password" type="text" placeholder="password"/>
                            </div>

                            <div className="login-button-div">
                                <input type="submit" onClick={() => this.loadHome()} value="Login" className="login_btn"/>
                            </div>
                        </div>
                        <div className="login-footer">
                            <div className="sign-up">
                                Already have an account?  <button className="form_button" onClick={() => this.signInPage()}> Sign In </button>
                            </div>
                        </div>
                    </div>
                </div>
            );

                }


        }

        //Properly authenticated, load message homepage
        else if (this.state.loadHome === true){
            return(<Home user = {this.state.user_info} channel = {this.state.channel} reset_p = {false} />)

        }
        //sign in page
        else if (this.state.signIn === true){
            return(
                <div id="LoginBody">
                    <div className="login-div">
                        <div className="login-header">
                            <h2>Sign In</h2>
                        </div>
                        <div className="login-body">
                            <div className="email-div">
                                <input id = "email" type="text"  placeholder="email"/>
                            </div>
                            <div className="password-div">
                                <input id = "password" type="text" placeholder="password"/>
                            </div>

                            <div className="login-button-div">
                                <input type="submit" onClick={() => this.loadHome()} value="Login" className="login_btn"/>
                            </div>
                        </div>
                        <div className="login-footer">
                            <div className="sign-up">
                                Don't have an account?  <button  onClick={() => this.signUpPage()}> Sign Up </button>
                            </div>
                            <div className="forgot-password">
                                <button onClick={() => this.forgotPassword()}> Forgot your password? </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        //user forgot password
        else if (this.state.forgotPassword === true){
            return (
                <div id="LoginBody">
                    <div className="login-div">
                        <div className="login-header">
                            <h2>Enter Email</h2>
                        </div>
                        <div className="login-body">
                            <div className="email-div">
                                <input id = "email_recover" type="text"  placeholder="email address"/>
                            </div>
                            <div className="login-button-div">
                                <input onClick = {() => this.magic()}type="submit" value="Submit" className="login_btn"/>
                            </div>
                        </div>
                        <div className="login-footer">
                            <div id="sign-up">
                                We'll send a link to your email to reset your password
                            </div>
                            <br/><br/>
                            <div className="sign-up">
                                Don't have an account?  <button  onClick={() => this.signUpPage()}> Sign Up </button>
                            </div>
                            <div className="sign-up">
                                Remember your password? <button onClick={() => this.signInPage()}> Sign In </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        //signup page (default - signup is true upon construction)
        else{
            return (
                <div id="LoginBody">
                    <div className="login-div">
                        <div className="login-header">
                            <h2>Sign Up</h2>
                        </div>
                        <div className="login-body">
                            <div className="email-div">
                                <input id = "email" type="text"  placeholder="email address"/>
                            </div>
                            <div className="username-div">
                                <input id = "username" type="text"  placeholder="username"/>
                            </div>
                            <div className="password-div">
                                <input id = "password" type="text" placeholder="password"/>
                            </div>

                            <div className="login-button-div">
                                <input type="submit" onClick={() => this.loadHome()} value="Login" className="login_btn"/>
                            </div>
                        </div>
                        <div className="login-footer">
                            <div className="sign-up">
                                Already have an account?  <button className="form_button" onClick={() => this.signInPage()}> Sign In </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
  }

}

//class to load messages/channels in homepage
class Home extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            user_info: this.props.user,
            currentChannel: this.props.channel,
            currentThread: null,
            channels: null,
            messages: null,
            mypost: false,
            firstLoad: true,
            t_scroll: false,
            new_messages: 0,
            seeNew: false,
            thread_info: null,
            threaded_messages: null,
            settings: null,
            deleteChannel: false,
            error: null,
            createChannel: false,
            reset_p: this.props.reset_p,
            curr_num: 0
        };
        this.getChannels();
    }
    makeChannel(){
        this.setState({
            currentChannel: null,
            createChannel: true
        })
    }

    componentDidMount() {
        this.getChannels()
        this.getMessages()
        const interval = setInterval(this.getMessages, 100);
        const i = setInterval(this.getChannels, 500);

        if (this.state.t_scroll == true){
            this.scrollToBottomT();
            this.setState({
                t_scroll: false
            })
        }
        if (this.state.seeNew == true){
            this.scrollToBottom();
            this.setState({
                seeNew: false
            })
        }
    }

    getChannels = () => {
        if (this.state != undefined) {
            var myHeaders = new Headers();
            myHeaders.append("user", this.state.user_info);
             myHeaders.append("token", localStorage.getItem("session_token"))
            return fetch('http://127.0.0.1:5000/api/channels', {
                method: 'get',
                headers: myHeaders,
            }).then(response => response.json())
                .then((response) => {
                    this.setState({
                        channels: response.channels,
                    });
                })
                .then()
                .catch((error) => {
                    console.error(error);
                });
        }
    }


    seeChannels(){
        this.setState({
                settings: false,
                deleteChannel: false
            });
        this.closeThread()
        if (document.getElementById("channels")!=null && document.getElementById("messages")!=null) {

            var messages = document.getElementById("messages")
            messages.style.display = "none";
            var channels = document.getElementById("channels")
            channels.style.display = "flex";


        }

    }

    seeMessages(){
        this.setState({
                settings: false,
                deleteChannel: false
            })

        this.closeThread()
        if (document.getElementById("channels")!=null && document.getElementById("messages")!=null){
            var channels = document.getElementById("channels")
            channels.style.display="none";
            var messages = document.getElementById("messages")
            messages.style.display ="flex";

        }

    }

    seeThreads(){
        if (document.getElementById("channels")!=null && document.getElementById("messages")!=null){
            var channels = document.getElementById("channels")
            channels.style.display="none";
            var messages = document.getElementById("messages")
            messages.style.display ="none";

        }

    }

    seeNew(){
        this.setState({
            seeNew: true,
        })
        var myHeaders = new Headers();
        myHeaders.append("channel", this.state.currentChannel);
        myHeaders.append("user", this.props.user)
        myHeaders.append("token", localStorage.getItem("session_token"))
        return fetch('http://127.0.0.1:5000/api/new_messages', {
            method: 'post',
            headers: myHeaders,
        }).then(response => response.json())
                .then((response) =>{
            this.setState({
                new_messages:0,
                seeNew: true,
                myPost:true,
                firstLoad: true,
                messages: response.messages,
                threaded_messages: response.replies
            })

        }).then(() =>{
             this.scrollToBottom();
            }
            )
            .then()
            .catch((error) => {
                console.error(error);
            });

    }
    accountSettings(){
        this.setState({
            deleteChannel: false,
            settings: true,
        });


    }
    deleteChannel(){
        this.setState({
            settings: true,
            deleteChannel: true,
        });

    }

    exitSettings(){
        this.setState({
            settings: false,
            deleteChannel: false
        });

    }

    saveChanges(){
       var username = document.getElementById("new_username").value;
       var email = document.getElementById("new_email").value;
        var myHeaders = new Headers();
        myHeaders.append('new_email', email);
        myHeaders.append('new_username', username);
        myHeaders.append('user_info', this.props.user)
        myHeaders.append('token', localStorage.getItem('session_token'));
        return fetch('http://127.0.0.1:5000/api/change', {
            method: 'post',
            headers: myHeaders,
        }).then(response => response.json())
            .then((response) => {
                if (response.status === "ok") {
                    this.setState({
                        user_info:response.user_info,
                        settings: false
                    });

                } if (response.status == "no update"){
                    this.setState({
                        settings: false,
                        deleteChannel: false
                    });
                }

                else {
                    this.setState({
                        error: response.error,
                    });
                }
            })
            .then()
            .catch((error) => {
                console.error(error);
            });
}

    executeDelete(channel){
        var myHeaders = new Headers();
        myHeaders.append('user_info', this.props.user)
        myHeaders.append('token', localStorage.getItem('session_token'));
        myHeaders.append("channel", channel)
        return fetch('http://127.0.0.1:5000/api/delete', {
            method: 'post',
            headers: myHeaders,
        }).then(response => response.json())
            .then((response) => {
                if (response.status === "ok") {
                    this.setState({
                        settings: false,
                        deleteChannel: false
                    });
                }
                else {
                    this.setState({
                        error: response.error,
                    });
                }
            })
            .then()
            .catch((error) => {
                console.error(error);
            });
}

    scrollToBottom(){
        if (this.state.currentChannel != null){
            const list = document.getElementById("message_list");
            list.scrollTop = (list.scrollHeight - list.offsetHeight);
        }

    }

    scrollToBottomT(){
        if (this.state.currentChannel != null){
            const list = document.getElementById("message_list_t");
            list.scrollTop = list.scrollHeight;
        }

    }



    startThread(item){
        var new_url = "http://127.0.0.1:5000/channel/".concat(this.state.currentChannel).concat("/thread=").concat(item.message_num)
        window.history.pushState({"html": "index.html","pageTitle":"Belay"},"", new_url)
        this.setState({
            currentThread : item.message_num,
            thread_info: [item.message_num, item.posted, item.author_name, item.message_body, item.image]
        });

        if (screen.width < 768){
            this.seeThreads();
        }

    }

    closeThread(){
        var new_url = "http://127.0.0.1:5000/channel/".concat(this.state.currentChannel)
        window.history.pushState({"html": "index.html","pageTitle":"Belay"},"", new_url)
        this.setState({
            currentThread : null,
        });
    }

    getMessages = () =>{
        if (this.state.channels == undefined) {
            return this.getChannels();
        }
        if (this.state.messages !== undefined) {
            if (this.state.currentChannel != null) {
                if (Object.keys(this.state.channels).length === 0){
                    this.setState({
                            messages: {},
                        });
                    return;
                }
                if (this.state.channels[this.state.currentChannel] == undefined){
                    this.setState({
                            messages: {},
                        });
                    return;
                }
                var myHeaders = new Headers();
                myHeaders.append("channel", this.state.currentChannel);
                myHeaders.append("message_id", this.state.currentThread)
                myHeaders.append("user", this.state.user_info)
                myHeaders.append("token", localStorage.getItem("session_token"))
                myHeaders.append("unread", this.state.channels[this.state.currentChannel].num_unread)
                var u = this.state.channels[this.state.currentChannel].num_unread;
                this.setState
                return fetch('http://127.0.0.1:5000/api/messages', {
                    method: 'get',
                    headers: myHeaders,
                }).then(response => response.json())
                    .then((response) => {
                        this.setState({
                            messages: response.messages,
                            threaded_messages: response.replies,
                        });
                        if (this.state.mypost){
                            this.scrollToBottom();
                            this.seeNew();
                            this.setState({
                            mypost: false,
                            });
                        }
                        if (this.state.firstLoad){
                            this.scrollToBottom();
                             this.setState({
                            firstLoad: false,
                            });
                        }


                    }).then(() =>{
                        if (this.state.seeNew){
                            this.scrollToBottom();
                            this.setState({
                            seeNew: false,
                            });
                        }
                    })
                    .then()

                    .catch((error) => {
                        console.error(error);
                    });
            }
        }
    }
    exitCreate(){
        this.setState({
            createChannel:false
        })
    }

    changePassword(){
         var new_p = document.getElementById("new_p").value
        var myHeaders = new Headers();
        if (new_p == ""){

            this.setState({
                error: "Password name cannot be blank"
            })
            return;
        }
        myHeaders.append("user_info", this.props.user)
        myHeaders.append("new_p", new_p)
        return fetch('http://127.0.0.1:5000/api/updatepassword', {
            method: 'post',
            headers: myHeaders,
        }).then(response => response.json())
            .then((response) => {
                this.setState({
                    user_info: response.user,
                    currentChannel: null,
                    reset_p: false
                })

            })
            .then()
            .catch((error) => {
                console.error(error);
            });
    }

    m_enter = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            this.scrollToBottom();
            var myHeaders = new Headers();

            const body = document.getElementById("textarea_m").value
            myHeaders.append("channel", this.state.currentChannel);
            myHeaders.append("user", this.state.user_info);
            myHeaders.append("message", body)
            myHeaders.append("message_id", this.state.currentThread)
            myHeaders.append("inThread", "false")
             myHeaders.append("token", localStorage.getItem("session_token"))
            return fetch('http://127.0.0.1:5000/api/messages', {
                method: 'post',
                headers: myHeaders,
            }).then(response => response.json())
                .then(() => {
                    this.setState({
                        mypost:true
                    })
                    this.seeNew();
                    document.getElementById("textarea_m").value = ''
                })
                .then()
                .catch((error) => {
                    console.error(error);
                });
        }
    }


    t_enter = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            this.scrollToBottomT();

            const body = document.getElementById("textarea_t").value
            var myHeaders = new Headers();

            myHeaders.append("channel", this.state.currentChannel);
            myHeaders.append("user", this.state.user_info);
            myHeaders.append("message", body)
            myHeaders.append("message_id", this.state.currentThread)

            myHeaders.append("token", localStorage.getItem("session_token"))
            return fetch('http://127.0.0.1:5000/api/messages', {
                method: 'post',
                headers: myHeaders,
            }).then(response => response.json())
                .then(() => {

                    this.setState({
                        t_scroll: true
                    })
                    this.scrollToBottomT();
                    document.getElementById("textarea_t").value = ''
                })
                .then()
                .catch((error) => {
                    console.error(error);
                });
        }
    }

    error_f(error_code){
        this.setState({
            error: error_code
        })
    }


    updateChannel(newChannel){
        var new_url = "http://127.0.0.1:5000/channel/".concat(newChannel)
        window.history.pushState({"html": "index.html","pageTitle":"Belay"},"", new_url)
        this.setState({
            currentChannel : newChannel,
            firstLoad: true,
            createChannel: false,
            currentThread: null
        });
        if (screen.width < 768){
            this.seeMessages();
        }
    }

  render() {
    //EDIT ERROR HANDLING --------------------------------------------------------
          //EDIT ERROR HANDLING --------------------------------------------------------

          //EDIT ERROR HANDLING --------------------------------------------------------

          //EDIT ERROR HANDLING --------------------------------------------------------

          //EDIT ERROR HANDLING --------------------------------------------------------

            if (this.state.error != null && this.state.settings == true){
                return (
              <div id= "settings">
            <Navbar seeChannels = {this.seeChannels.bind(this)}
                seeMessages = {this.seeMessages.bind(this)} />

                  <Settings
                        delete = {this.state.deleteChannel}
                        error = {this.state.error}
                        user = {this.state.user_info}
                        channel = {this.state.currentChannel}
                        allChannels = {this.state.channels}
                        exitSettings = {this.exitSettings.bind(this)}
                        saveChanges = {this.saveChanges.bind(this)}
                        executeDelete = {this.executeDelete.bind(this)}/>

              </div>
          );

            }


          if (this.state.reset_p === true){

            return(
            <div id = "Home_channels_only">
            <div id="channel_create">
                <div id="channel_head">
                    <h2>Hi {this.props.user[2]}</h2>
                    <h4>Enter a new password below</h4>
                </div>
                <div id="new_password">
                    <input id = "new_p" type="text" placeholder="enter password"></input>
                    <button onClick = {()=> this.changePassword()}> Submit</button>
                </div>

            </div>
        </div>
        );

        }



      if (this.state.settings === true){
                    return (
              <div id= "settings">
            <Navbar seeChannels = {this.seeChannels.bind(this)}
                seeMessages = {this.seeMessages.bind(this)} />

                  <Settings
                        delete = {this.state.deleteChannel}
                        user = {this.state.user_info}
                        error = {this.state.error}
                        channel = {this.state.currentChannel}
                        allChannels = {this.state.channels}
                        exitSettings = {this.exitSettings.bind(this)}
                        saveChanges = {this.saveChanges.bind(this)}
                        executeDelete = {this.executeDelete.bind(this)}/>

              </div>
          );
      }

      if (this.state.currentChannel === null) {
          return (
              <div id="Home_channels_only">
                  <Channels updateChannel = {this.updateChannel.bind(this)} user = {this.state.user_info}
                            channel = {this.state.currentChannel} allChannels = {this.state.channels}
                            accountSettings = {this.accountSettings.bind(this)}
                            makeChannel = {this.makeChannel.bind(this)}
                            createChannel = {this.state.createChannel}
                            exitCreate = {this.exitCreate.bind(this)}
                             error = {this.error_f.bind(this)}/>
              </div>
          )
      }
      else if (this.state.currentThread != null ){
          return (

              <div id="Home_threads">
                  <Navbar seeChannels = {this.seeChannels.bind(this)}
                            seeMessages = {this.seeMessages.bind(this)} />

                  <Channels updateChannel = {this.updateChannel.bind(this)}
                            user = {this.state.user_info}
                            channel = {this.state.currentChannel}
                            allChannels = {this.state.channels}
                            makeChannel = {this.makeChannel.bind(this)}
                            exitCreate = {this.exitCreate.bind(this)}
                            accountSettings = {this.accountSettings.bind(this)}
                            error = {this.error_f.bind(this)}/>
                  <Messages user = {this.state.user_info}
                            channel = {this.state.currentChannel}
                            startThread = {this.startThread.bind(this)}
                            allChannels = {this.state.channels}
                            messages = {this.state.messages}
                            scroll = {this.scrollToBottom.bind(this)}
                            m_enter = {this.m_enter.bind(this)}
                            seeNew = {this.seeNew.bind(this)}
                            threaded_messages = {this.state.threaded_messages}
                            thread = {this.state.currentThread}
                            deleteChannel = {this.deleteChannel.bind(this)}/>
                  <Threads thread = {this.state.currentThread}
                           channel = {this.state.currentChannel}
                           seeThreads = {this.seeThreads.bind(this)}
                           user = {this.state.user_info}
                           t_enter = {this.t_enter.bind(this)}
                            scroll = {this.scrollToBottomT.bind(this)}
                           closeThread = {this.closeThread.bind(this)}
                           threaded_messages = {this.state.threaded_messages}
                           thread_info = {this.state.thread_info}/>
              </div>
              )
      }
      else {
          return (

              <div id="Home">
                  <Navbar seeChannels = {this.seeChannels.bind(this)}
                seeMessages = {this.seeMessages.bind(this)} />

                  <Channels
                            updateChannel = {this.updateChannel.bind(this)}
                            user = {this.state.user_info}
                            channel = {this.state.currentChannel}
                            allChannels = {this.state.channels}
                            exitCreate = {this.exitCreate.bind(this)}
                            makeChannel = {this.makeChannel.bind(this)}
                            accountSettings = {this.accountSettings.bind(this)}
                            error = {this.error_f.bind(this)}/>
                  <Messages
                            deleteChannel = {this.deleteChannel.bind(this)}
                            user = {this.state.user_info}
                            channel = {this.state.currentChannel}
                            scroll = {this.scrollToBottom.bind(this)}
                            startThread = {this.startThread.bind(this)}
                            allChannels = {this.state.channels}
                            messages = {this.state.messages}
                            seeNew = {this.seeNew.bind(this)}
                            m_enter = {this.m_enter.bind(this)}
                            threaded_messages = {this.state.threaded_messages}
                            thread = {this.state.currentThread}/>

              </div>
          );
      }
  }

}

//--------------------------CHANNELS-----------------------------------------CHANNELS-----------------------------------
//class to display available channels/add a channel
class Channels extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            user: this.props.user,
            channels: this.props.allChannels,
            error: null
        };
    }

    makeChannel(){
        this.props.makeChannel();
    }

    createChannel = () => {
        var channel_name = document.getElementById("channel_n").value
        var myHeaders = new Headers();
        if (channel_name == ""){
            this.setState({
                error: "Channel name cannot be blank"
            })
            return;
        }
        myHeaders.append("channel", channel_name);
        myHeaders.append("user", this.props.user)
        myHeaders.append("token", localStorage.getItem("session_token"))
        return fetch('http://127.0.0.1:5000/api/channels', {
            method: 'post',
            headers: myHeaders,
        }).then(response => response.json())
            .then((response) => {
                if (response.status == "ok"){
                    this.setState({
                    error: null
                })
                this.props.updateChannel(channel_name);

                }else{
                    this.setState({
                            error: response.error,
                        });
                }
            })
            .then()
            .catch((error) => {
                console.error(error);
            });
    }

    //onclick function when a new channel is selected
    newChannel(e) {
        var new_url = "http://127.0.0.1:5000/channel/".concat(e)
        window.history.pushState({"html": "index.html","pageTitle":"Belay"},"", new_url)
        this.props.updateChannel(e)
    }



    render() {

        if (this.state.error != null){

           // if (this.state.createChannel === true){
                    return(
                        <div id = "Home_channels_only">
                        <div id="channel_create">
                            <div id="channel_head">
                                <h2>{this.state.error} - try again</h2>
                                <h4>Channels are where your team communicates.
                                    They’re best when organized around a topic — #marketing, for example.</h4>

                                <h5>Channel names consist of letters, numbers, and underscores - no spaces,
                                and no punctuation</h5>
                            </div>
                            <div id="channel_name">
                                <input id = "channel_n" type="text" placeholder="enter channel name"></input>
                                <button onClick = {()=> this.createChannel()}> Create Channel</button>
                                <button onClick = {()=> this.props.exitCreate()}> Exit</button>

                            </div>

                        </div>
                    </div>
                    );
               // }

        }

            if (this.props.allChannels != null) {
                var arr = [];
                Object.keys(this.props.allChannels).forEach(function (key) {
                    arr.push(key);

                });

                if (this.props.createChannel === true){
                    return(
                        <div id="channel_create">
                            <div id="channel_head">
                                <h1>Create a Channel</h1>
                                <h4>Channels are where your team communicates.
                                    They’re best when organized around a topic — #marketing, for example.</h4>
                            </div>
                            <div id="channel_name">
                                <input id = "channel_n" type="text" placeholder="enter channel name"></input>
                                <button onClick = {()=> this.createChannel()}> Create Channel</button>
                                <button onClick = {()=> this.props.exitCreate()}> Exit</button>
                            </div>

                        </div>
                    )
                }
                else if (this.props.channel === null) {
                    return (
                        <div id="channel_browse">
                            <div id="channel_head">
                                <h1>Browse Channels</h1>
                                <button onClick = {()=> this.makeChannel()}> Create Channel</button>
                            </div>

                            <div id="channel_list">
                                {arr.map(item => <div key={item} id="list_item" onClick={() => this.newChannel(item)}>
                                        <div id="title">#{item}</div>
                                        <div id="creator">
                                            Channel was created
                                            by {this.props.allChannels[item]["creator_name"]} on {this.props.allChannels[item]["created"]}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                } else {

                    return (
                        <div id="channels">
                            <div id="channel_header">
                                <h1 id="curr_channel">Welcome to Belay!</h1>
                                <h3 onClick = {() => this.props.accountSettings()}> <span id="dot"></span>{this.state.user[1]} <i  className="fa">&#xf013;</i></h3>
                                <span className="tooltiptext">Account settings</span>

                                <br></br><br></br>
                                <h2>Browse Channels</h2>
                            </div>
                            <div id="channel_list">
                                {arr.map(item => <div key={item} id="list_item" onClick={() => this.newChannel(item)}>{
                                    }

                                    <div id="title"># {item}
                                        { (this.props.allChannels[item]["num_unread"] !== 0) && <span id = "unread" > {this.props.allChannels[item]["num_unread"]} </span>} </div>
                                    </div>
                                )}
                            </div>
                            <div id="channel_footer"   >
                                <button onClick = {()=> this.makeChannel()}> + Create a Channel </button>
                            </div>
                        </div>

                    )}
            } else {
                return (
                    <div>
                    </div>)
            }
        }
}

//class to display messages - optionally thread to messages
//-----------------------------MESSAGE-------------------------------------------MESSAGES------------------------------
class Messages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: this.props.messages,
            user: this.props.user,
            new_messages: 0, //this.props.allChannels[this.props.channel].num_unread,
            mypost:false,
            new: false,

            firstLoad: true
        };
    }

    componentDidMount(){

        this.props.scroll();

    }
    seeNew(){
        this.setState({
            new: true
        })
        this.props.seeNew();
    }



    startThread(e){
        this.props.startThread(e);
    }
    // checkImg(url) {
    //     return(url.match(/.(jpeg|jpg|gif|png)/) != null);
    // }

  render() {
        if (this.props === null || this.props === undefined ){
             return (          <div id="messages">
              <div id="messages_head">
                   <div id="title">No channel Selected <i  className="fa" onClick={this.props.deleteChannel} id = "message">&#xf013;</i>
                  <span className="tooltiptext_message">Channel Settings</span></div>

              </div>
              <div id="message_list">

              </div>
              <div id="messages-footer">
                <textarea id="textarea_m" placeholder={"no channel selected"}>

                </textarea>
                          </div>
          </div>)
        }
        if (this.props.allChannels === null){
             return (
                 <div id="messages">
              <div id="messages_head">
                   <div id="title">No channel Selected <i  className="fa" onClick={this.props.deleteChannel} id = "message">&#xf013;</i>
                  <span className="tooltiptext_message">Channel Settings</span></div>

              </div>
              <div id="message_list">

              </div>
              <div id="messages-footer">
                <textarea id="textarea_m" placeholder={"no channel selected"}>

                </textarea>
                          </div>
          </div>)
        }

          if (Object.keys(this.props.allChannels).length === 0){

              return (
                  <div id="messages">
              <div id="messages_head">
                   <div id="title">No channel Selected <i  className="fa" onClick={this.props.deleteChannel} id = "message">&#xf013;</i>
                  <span className="tooltiptext_message">Channel Settings</span></div>

              </div>
              <div id="message_list">

              </div>
              <div id="messages-footer">
                <textarea id="textarea_m" placeholder={"no channel selected"}>

                </textarea>
                          </div>
          </div>
              )
          }
          if (this.props.channel=== undefined){
              return (          <div id="messages">
              <div id="messages_head">
                   <div id="title">No channel Selected <i  className="fa" onClick={this.props.deleteChannel} id = "message">&#xf013;</i>
                  <span className="tooltiptext_message">Channel Settings</span></div>

              </div>
              <div id="message_list">

              </div>
              <div id="messages-footer">
                <textarea id="textarea_m" placeholder={"no channel selected"}>

                </textarea>
                          </div>
          </div>)
          }
          if(this.props.allChannels[this.props.channel] === undefined){
                  return (   <div id="messages">
                  <div id="messages_head">
                       <div id="title">No channel Selected <i  className="fa" onClick={this.props.deleteChannel} id = "message">&#xf013;</i>
                      <span className="tooltiptext_message">Channel Settings</span></div>

                  </div>
                  <div id="message_list">

                  </div>
                  <div id="messages-footer">
                    <textarea id="textarea_m" placeholder={"no channel selected"}>

                    </textarea>
                              </div>
              </div>
              )
          }
          if (this.props.messages != null) {
              if (Object.keys(this.props.messages).length >0) {

                  const arr = [];
                  const curr_messages = this.props.messages;
                  Object.values(curr_messages).forEach(function (key) {
                      arr.push(key);
                  });

                  if (this.props.allChannels[this.props.channel].num_unread > 0) {
                      return(
                          <div id="messages">
                              <div id="messages_head">
                                  <div id="title">#{this.props.channel} <i onClick={this.props.deleteChannel} className="fa" id = "message">&#xf013;</i>
                                  <span className="tooltiptext_message">Channel Settings</span></div>
                                        <div id="creator">
                                            Channel was created
                                            by {this.props.allChannels[this.props.channel]["creator_name"]} on {this.props.allChannels[this.props.channel]["created"]}
                                        </div>

                              </div>
                              <div id="message_list">
                                  {arr.map(item => <div key={item.message_num} id="list_item">
                                          <div id="message_info">
                                              <div id="author">{item.author_name}</div>
                                              <div id="time">{item.posted} </div>
                                          </div>
                                          <div id="message_body"> {item.message_body } </div>
                                      {item.image.length>0 &&
                                      item.image.map(item => <img src = {item}></img>)
                                      }

                                      <div id = {"view_thread" + this.props.threaded_messages[item.message_num] }></div>
                                      <div id = "start_thread"> Start Thread</div>
                                      </div>
                                  )}
                              </div>
                              <div id="new_messages" onClick={() => this.props.seeNew()}> See {this.props.allChannels[this.props.channel].num_unread} new messages </div>

                              <div id="messages-footer">
                    <textarea onKeyDown={this.props.m_enter} id="textarea_m" placeholder={"message " + this.props.channel}>

                    </textarea>
                              </div>

                          </div>)

                  } else {
                      return (
                          <div id="messages">
                              <div id="messages_head">
                                   <div id="title">#{this.props.channel} <i onClick={this.props.deleteChannel} className="fa"  id = "message">&#xf013;</i>
                                  <span className="tooltiptext_message">Channel Settings</span></div>
                                        <div id="creator">
                                            Channel was created
                                            by {this.props.allChannels[this.props.channel]["creator_name"]} on {this.props.allChannels[this.props.channel]["created"]}
                                        </div>

                              </div>

                              <div id="message_list">

                                  {arr.map(item => <div key={item.message_num} id="list_item">

                                          <div id="message_info">
                                              <div id="author">{item.author_name}</div>
                                              <div id="time">{item.posted} </div>
                                              {this.props.threaded_messages[item.message_num] === undefined &&
                                                  <div id = "start_thread" onClick={() => this.startThread(item)} > Start a thread</div>
                                              }

                                          </div>
                                          <div id="message_body"> {item.message_body} </div>
                                      {item.image.length>0 &&
                                      item.image.map(item => <img id ="in_message" src = {item}></img>)
                                      }

                                      {this.props.threaded_messages[item.message_num] !== undefined &&
                                          <div onClick={() => this.startThread(item)} id = "view_thread"> {this.props.threaded_messages[item.message_num].length}
                                          {(this.props.threaded_messages[item.message_num].length ===1)? ' reply': ' replies' }
                                              <span id = "view"> View thread</span>
                                          <span id = "arrow"> ></span>
                                          </div>

                                      }
                                      </div>
                                  )}
                              </div>
                              <div id="messages-footer">
                    <textarea onKeyDown={this.props.m_enter} id="textarea_m" placeholder={"message " + this.props.channel}>

                    </textarea>
                              </div>

                          </div>
                      );
                  }
              }else {

                  if (this.props.allChannels[this.props.channel].num_unread > 0) {
                      return(
                          <div id="messages">
                              <div id="messages_head">
                                  <div id="title">#{this.props.channel} <i onClick={this.props.deleteChannel}  className="fa"  id = "message">&#xf013;</i>
                                  <span className="tooltiptext_message"> Channel Settings</span></div>
                                        <div id="creator">
                                            Channel was created
                                            by {this.props.allChannels[this.props.channel]["creator_name"]} on {this.props.allChannels[this.props.channel]["created"]}
                                        </div>

                              </div>

                              <div id="message_list">

                              </div>

                              <div id="new_messages" onClick={() => this.props.seeNew()}> See {this.props.allChannels[this.props.channel].num_unread} new messages </div>

                              <div id="messages-footer">
                    <textarea onKeyDown={this.props.m_enter} id="textarea_m" placeholder={"message " + this.props.channel}>

                    </textarea>
                              </div>

                          </div>)

                  } else
                  {
                      return (

                          <div id="messages">
                              <div id="messages_head">
                                   <div id="title">#{this.props.channel} <i  className="fa" onClick={this.props.deleteChannel} id = "message">&#xf013;</i>
                                  <span className="tooltiptext_message">Channel Settings</span></div>
                                        <div id="creator">
                                            Channel was created
                                            by {this.props.allChannels[this.props.channel]["creator_name"]} on {this.props.allChannels[this.props.channel]["created"]}
                                        </div>
                              </div>
                              <div id="message_list">

                              </div>
                              <div id="messages-footer">
                    <textarea onKeyDown={this.props.m_enter} id="textarea_m" placeholder={"message " + this.props.channel}>

                    </textarea>
                              </div>
                          </div>
                      );
                  }
          }
      }else{
        return (

          <div id="messages">
              <div id="messages_head">
                   <div id="title">No channel Selected <i  className="fa" onClick={this.props.deleteChannel} id = "message">&#xf013;</i>
                  <span className="tooltiptext_message">Channel Settings</span></div>

              </div>
              <div id="message_list">

              </div>
              <div id="messages-footer">
                <textarea id="textarea_m" placeholder={"no channel selected"}>

                </textarea>
                          </div>
          </div>
      );

      }
  }

}

//class to display threaded messages (if thread is not null)
//----------------------------THREADS-----------------------------------------THREADS-----------------------------------
class Threads extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            threaded_messages: this.props.threaded_messages,
            user: this.props.user,
            message_id: this.props.thread
        };
    }


  render() {
     const arr = [];
      const curr_messages = this.props.threaded_messages[this.props.thread];
      if (curr_messages === undefined){
              return (
         <div id="threads">
                  <div id="messages_head">
                      <span id = "thread_title">
                      <h1> Thread </h1> <h6> #{this.props.channel}</h6>
                      </span>
                      <button onClick = {this.props.closeThread} id = "close"> X</button>
                  </div>
                  <div id="message_list_t">
                   <div id="list_item1">
                      <div id="message">
                              <div id="author">{this.props.thread_info[2]}</div>
                              <div id="time">{this.props.thread_info[1]} </div>
                          </div>
                      <div id="message_body"> {this.props.thread_info[3]} </div>
                       {this.props.thread_info[4].length>0 &&
                    this.props.thread_info[4].map(item => <img id ="in_message" src = {item}></img>)  }

                  </div>

                  </div>
                  <div id="messages-footer">
        <textarea onKeyDown={this.props.t_enter} id="textarea_t" placeholder={"message " + this.props.channel}>

        </textarea>
                  </div>

              </div>
    );

      }
      else{
      Object.values(curr_messages).forEach(function (key) {
          arr.push(key);

      });
           return (
         <div id="threads">
              <div id="messages_head">
                  <span id = "thread_title">
                  <h1> Thread </h1> <h6> #{this.props.channel}</h6>
                  </span>
                  <button onClick = {this.props.closeThread} id = "close"> X</button>
              </div>
              <div id="message_list_t">
                  <div id="list_item1">
                      <div id="message_info">
                              <div id="author">{this.props.thread_info[2]}</div>
                              <div id="time">{this.props.thread_info[1]} </div>
                          </div>
                      <div id="message_body"> {this.props.thread_info[3]} </div>
                       {this.props.thread_info[4].length>0 &&
                    this.props.thread_info[4].map(item => <img id ="in_message" src = {item}></img>)  }

                  </div>
                  {arr.map(item => <div key={item.message_num} id="list_item">
                          <div id="message_info">
                              <div id="author">{item.author_name}</div>
                              <div id="time">{item.posted} </div>
                          </div>
                          <div id="message_body"> {item.message_body} </div>
                      {item.image.length>0 &&
                    item.image.map(item => <img id ="in_message" src = {item}></img>)  }

                      </div>
                  )}
              </div>
                  <div id="messages-footer">
        <textarea onKeyDown={this.props.t_enter} id="textarea_t" placeholder={"message " + this.props.channel}>
        </textarea>
                  </div>
              </div>
        );
      }
  }
}

class Settings extends React.Component {

     constructor(props){
        super(props);

    }

    render() {
         if (this.props.error != null){
        return (
             <div id="edit">
                <div id="channel_head">
                    <h1>{this.props.error} - Try again</h1>
                </div>
                <h5>Username</h5>
                <div id="search">
                    <input id ="new_username" type="text" placeholder={this.props.user[1]}></input>
                </div>
                 <h5>Email Address</h5>
                <div id="search">

                    <input id ="new_email" type="text" placeholder={this.props.user[2]}></input>
                </div>
                <button id ="save" onClick = {this.props.saveChanges}> Save Changes</button>
                <button id="cancel" onClick = {this.props.exitSettings}> Cancel </button>
            </div>
        );

    }

         if (this.props.delete === true){
             var arr = [];
             var arr2 = [];
                Object.keys(this.props.allChannels).forEach(function (key) {
                     arr.push(key);
                });
                var i =0;
                while (i < Object.keys(this.props.allChannels).length){

                    if (this.props.allChannels[arr[i]]["creator_id"] === this.props.user[0]){

                        arr2.push(arr[i]);
                    }
                    i++;
                }

             return (
                <div id="edit">
                    <div id="channel_head">
                        <h1>Channel Settings</h1>
                        <h4>You can only delete channels you created - channels you have created
                        are listed below. Simply click on the channel name to delete the channel and all of its messages</h4>
                    </div>
                <div id="channel_list">
                {arr2.map(item => <div key={item} id="list_item" onClick={() => this.props.executeDelete(item)}>
                                        <div id="title">#{item}</div>

                                    </div>
                                )}
                </div>
                         <button id="cancel" onClick = {this.props.exitSettings}> Exit Settings </button>
            </div>
        );

         }
         else{
             return (
            <div id="edit">
                <div id="channel_head">
                    <h1>Account Settings</h1>
                </div>
                <h5>Username</h5>
                <div id="search">
                    <input id ="new_username" type="text" placeholder={this.props.user[1]}></input>
                </div>
                 <h5>Email Address</h5>
                <div id="search">

                    <input id ="new_email" type="text" placeholder={this.props.user[2]}></input>
                </div>
                <button id ="save" onClick = {this.props.saveChanges}> Save Changes</button>
                <button id="cancel" onClick = {this.props.exitSettings}> Cancel </button>
            </div>
        );
         }

    }
}

class Navbar extends React.Component{

    render(){

        return <div id="nav">
            <button onClick = {this.props.seeChannels} id = "see_channels">See Channels</button>
             <button  onClick = {this.props.seeMessages} id = "see_messages"> See Messages</button>


        </div>


    }
}

class Reset extends React.Component{

    constructor(props){
        super(props);
        this.state ={
            error:null,
            success: false,
            user: null
        }
    }

    componentDidMount(){

        var myHeaders = new Headers();

        myHeaders.append("link", this.props.magic_link);
        return fetch('http://127.0.0.1:5000/api/passwordreset', {
            method: 'post',
            headers: myHeaders,
        }).then(response => response.json())
            .then((response) => {
                if (response.status == "ok"){
                    this.setState({
                        success: true,
                        user: response.user
                    })
                    localStorage.setItem("session_token", response.session_token)

                }else{
                    this.setState({
                        error: response.error
                    })
                }

            })
            .then()
            .catch((error) => {
                console.error(error);
            });

    }

    render(){
        if (this.state.success){
            return <Login load = {false} channel = {null} user={this.state.user} reset_p = {true}/>

        }

        else{
            return (<div id = "Home_channels_only">
                        <div id="channel_browse">
                            <div id="channel_head">
                                <h1>Verifying Link</h1>

                            </div>
                            <div id="channel_list">
                            </div>
                        </div>
                    </div>
                    )
        }



    }
}

class Belay extends React.Component {


    constructor(props){
        super(props);

    }



  render() {

    if (window.location.href.indexOf("channel") > -1){
            var channel = window.location.href.split("/")[4];
            return <Login load = {true} channel = {channel} magic = {null} user={null}/>


        }

    if (window.location.href.indexOf("magic") > -1){
            var link = window.location.href;
            window.history.pushState({"html": "index.html","pageTitle":"Belay"},"", "http://127.0.0.1:5000/")
            return <Reset magic_link = {link}  />


        }
    else{
        return <Login load= {false} channel = {null} magic = {null} user={null} />
    }


  }
}


ReactDOM.render(
  React.createElement(Belay),
  document.getElementById('root')
);
