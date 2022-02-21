# Twitch Plays Jeopardy With Machine Learning

## This project is currently abandoned but is on Github as a code example.

While I never got to the point where I could install Tenserflow and start mucking with the machine AI, this is a pretty good example of work I can do with the following tools:

* Node.js
* Websockets/Socket.io
* MongoDB
* Twitch API (and other third party APIs)
* JWT/Auth0
* Vue 3 w/ composition API



### A very experimental library/side project. 



This is a side-project designed to try my hand at machine learning with Tensorflow. 

Phase 1 is to create an interface with the jService.io API to retrieve and display Jeopardy questions via Websockets. 

Phase 2 would be to incorporate a Twitch Chat bot so that players may play Jeopardy.  Answers will be stored and scored in a database. 

At this phase, there will be many false positives and false negatives due to the string parsing done to make reasonable guesses about what people MEANT to write:

False positive: 
* Correct Answer: "Who is Benjamin Franklin"
* Provided Answer: "Who is Benjamin Button" 

False Negative:
* Correct Answer "Who is Henry VIII"
* Provided Answer: "Who is Henry Tudor" (or "Who is Henry The Eighth")

Phase 3 is to allow players of the game to mark "false positives" and "false negatives" and store that in a Mongo Database.  

Phase 4 is to analyze the false positives and false negatives and create a model in Tensorflow to create a better predictor of whether or not the answer is correct. 
