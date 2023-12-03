""" Basic operations using Slack_sdk """

import os
from slack_sdk import WebClient 
from slack_sdk.errors import SlackApiError 

""" We need to pass the 'Bot User OAuth Token' """
slack_token = "xoxb-6286024765379-6308941406592-Cuax9lYGI7B9wcqcqgINlNvG"

# Creating an instance of the Webclient class
client = WebClient(token=slack_token)

try:
	# Posting a message in #random channel
	response = client.chat_postMessage(
    				channel="random",
    				text="Bot's first message")
	
	# Sending a message to a particular user
	response = client.chat_postEphemeral(
                    channel="random", 
                    text="Hello USERID0000", 
                    user="USERID0000")
	
	# Get basic information of the channel where our Bot has access 
	response = client.conversations_info(
                    channel="CHNLID0000")
	
	# Get a list of conversations
	response = client.conversations_list()
	print(response["channels"])
	
except SlackApiError as e:
	assert e.response["error"]
