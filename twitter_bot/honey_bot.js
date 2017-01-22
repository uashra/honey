/*!
 * HoneyBot : A Twitter bot for doing suggestions for a tag
 * Created by Korhan Akcura
 */
 var Twit = require('twit');

 var post_id = "";
 var username = "";
 var search_items = "";
 var search_city = "";

 var Bot = new Twit({
 	consumer_key: 'X6hLoyhIU8xgiazHaFmfrGmcS',
 	consumer_secret: 'zEUi721iRdNyZ6mgpyHcaolJsnBtRm9Q3hFrKa9UcYIpL0CtMe',
 	access_token: '822863631469735936-Yqn8JXjwvVxVOaCHoYTwmFBFaATQ8GK', 
 	access_token_secret: 'xn6S6KaFGIqXoxoj5SUG5GygceHhbdqlDCpBBjSGdonTp'
 });

 console.log('Honey bot is running...');

/* BotSearchTag() : To retweet the matching recent tweet */
function BotSearchTag() {

	var query = {
		q: '#askYP',
		result_type: "recent"
	}

	Bot.get('search/tweets', query, BotSendSuggestions);
	//Bot.get('users/lookup', {'screen_name': 'HasiburR3'}, BotSendSuggestions);

	// Set an interval of 15 minutes (in microseconds)
	setInterval(BotSearchTag, 15*60*1000);
}

function BotSendSuggestions (error, data, response) {

	if (error) {
		console.log('Bot could not find latest tweets : ' + error);
	}
	else {

		var info = data.statuses[0];

		post_id = info.id_str;
		//var created_at = info.created_at;
		//var utc_offset = info.user.utc_offset; 
		
		username = "@" + info.user.screen_name;

		// Get Canadian cities
		var canada = require('canada');
		var cities = canada.cities.map(function(value,index) { return value[0];});

		// Group words
		var pos = require('pos');

		var search_text = info.text.replace('#askYP','').replace('@','').replace('#','');
		var words = new pos.Lexer().lex(search_text);
		var tagger = new pos.Tagger();
		var taggedWords = tagger.tag(words);
		for (i in taggedWords) {
		    var taggedWord = taggedWords[i];
		    var word = taggedWord[0];
		    var tag = taggedWord[1];

		    if(cities.indexOf(word.toUpperCase()) > -1){
		    	search_city += word + " ";
		    } else if (tag == "NN" || tag == "NNS"){

		    	search_items += word + " ";

		    }
		}

		var location = info.user.location;

		if(location != "") {
			Bot.get('geo/search', {query: location}, BotSendSuggestion);
		} else if (search_city != "") {
			Bot.get('geo/search', {query: search_city}, BotSendSuggestion);
		} else {
			//Default location
			Bot.get('geo/search', {query: "Montreal"}, BotSendSuggestion);
		}

	}
}

function BotSuggestionsSent(error, tweet, response) {
	if (error) {
		console.log('Bot send message : ' + error);
	}
	else {
		console.log('Bot sent '+post_id+' a reply : ' + username);
	}
}

function BotGetInformation(error, data, response) {
	if (!error && response.statusCode == 200) {
		//console.log(data.result.places[0].bounding_box.coordinates);
		return data.result.places[0].centroid;					
	} else {
		console.log('Bot information error : ' + error);
	}
}

function BotSendSuggestion(error, data, response) {
	if (!error && response.statusCode == 200) {

		var long = data.result.places[0].centroid[0];
		var lat = data.result.places[0].centroid[1];

		// Suggestion code
		var request = require('request');
		request.post(
			'http://hackaton.ypcloud.io/search',
			{ json: { "search":[{ "searchType":"PROXIMITY", "collection":"MERCHANT", "what": search_items, "where":{ "type":"GEO", "value":lat+","+long } }]} },
			function (error, response, body) {
				if (!error && response.statusCode == 200) {

					if (body.searchResult[0] != "" && body.searchResult[0].merchants) {

						var recommendation_text = username + " Closest recommendation is;\n"
						var businessName = "Business: "+body.searchResult[0].merchants[0].businessName+"\n";
						var address = "Address: "+body.searchResult[0].merchants[0].address.displayLine+"\n";
						var city = "City: "+body.searchResult[0].merchants[0].address.city+"\n";
						var phone = "Phone: "+body.searchResult[0].merchants[0].phones[0].phoneNumber+"\n";
						var website = username + " WebSite: "+body.searchResult[0].merchants[0].urls[0].text+"\n";

						recommendation_text += businessName + address;

						// Twitter limit
						if(recommendation_text.length <= 140){
							recommendation_text += city;
						}

						if(recommendation_text.length <= 140){
							recommendation_text += phone;
						}

						Bot.post('statuses/update', {'status': website, 'in_reply_to_status_id': post_id}, BotSuggestionsSent);		
						Bot.post('statuses/update', {'status': recommendation_text, 'in_reply_to_status_id': post_id}, BotSuggestionsSent);

					} else {
						Bot.post('statuses/update', {'status': username+' Please try another search phrase! \n We were not give you a recommendation result with the current one.', 'in_reply_to_status_id': post_id}, BotSuggestionsSent);	
					}
		
				}
			}
		);

	} else {
		console.log('Bot send error : ' + error);
	}

}

// Search the tags
BotSearchTag() ;
