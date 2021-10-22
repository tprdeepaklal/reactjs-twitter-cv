import React, { useEffect, useReducer } from "react";
import StreamController from "./StreamController";
import Tweet from "./Tweet";
import socketIOClient from "socket.io-client";
import ErrorMessage from "./ErrorMessage";
import Spinner from "./Spinner";

const reducer = (state, action) => {
  switch (action.type) {
    case "add_tweet":
      return {
        ...state,
        tweets: [action.payload, ...state.tweets],
        error: null,
        isWaiting: false,
        errors: [],
        _autoDisconnect: true
      };
    case "show_error":
      return { ...state, error: action.payload, isWaiting: false };
    case "add_errors":
      return { ...state, errors: action.payload, isWaiting: false };
    case "update_waiting":
      return { ...state, error: null, isWaiting: true };
    case "connect_socket":
      return { ...state, _socket: action.payload, _socketConnection : true, isWaiting: false};
    case "disconnect_socket" : 
      return { ...state, _socketConnection: false, isWaiting:false, _autoDisconnect : false};
    default:
      return state;
  }
};

const TweetFeed = () => {
  const initialState = {
    tweets: [],
    error: {},
    isWaiting: true,
    _socket: null,
    _autoDisconnect : false,
    _socketConnection : false,
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const { tweets, error, isWaiting, _socket, _autoDisconnect, _socketConnection } = state;

  const streamTweets = () => {
    if(_socket){
      _socket.connect();
      return;
    }
    let socket;
    
    if (process.env.NODE_ENV === "development") {
      socket = socketIOClient("/streamData");
    } else {
      socket = socketIOClient("/");
    }

    socket.on("connect", () => {
      debugger;
      dispatch({type: "connect_socket", payload: socket});
    });
    socket.on("tweet", (json) => {
      if (json.data) {
        dispatch({ type: "add_tweet", payload: json});
      }
    });
    socket.on("heartbeat", (data) => {
      dispatch({ type: "update_waiting" });
    });
    socket.on("error", (data) => {
      dispatch({ type: "show_error", payload: data });
    });
    socket.on("authError", (data) => {
      console.log("data =>", data);
      dispatch({ type: "add_errors", payload: [data] });
    });
    return socket;
  };

  const reconnectMessage = () => {
    const message = {
      title: "Reconnecting",
      detail: "Please wait while we reconnect to the stream.",
    };

    if ((error && error.detail)) {
      return (
        <div>
          
          <ErrorMessage key={error.title} error={error} styleType="warning" />
          <Spinner />
          <ErrorMessage
            key={message.title}
            error={message}
            styleType="success"
          />
          
        </div>
      );
    }
  };

  const errorMessage = () => {
    const { errors } = state;

    if (errors && errors.length > 0) {
      return errors.map((error) => (
        <ErrorMessage key={error.title} error={error} styleType="negative" />
      ));
    }
  };

  const waitingMessage = () => {
    const message = {
      title: "Still working",
      detail: "Waiting for new Tweets to be posted",
    };

    if (isWaiting) {
      return (
        <React.Fragment>
          <div>
          <Spinner />
            <ErrorMessage
              key={message.title}
              error={message}
              styleType="success"
            />
            
          </div>
          
        </React.Fragment>
      );
    }
  };

  useEffect(() => {
    //streamTweets();
  },[]);

  const showTweets = () => {
    if (tweets.length > 0) {
      if((tweets.length % 15) === 0 && _autoDisconnect){
        debugger;
        autoDisconnect();
      }
      return (
        <div className="ui items">
        <React.Fragment>
          {tweets.map((tweet) => (
            <Tweet key={tweet.data.id} json={tweet} />
          ))}
        </React.Fragment>
        </div>
      );
    }
  };

  const disconnectSocket = () => {
    _socket.disconnect();
    dispatch({type: "disconnect_socket"});
  }

  const autoDisconnect = () => {
    disconnectSocket();
    let el = document.getElementById("ct_btn");
    let icon = el.querySelector(".icon");
    let txt = el.querySelector("span");
    txt.innerText = "Start Steam";
    icon.classList.remove("stop");
    icon.classList.add("play");
  }

  const toggleConnection = () => {
    let el = document.getElementById("ct_btn");
    let icon = el.querySelector(".icon");
    let txt = el.querySelector("span");
    if(_socketConnection){
      disconnectSocket();
      txt.innerText = "Start Steam";
      icon.classList.remove("stop");
      icon.classList.add("play");
      return false;
    }
    debugger;
    streamTweets();
    txt.innerText = "Stop Steam";
    icon.classList.remove("play");
    icon.classList.add("stop");
    return true;
  }

  return (
    <div>
      <StreamController 
        callback={() => toggleConnection()}
      />
      {reconnectMessage()}
      {errorMessage()}
      {waitingMessage()}
      {showTweets()}
    </div>
  );
};

export default TweetFeed;