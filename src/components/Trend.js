import React, { useEffect, useReducer } from "react";
import axios from "axios";
import Spinner from "./Spinner";

const reducer = (state, action) => {
  switch (action.type) {
    case "change_loading_status":
      return { ...state, isLoading: action.payload };
    case "add_errors":
      return { ...state, errors: action.payload };
    case "show_trends":  
      return { ...state, trends_words: action.payload, newRule: "" };
    default:
      return state;
  }
};

const Trend = () => {

  const initialState = { trends_words: [], isLoading: false, errors: [] };
  const [state, dispatch] = useReducer(reducer, initialState);

  const wordCloud = (selector) => {
    let d3 = window.d3;

    var fill = d3.scale.category20();
    var el = d3.select(selector);
    el.node().innerHTML = "";
    var width = el.node().offsetWidth;
    var height = el.node().offsetHeight;
    var translateX = width/2;
    var translateY = height/2;
    //Construct the word cloud's SVG element
    var svg = el.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate("+translateX+","+translateY+")");
    var tip = d3.select(document.body).append("div")
      .attr("class", "tooltip")				
      .style("opacity", 0);

    function draw(words) {
      debugger;
        var cloud = svg.selectAll("g text")
                          .data(words, function(d) { return d.text; })
  
          //Entering words
          cloud.enter()
              .append("text")
              .style("font-family", "Impact")
              .style("fill", function(d, i) { return fill(i); })
              .attr("text-anchor", "middle")
              .attr('font-size', 1)
              .text(function(d) { return d.text; })
              .on("mouseover", function(d) {		
                tip.transition()		
                    .duration(200)		
                    .style("opacity", .9);		
                tip.html(d.volume || 1)	
                    .style("left", (d3.event.pageX) + "px")		
                    .style("top", (d3.event.pageY) + "px");	
                })					
            .on("mouseout", function(d) {		
                tip.transition()		
                    .duration(500)		
                    .style("opacity", 0);	
            });
  
          //Entering and existing words
          cloud
              .transition()
                  .duration(600)
                  .style("font-size", function(d) { return d.size + "px"; })
                  .attr("transform", function(d) {
                      return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                  })
                  .style("fill-opacity", 1);
  
          //Exiting words
          cloud.exit()
              .transition()
                  .duration(200)
                  .style('fill-opacity', 1e-6)
                  .attr('font-size', 1)
                  .remove();
      }
  
  
      //Use the module pattern to encapsulate the visualisation code. We'll
      // expose only the parts that need to be public.
      return {
  
          //Recompute the word cloud for a new set of words. This method will
          // asycnhronously call draw when the layout has been computed.
          //The outside world will need to call this function, so make it part
          // of the wordCloud return value.
          update: function(words) {
              d3.layout.cloud().size([width, height])
                  .words(words)
                  .padding(5)
                  .rotate(function() { return ~~(Math.random() * 2) * 90; })
                  .font("Impact")
                  .fontSize(function(d) { return d.size; })
                  .on("end", draw)
                  .start();
          }
      }
  }


  const getTrends = () => {
    
    const { isLoading, trends_words } = state;
    if (!isLoading) {
      if(trends_words && trends_words.length > 0){
        let cloud = wordCloud("#trendCloud");
        cloud.update(trends_words);
      }
      else{
        return <Spinner />;
      }
    }
    else{
      return <Spinner />;
    }

  }

  useEffect(() => {
    const trendsURL = "/api/trends";

    (async () => {
      dispatch({ type: "change_loading_status", payload: true });
      try {
        const response = await axios.get(trendsURL);
        let { [0] : payload = [] } = response.data.body;
        let mx = 1;
        debugger;
        payload.trends.forEach(function(el){
          if(el.tweet_volume > mx){
            mx = el.tweet_volume;
          }
        });
        payload = payload.trends.map((el) => {return {text: el.name, size: (((el.tweet_volume || 1) /mx) * 30)+30, volume : el.tweet_volume}});
        //payload = payload.trends.map((el) => {return {text: el.name, size: el.tweet_volume || 1}});
        dispatch({
          type: "show_trends",
          payload,
        });
      }
      catch (e){
        dispatch({ type: "add_errors", payload: [e.response.data] });
      }
      dispatch({ type: "change_loading_status", payload: false });
    })();
  }, []);
  
  return (
    <div>
      <h2 className="ui">Twitter Trends</h2>
      <div id="trendCloud"></div>
      {getTrends()}
    </div>
  );
};

export default Trend;